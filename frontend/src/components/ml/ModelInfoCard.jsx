import React, { useEffect, useState } from 'react';
import { FiCpu, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { mlService } from '../../services/api';

/**
 * Shows current ML model status, type, and metrics in a compact card.
 */
export default function ModelInfoCard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mlService.getModelInfo()
      .then(r => setInfo(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );

  if (!info || info.status === 'not_trained') return (
    <div className="glass-card p-4 flex items-center gap-3 border border-yellow-200 bg-yellow-50">
      <FiAlertCircle size={20} className="text-yellow-500 flex-shrink-0" />
      <div>
        <p className="text-sm font-semibold text-yellow-700">ML Model Not Trained</p>
        <p className="text-xs text-yellow-600 mt-0.5">Run: <code className="bg-yellow-100 px-1 rounded">python train_model.py</code></p>
      </div>
    </div>
  );

  return (
    <div className="glass-card p-4 flex items-center gap-3 border border-green-200 bg-green-50">
      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <FiCpu size={18} className="text-green-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-green-800 capitalize">
            {info.model_type?.replace(/_/g, ' ')}
          </p>
          <FiCheckCircle size={13} className="text-green-600" />
        </div>
        <div className="flex gap-3 mt-0.5 text-xs text-green-700">
          <span>R² {info.metrics?.r2}</span>
          <span>MAE ₹{Number(info.metrics?.mae || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
    </div>
  );
}
