import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiMapPin, FiCpu, FiCheckCircle } from 'react-icons/fi';
import { mlService } from '../../services/api';
import { formatPrice, getErrorMessage } from '../../utils/formatters';
import { toast } from 'react-toastify';

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Surat'];
const TYPES = ['Apartment','Villa','House','Farm','Office','Commercial','Industrial'];

export default function BudgetEstimator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      city: 'Mumbai', property_type: 'Apartment',
      bedrooms: 2, bathrooms: 2, parking: 1, budget: 5000000
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await mlService.predictBuyer({
        ...data,
        budget: Number(data.budget),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        parking: Number(data.parking),
      });
      setResult(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-header flex items-center gap-2"><FiDollarSign size={22} className="text-primary-600" /> Budget Estimator</h1>
        <p className="page-sub">Enter your requirements and find out what you can get</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Requirements</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Your Budget (₹) *</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input type="number" className="input-field pl-9" placeholder="5000000" min={100000}
                  {...register('budget', { required: true, min: 100000 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <select className="input-field" {...register('city', { required: true })}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Property Type</label>
                <select className="input-field" {...register('property_type')}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bedrooms</label>
                <input type="number" className="input-field" min={1} max={10} {...register('bedrooms')} />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input type="number" className="input-field" min={1} max={10} {...register('bathrooms')} />
              </div>
              <div>
                <label className="label">Parking</label>
                <input type="number" className="input-field" min={0} max={5} {...register('parking')} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analysing...</>
                : <><FiCpu size={15} /> Estimate Budget</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Main result */}
                <div className="glass-card p-6 text-center bg-gradient-to-br from-primary-50 to-white">
                  <FiCpu size={28} className="text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Estimated Market Price</p>
                  <p className="text-3xl font-bold text-primary-700">{formatPrice(result.estimated_market_price)}</p>
                  <span className={`badge mt-2 capitalize ${
                    result.budget_fit === 'perfect' ? 'badge-green' :
                    result.budget_fit === 'tight' ? 'badge-yellow' : 'badge-purple'
                  }`}>
                    Budget: {result.budget_fit}
                  </span>
                </div>

                {/* Area recommendation */}
                <div className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <FiMapPin size={18} className="text-primary-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-gray-800 mb-1">Area Recommendation</p>
                      <p className="text-sm text-gray-600">{result.area_recommendation}</p>
                      <p className="text-xs text-primary-700 font-semibold mt-1">
                        ~{result.recommended_area_sqft?.toLocaleString()} sqft for your budget
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nearby localities */}
                {result.nearby_localities?.length > 0 && (
                  <div className="glass-card p-4">
                    <p className="font-semibold text-sm text-gray-800 mb-3">Suggested Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {result.nearby_localities.map(l => (
                        <span key={l} className="bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                          <FiCheckCircle size={10} /> {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price breakdown */}
                {result.price_breakdown && (
                  <div className="glass-card p-4">
                    <p className="font-semibold text-sm text-gray-800 mb-3">Cost Breakdown</p>
                    <div className="space-y-2">
                      {[
                        ['Base Property', result.price_breakdown.base_property],
                        ['Registration Charges', result.price_breakdown.registration_charges],
                        ['Stamp Duty', result.price_breakdown.stamp_duty],
                        ['Miscellaneous', result.price_breakdown.misc],
                      ].map(([label, val]) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-gray-500">{label}</span>
                          <span className="font-semibold">{formatPrice(val)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-bold">
                        <span>Total Estimated</span>
                        <span className="text-primary-700">{formatPrice(result.estimated_market_price)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-10 text-center">
              <FiDollarSign size={40} className="text-primary-200 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">Enter your requirements</p>
              <p className="text-xs text-gray-400 mt-1">AI will recommend what you can afford</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
