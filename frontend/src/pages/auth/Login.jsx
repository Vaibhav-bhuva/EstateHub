import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/formatters';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { FiGithub } from 'react-icons/fi';

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleOAuthLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const user = await googleLogin(tokenResponse.access_token, 'buyer');
        toast.success(`Welcome back, ${user.first_name || 'User'}!`);
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
    sessionStorage.setItem('oauth_role', 'buyer');
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'dummy_github_id';
    const redirectUri = `${window.location.origin}/auth/github/callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email, password, rememberMe }) => {
    setLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      toast.success(`Welcome back, ${user.first_name || 'User'}!`);
      if (user.role === 'seller') navigate('/seller/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/buyer/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: `${100 + i * 80}px`, height: `${100 + i * 80}px`, top: `${10 + i * 15}%`, left: `${-20 + i * 25}%`, opacity: 0.05 + i * 0.05 }} />
          ))}
        </div>
        <div className="relative text-white text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/30">
            <FiHome size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">EstateHub</h1>
          <p className="text-xl text-white/80 font-light mb-8">Smart Property. Smart Prediction.</p>
          <div className="space-y-4 text-left">
            {['AI-powered price predictions', 'Thousands of verified properties', 'Instant inquiry system', 'Real-time market insights'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-400 flex items-center justify-center">
                  <FiHome className="text-white text-lg" />
                </div>
                <span className="font-bold text-primary-800 text-xl">EstateHub</span>
              </Link>
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="email"
                    className="input-field pl-9"
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                    })}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pl-9 pr-10"
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded text-primary-700" {...register('rememberMe')} />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-700 hover:underline">Forgot password?</Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : 'Sign In'}
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
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-700 font-semibold hover:underline">Create account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
