import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { formatPrice } from '../../utils/formatters';

/**
 * Visual gauge component to display AI price prediction result.
 */
export default function PriceGauge({ result }) {
  if (!result) return null;

  const { estimated_price, price_range, confidence, recommendation, r2_score, model_type } = result;

  const recConfig = {
    fair:  { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: FiMinus,       label: 'Fair Price',      bar: 'bg-green-500' },
    high:  { color: 'text-red-600',   bg: 'bg-red-50 border-red-200',     icon: FiTrendingUp,  label: 'Above Market',    bar: 'bg-red-500' },
    low:   { color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200',   icon: FiTrendingDown,label: 'Below Market',    bar: 'bg-blue-500' },
  };
  const cfg = recConfig[recommendation] || recConfig.fair;
  const Icon = cfg.icon;

  // Confidence bar width (0-100)
  const confPct = Math.min(Math.max(confidence, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Main price card */}
      <div className="glass-card p-6 text-center bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FiCpu size={28} className="text-primary-700" />
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">AI Estimated Price</p>
        <p className="text-4xl font-bold text-primary-700 mb-1">{formatPrice(estimated_price)}</p>
        <p className="text-xs text-gray-400">
          Range: {formatPrice(price_range?.low)} — {formatPrice(price_range?.high)}
        </p>

        {/* Confidence bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Model Confidence</span>
            <span className="font-semibold text-primary-700">{confPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-primary-600 h-2.5 rounded-full"
            />
          </div>
        </div>

        {/* Model info */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
          <span>Model: <strong className="capitalize text-gray-600">{model_type?.replace(/_/g, ' ')}</strong></span>
          <span>R²: <strong className="text-green-600">{r2_score}</strong></span>
        </div>
      </div>

      {/* Recommendation badge */}
      <div className={`glass-card p-4 border flex items-center gap-3 ${cfg.bg}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon size={20} className={cfg.color} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{result.recommendation_text}</p>
        </div>
      </div>
    </motion.div>
  );
}
