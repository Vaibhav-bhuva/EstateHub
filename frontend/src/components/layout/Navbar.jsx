import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiGrid, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const dashboardLink = user?.role === 'seller'
    ? '/seller/dashboard'
    : user?.role === 'admin'
    ? '/admin/dashboard'
    : '/buyer/dashboard';

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-purple-100/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-300">
              <FiHome className="text-white text-xl" />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-slate-900 text-xl tracking-tight leading-none block group-hover:text-primary-700 transition-colors">
                Estate<span className="text-primary-600">Hub</span>
              </span>
              <span className="text-[10px] font-semibold text-primary-600 tracking-wider uppercase block">AI Real Estate</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-purple-50/50 p-1.5 rounded-2xl border border-purple-100/50">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/')
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-primary-700 hover:bg-white/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/properties')
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-primary-700 hover:bg-white/60'
              }`}
            >
              Properties
            </Link>
            {user && (
              <Link
                to={dashboardLink}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  location.pathname.includes('dashboard') || location.pathname.includes('seller') || location.pathname.includes('buyer') || location.pathname.includes('admin')
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-primary-700 hover:bg-white/60'
                }`}
              >
                <FiGrid size={15} /> Dashboard
              </Link>
            )}
          </div>

          {/* Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 px-3.5 py-1.5 rounded-2xl transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-700 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.first_name?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <div className="text-left leading-tight max-w-28 truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {user.first_name || user.email.split('@')[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-primary-600 capitalize block">
                      {user.role}
                    </span>
                  </div>
                  <FiChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-14 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100 py-2 w-52 z-50"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.first_name} {user.last_name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to={dashboardLink} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-primary-700 transition-colors">
                          <FiGrid size={15} /> Dashboard
                        </Link>
                        <Link to={user.role === 'seller' ? '/seller/profile' : user.role === 'admin' ? '/admin/dashboard' : '/buyer/profile'}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-primary-700 transition-colors">
                          <FiUser size={15} /> Profile Settings
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                          <FiLogOut size={15} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login" className="btn-secondary text-sm py-2 px-5 rounded-xl">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5 rounded-xl shadow-md shadow-primary-500/20">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-700 p-2 rounded-xl hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <Link to="/" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-primary-700">Home</Link>
              <Link to="/properties" onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-slate-700 hover:text-primary-700">Properties</Link>
              {user ? (
                <>
                  <Link to={dashboardLink} onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-primary-700">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2 text-sm font-semibold text-rose-600">Logout</button>
                </>
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary text-center text-sm py-2">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-center text-sm py-2">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
