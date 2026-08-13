import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  FiHome, FiEye, FiMessageSquare, FiHeart, FiPlus,
  FiCheckCircle, FiClock, FiArchive
} from 'react-icons/fi';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { propertyService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: '#f3f4f6' } },
  },
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const { notifications, fetchAll: fetchNotifications, loading: notifLoading } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService.getSellerDashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    fetchNotifications();
  }, []);

  if (loading) return <LoadingSpinner />;

  const labels = stats?.monthly_views?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const viewsData = {
    labels,
    datasets: [{
      label: 'Views',
      data: stats?.monthly_views?.views || [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(124,58,237,0.15)',
      borderColor: '#7c3aed',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }],
  };

  const inquiryData = {
    labels,
    datasets: [{
      label: 'Inquiries',
      data: stats?.monthly_views?.inquiries || [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(168,85,247,0.7)',
      borderRadius: 8,
    }],
  };

  const typeData = {
    labels: Object.keys(stats?.property_type_dist || {}),
    datasets: [{
      data: Object.values(stats?.property_type_dist || {}),
      backgroundColor: ['#7c3aed', '#a855f7', '#c084fc', '#e879f9', '#f0abfc', '#ddd6fe', '#ede9fe'],
      borderWidth: 0,
    }],
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="page-sub">Welcome back, {user?.first_name}! Here's your overview.</p>
        </div>
        <Link to="/seller/properties/add" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={15} /> Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiHome}         label="Total Properties" value={stats?.total || 0}            color="purple" />
        <StatCard icon={FiCheckCircle}  label="Available"        value={stats?.available || 0}        color="green"  />
        <StatCard icon={FiClock}        label="Sold"             value={stats?.sold || 0}              color="orange" />
        <StatCard icon={FiArchive}      label="Archived"         value={stats?.archived || 0}          color="indigo" />
        <StatCard icon={FiEye}          label="Total Views"      value={(stats?.total_views || 0).toLocaleString()} color="blue" />
        <StatCard icon={FiMessageSquare}label="Total Inquiries"  value={stats?.total_inquiries || 0}  color="purple" />
        <StatCard icon={FiHeart}        label="Total Saved"      value={stats?.total_saved || 0}       color="red"    />
        <StatCard icon={FiHome}         label="Rented"           value={stats?.rented || 0}            color="green"  />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Property Views</h3>
          <div style={{ height: 200 }}>
            <Line data={viewsData} options={CHART_OPTS} />
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Property Types</h3>
          {Object.keys(stats?.property_type_dist || {}).length > 0 ? (
            <div style={{ height: 200 }}>
              <Doughnut data={typeData} options={{
                ...CHART_OPTS,
                plugins: { legend: { display: true, position: 'bottom', labels: { font: { size: 10 } } } },
              }} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Inquiries</h3>
          <div style={{ height: 180 }}>
            <Bar data={inquiryData} options={CHART_OPTS} />
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <RecentActivity notifications={notifications} loading={notifLoading} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/seller/properties/add', icon: FiPlus,          label: 'Add Property',  color: 'bg-primary-700 text-white' },
          { to: '/seller/properties',     icon: FiHome,           label: 'My Properties', color: 'bg-purple-50 text-primary-700' },
          { to: '/seller/inquiries',      icon: FiMessageSquare,  label: 'Inquiries',     color: 'bg-purple-50 text-primary-700' },
          { to: '/seller/price-estimator',icon: FiEye,            label: 'AI Estimator',  color: 'bg-purple-50 text-primary-700' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`${color} p-4 rounded-2xl flex flex-col items-center gap-2 text-center hover:scale-105 transition-transform shadow-sm`}>
            <Icon size={22} />
            <span className="text-xs font-semibold">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
