import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiMail, FiPhone, FiCpu, FiShield, FiTrendingUp } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-indigo-900/10 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <FiHome className="text-white text-xl" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xl tracking-tight leading-none block">
                  Estate<span className="text-primary-400">Hub</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-400 tracking-wider uppercase block">Smart AI Real Estate</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              India's premier AI-powered property marketplace. Discover real-time market valuations, predictive pricing algorithms, and verified property listings.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <FiCpu size={13} className="text-purple-400" /> Random Forest ML
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <FiShield size={13} className="text-emerald-400" /> 100% Verified
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                ['/', 'Home'],
                ['/properties', 'Browse Properties'],
                ['/login', 'Account Login'],
                ['/register', 'Register New Account']
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-slate-400 hover:text-purple-400 text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="text-xs group-hover:translate-x-1 transition-transform">→</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact & Support</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-slate-400 text-sm">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                  <FiMail size={14} />
                </div>
                <span>support@estatehub.ai</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400 text-sm">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                  <FiPhone size={14} />
                </div>
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} EstateHub. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with Django REST</span> · <span>Vite React</span> · <span>Scikit-Learn ML</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
