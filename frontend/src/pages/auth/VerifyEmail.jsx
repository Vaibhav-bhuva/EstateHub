import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';
import { getErrorMessage } from '../../utils/formatters';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.verifyEmail({ email: data.email, otp: data.otp });
      setVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await authService.resendOTP({ email });
      toast.success('New OTP sent!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8 text-center">
          {verified ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-500 text-sm">Redirecting to login...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMail size={28} className="text-primary-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                We sent a 6-digit OTP to <strong>{email || 'your email'}</strong>. Enter it below.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                {!email && (
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input-field" {...register('email', { required: true })} />
                  </div>
                )}
                <div>
                  <label className="label text-center block">Enter OTP</label>
                  <input type="text" maxLength={6}
                    className="input-field text-center tracking-widest text-2xl font-bold"
                    placeholder="• • • • • •"
                    {...register('otp', { required: 'OTP required', minLength: { value: 6, message: '6 digits' } })} />
                  {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Verify Email'}
                </button>
              </form>
              <button onClick={resendOTP} className="text-sm text-primary-600 hover:underline mt-4 block mx-auto">
                Didn't receive? Resend OTP
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
