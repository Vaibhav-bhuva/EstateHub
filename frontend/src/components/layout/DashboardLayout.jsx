import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiGrid, FiList, FiPlusSquare, FiMessageSquare,
  FiHeart, FiUser, FiCpu, FiUsers, FiBarChart2,
  FiFileText, FiLogOut, FiMenu, FiX, FiBell, FiDollarSign
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useWishlist } from '../../hooks/useWishlist';

const sellerLinks = [
  { to: '/seller/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/seller/properties', icon: FiList, label: 'My Properties' },
  { to: '/seller/properties/add', icon: FiPlusSquare, label: 'Add Property' },
  { to: '/seller/inquiries', icon: FiMessageSquare, label: 'Inquiries' },
  { to: '/seller/price-estimator', icon: FiCpu, label: 'AI Estimator' },
  { to: '/seller/profile', icon: FiUser, label: 'Profile' },
];

const buyerLinks = [
  { to: '/buyer/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/properties', icon: FiHome, label: 'Browse Properties' },
  { to: '/buyer/wishlist', icon: FiHeart, label: 'Wishlist' },
  { to: '/buyer/inquiries', icon: FiMessageSquare, label: 'My Inquiries' },
  { to: '/buyer/budget-estimator', icon: FiDollarSign, label: 'Budget Estimator' },
  { to: '/buyer/profile', icon: FiUser, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/properties', icon: FiList, label: 'Properties' },
  { to: '/admin/inquiries', icon: FiMessageSquare, label: 'Inquiries' },
  { to: '/admin/ml', icon: FiCpu, label: 'ML Stats' },
  { to: '/admin/logs', icon: FiFileText, label: 'Logs' },
];

const linksMap = { seller: sellerLinks, buyer: buyerLinks, admin: adminLinks };

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { items: wishlistItems } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const links = linksMap[role] || [];

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-purple-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-400 flex items-center justify-center">
            <FiHome className="text-white text-lg" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-primary-800 text-base block">EstateHub</span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-sm">
            {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== `/${role}/dashboard` && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-primary-700 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
            >
              <Icon size={16} />
              {label}
              {label === 'Wishlist' && role === 'buyer' && wishlistItems.length > 0 && (
                <span className={`ml-auto text-xs rounded-full px-2 py-0.5 font-bold ${active ? 'bg-white text-primary-700' : 'bg-rose-100 text-rose-600'}`}>
                  {wishlistItems.length}
                </span>
              )}
              {label === 'Inquiries' && role === 'seller' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-purple-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiLogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-purple-100 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-purple-100 h-14 flex items-center justify-between px-4 flex-shrink-0">
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </button>
          <div className="flex-1 md:px-4">
            <h2 className="text-sm font-semibold text-gray-700 capitalize">
              {role} Portal
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="relative">
                <FiBell size={18} className="text-gray-500" />
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
            <Link to="/" className="text-xs text-gray-500 hover:text-primary-700 transition-colors hidden sm:block">
              ← Back to site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
