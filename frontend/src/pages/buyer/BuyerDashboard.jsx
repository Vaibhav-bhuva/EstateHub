import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiSearch, FiTrendingUp, FiDollarSign, FiHome } from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import PropertyCard from '../../components/property/PropertyCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { propertyService, wishlistService, inquiryService, cityService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [inquiryCount, setInquiryCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [cityCount, setCityCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [trendRes, recRes, inqRes, propRes, cityRes] = await Promise.all([
          propertyService.getTrending(),
          propertyService.getRecommendations().catch(() => ({ data: { results: [] } })),
          inquiryService.getBuyerInquiries({ limit: 1 }).catch(() => ({ data: { totalDocs: 0 } })),
          propertyService.getAll({ page_size: 1 }).catch(() => ({ data: { count: 0 } })),
          cityService.getAll().catch(() => ({ data: { total: 0 } })),
        ]);
        setTrending(trendRes.data.results || trendRes.data || []);
        setRecommendations(recRes.data.results || recRes.data || []);
        setInquiryCount(inqRes.data.totalDocs || 0);
        setAvailableCount(propRes.data.count ?? propRes.data.results?.length ?? 0);
        setCityCount(cityRes.data.total ?? cityRes.data.cities?.length ?? 0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Dashboard</h1>
        <p className="page-sub">Welcome, {user?.first_name}! Explore properties for you.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiHeart} label="Saved Properties" value={wishlistItems.length} color="red" />
        <StatCard icon={FiMessageSquare} label="My Inquiries" value={inquiryCount} color="purple" />
        <StatCard icon={FiSearch} label="Properties Available" value={availableCount} color="blue" />
        <StatCard icon={FiTrendingUp} label="Cities Covered" value={cityCount} color="green" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/properties', icon: FiSearch, label: 'Browse Properties', color: 'bg-primary-700 text-white' },
          { to: '/buyer/wishlist', icon: FiHeart, label: 'My Wishlist', color: 'bg-red-50 text-red-600' },
          { to: '/buyer/inquiries', icon: FiMessageSquare, label: 'Inquiries', color: 'bg-purple-50 text-purple-700' },
          { to: '/buyer/budget-estimator', icon: FiDollarSign, label: 'Budget Estimator', color: 'bg-green-50 text-green-700' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`${color} p-4 rounded-2xl flex flex-col items-center gap-2 text-center hover:scale-105 transition-transform shadow-sm`}>
            <Icon size={22} />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recommended for You</h2>
          <Link to="/properties" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recommendations.length > 0 ? recommendations : trending).slice(0, 6).map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      {/* Trending */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Trending Properties</h2>
          <Link to="/properties?sort=most_viewed" className="text-sm text-primary-600 hover:underline">See more →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.slice(0, 4).map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
