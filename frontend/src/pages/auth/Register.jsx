import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/formatters';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { FiGithub } from 'react-icons/fi';

export default function Register() {
  const { register: registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'buyer' } });
  const selectedRole = watch('role');

  const googleOAuthLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const user = await googleLogin(tokenResponse.access_token, selectedRole);
        toast.success(`Welcome, ${user.first_name || 'User'}!`);
        if (user.role === 'seller') navigate('/seller/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/buyer/dashboard');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google login failed')
  });

  const handleGithubLogin = () => {
    sessionStorage.setItem('oauth_role', selectedRole);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'dummy_github_id';
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser(data);
      toast.success(`Welcome, ${user.first_name || 'User'}! Account created successfully.`);
      if (user.role === 'seller') navigate('/seller/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="flex items-center gap-2 justify-center mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-400 flex items-center justify-center">
                <FiHome className="text-white text-lg" />
              </div>
              <span className="font-bold text-primary-800 text-xl">EstateHub</span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Join the AI-powered real estate platform</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'buyer', label: '🏠 Buyer', desc: 'Browse & buy properties' },
              { value: 'seller', label: '🏢 Seller', desc: 'List & sell properties' },
            ].map(r => (
              <label key={r.value}
                className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedRole === r.value
                    ? 'border-primary-700 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200'
                }`}>
                <input type="radio" value={r.value} className="hidden" {...register('role')} />
                <span className="text-xl mb-1">{r.label}</span>
                <span className="text-xs text-gray-500 text-center">{r.desc}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" className="input-field pl-9" placeholder="John"
                    {...register('first_name', { required: 'Required' })} />
                </div>
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" className="input-field pl-9" placeholder="Doe"
                    {...register('last_name', { required: 'Required' })} />
                </div>
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="email" className="input-field pl-9" placeholder="you@example.com"
                  {...register('email', { required: 'Email required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="tel" className="input-field pl-9" placeholder="Enter 10-digit mobile number"
                  {...register('phone', {
                    validate: (val) => !val || /^[6-9]\d{9}$/.test(val) || 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
                  })} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type={showPw ? 'text' : 'password'} className="input-field pl-9 pr-10" placeholder="Min 8 characters"
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="password" className="input-field pl-9" placeholder="Re-enter password"
                  {...register('confirm_password', {
                    required: 'Please confirm password',
                    validate: v => v === watch('password') || 'Passwords do not match'
                  })} />
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button onClick={() => googleOAuthLogin()} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
              <FcGoogle size={20} />
              <span className="text-sm font-semibold text-gray-700">Google</span>
            </button>
            <button onClick={handleGithubLogin} type="button" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm bg-[#24292e] hover:bg-[#2f363d] text-white">
              <FiGithub size={20} />
              <span className="text-sm font-semibold">GitHub</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
