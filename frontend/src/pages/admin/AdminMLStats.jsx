import React, { useEffect, useState } from 'react';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';
import { mlService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';

export default function AdminMLStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mlService.getAdminStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header flex items-center gap-2"><FiCpu size={20} /> ML Statistics</h1>
        <p className="page-sub">Machine learning model performance and usage</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={FiCpu} label="Total Predictions" value={stats?.total_predictions || 0} color="purple" />
        <StatCard icon={FiCpu} label="Seller Predictions" value={stats?.seller_predictions || 0} color="blue" />
        <StatCard icon={FiCpu} label="Buyer Predictions" value={stats?.buyer_predictions || 0} color="green" />
      </div>

      {stats?.model_info ? (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Model Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Best Model', value: stats.model_info.model_type?.replace(/_/g, ' ') },
              { label: 'R² Score', value: stats.model_info.metrics?.r2 },
              { label: 'MAE', value: `₹${Number(stats.model_info.metrics?.mae || 0).toLocaleString('en-IN')}` },
              { label: 'RMSE', value: `₹${Number(stats.model_info.metrics?.rmse || 0).toLocaleString('en-IN')}` },
            ].map(m => (
              <div key={m.label} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                <p className="font-bold text-gray-800 capitalize">{m.value}</p>
              </div>
            ))}
          </div>

          {stats.model_info.all_models && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Model Comparison</h4>
              <div className="space-y-3">
                {Object.entries(stats.model_info.all_models).map(([name, m]) => (
                  <div key={name} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm capitalize">{name.replace(/_/g, ' ')}</span>
                      <span className="text-sm font-bold text-primary-700">R² = {m.r2}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-700 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(m.r2 * 100, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>MAE: ₹{Number(m.mae || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <FiCpu size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">Model not trained</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">Run the training script to enable ML predictions</p>
          <code className="text-xs bg-gray-100 px-4 py-2 rounded-lg block max-w-sm mx-auto">
            cd ml && python train_model.py
          </code>
        </div>
      )}
    </div>
  );
}
