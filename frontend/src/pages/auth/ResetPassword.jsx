import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiLock, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';
import { getErrorMessage } from '../../utils/formatters';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: location.state?.email || '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword({
        email: data.email, otp: data.otp,
        new_password: data.new_password, confirm_password: data.confirm_password,
      });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiLock size={28} className="text-primary-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Enter the OTP from your email and set a new password.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                {...register('email', { required: 'Required' })} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">OTP Code</label>
              <input type="text" className="input-field tracking-widest text-center text-lg"
                maxLength={6} placeholder="123456"
                {...register('otp', { required: 'OTP required', minLength: { value: 6, message: '6 digits' } })} />
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>}
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input-field" placeholder="Min 8 characters"
                {...register('new_password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
              {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input-field"
                {...register('confirm_password', {
                  required: 'Required',
                  validate: v => v === watch('new_password') || 'Passwords do not match'
                })} />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-primary-700 mt-5">
            <FiArrowLeft size={13} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
