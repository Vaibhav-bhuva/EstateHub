import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';
import { getErrorMessage } from '../../utils/formatters';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      toast.success('OTP sent to your email!');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiMail size={28} className="text-primary-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your registered email and we'll send an OTP.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input type="email" className="input-field pl-9" placeholder="you@example.com"
                  {...register('email', { required: 'Email required' })} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Send OTP'}
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
