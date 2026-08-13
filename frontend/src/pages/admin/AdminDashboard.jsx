import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiHome, FiMessageSquare, FiCpu, FiDatabase } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import StatCard from '../../components/common/StatCard';
import { mlService, authService, propertyService, inquiryService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, properties: 0, inquiries: 0 });
  const [mlStats, setMlStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mlRes, userRes, propRes, inqRes] = await Promise.all([
          mlService.getAdminStats().catch(() => ({ data: {} })),
          authService.adminGetUsers().catch(() => ({ data: { total: 0 } })),
          propertyService.getAll({ page_size: 1 }).catch(() => ({ data: { count: 0 } })),
          inquiryService.getAllInquiries({ limit: 1 }).catch(() => ({ data: { totalDocs: 0 } })),
        ]);
        setMlStats(mlRes.data);
        setStats({
          users: userRes.data.total ?? userRes.data.users?.length ?? 0,
          properties: propRes.data.count ?? propRes.data.results?.length ?? 0,
          inquiries: inqRes.data.totalDocs ?? inqRes.data.total ?? 0,
        });
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const mlChartData = {
    labels: ['Seller Predictions', 'Buyer Predictions'],
    datasets: [{
      data: [mlStats?.seller_predictions || 0, mlStats?.buyer_predictions || 0],
      backgroundColor: ['#7c3aed', '#c084fc'],
      borderWidth: 0,
    }]
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Admin Dashboard</h1>
        <p className="page-sub">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiUsers} label="Total Users" value={stats.users} color="purple" />
        <StatCard icon={FiHome} label="Properties" value={stats.properties} color="blue" />
        <StatCard icon={FiMessageSquare} label="Inquiries" value={stats.inquiries} color="green" />
        <StatCard icon={FiCpu} label="ML Predictions" value={mlStats?.total_predictions || 0} color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiCpu size={15} /> ML Predictions</h3>
          {mlStats?.total_predictions > 0 ? (
            <div style={{ height: 200 }}>
              <Doughnut data={mlChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No predictions yet</div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiDatabase size={15} /> ML Model Info</h3>
          {mlStats?.model_info ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Best Model</span>
                <span className="font-semibold capitalize">{mlStats.model_info.model_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">R² Score</span>
                <span className="font-semibold text-green-600">{mlStats.model_info.metrics?.r2}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">MAE</span>
                <span className="font-semibold">₹{Number(mlStats.model_info.metrics?.mae || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">RMSE</span>
                <span className="font-semibold">₹{Number(mlStats.model_info.metrics?.rmse || 0).toLocaleString('en-IN')}</span>
              </div>
              {mlStats.model_info.all_models && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">All Models</p>
                  {Object.entries(mlStats.model_info.all_models).map(([name, m]) => (
                    <div key={name} className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 capitalize">{name.replace('_', ' ')}</span>
                      <span className="font-medium">R²: {m.r2}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <FiCpu size={30} className="mx-auto mb-2 text-gray-300" />
              Model not trained yet.<br />
              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded mt-2 inline-block">cd ml && python train_model.py</code>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: 'http://localhost:8000/swagger/', label: '📖 Swagger API' },
            { href: 'http://localhost:8000/admin/', label: '⚙️ Django Admin' },
            { href: '/admin/users', label: '👥 Manage Users' },
            { href: '/admin/ml', label: '🤖 ML Stats' },
          ].map(({ href, label }) => (
            href.startsWith('http') ? (
              <a key={href} href={href} target="_blank" rel="noreferrer"
                className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 text-center transition-colors">
                {label}
              </a>
            ) : (
              <Link key={href} to={href}
                className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 text-center transition-colors">
                {label}
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
