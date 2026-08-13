import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { inquiryService } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/formatters';

export default function InquiryForm({ property, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      message: `Hi, I am interested in your property "${property?.title}". Please share more details.`,
    }
  });

  const onSubmit = async (data) => {
    if (!user) { toast.error('Please login to send an inquiry.'); return; }
    setLoading(true);
    try {
      await inquiryService.create({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyCity: property.city,
        sellerId: property.seller?.id || property.seller,
        sellerEmail: property.seller?.email,
        sellerName: property.seller?.first_name ? `${property.seller.first_name} ${property.seller.last_name}` : '',
        message: data.message,
        buyerPhone: data.phone,
        requirements: {
          budget: data.budget ? Number(data.budget) : undefined,
          visitDate: data.visitDate || undefined,
        },
      });
      toast.success('Inquiry sent! The seller will contact you soon.');
      if (onClose) onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 text-primary-700 mb-4">
        <FiMessageSquare size={18} />
        <h3 className="font-semibold">Send Inquiry</h3>
      </div>

      <div>
        <label className="label">Your Phone</label>
        <input type="tel" className="input-field" placeholder="Enter 10-digit mobile number"
          {...register('phone', {
            validate: (val) => !val || /^[6-9]\d{9}$/.test(val) || 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
          })} />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="label">Your Budget (₹)</label>
        <input type="number" className="input-field" placeholder="5000000"
          {...register('budget')} />
      </div>

      <div>
        <label className="label">Preferred Visit Date</label>
        <input type="date" className="input-field"
          min={new Date().toISOString().split('T')[0]}
          {...register('visitDate')} />
      </div>

      <div>
        <label className="label">Message *</label>
        <textarea
          rows={4}
          className="input-field resize-none"
          placeholder="Tell the seller what you're looking for..."
          {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Min 10 characters' } })}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <FiSend size={14} /> Send Inquiry
          </>
        )}
      </button>
    </form>
  );
}
