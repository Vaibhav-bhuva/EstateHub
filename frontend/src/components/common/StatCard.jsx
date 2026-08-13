import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = 'purple', trend, onClick }) {
  const colorMap = {
    purple: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/30',
    green: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    blue: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    orange: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    red: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/30',
    indigo: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 16px 32px -10px rgba(124,58,237,0.18)' }}
      className={`glass-card p-5 flex items-center gap-4 cursor-${onClick ? 'pointer' : 'default'} border border-purple-100/70`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${colorMap[color] || colorMap.purple}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider truncate mb-0.5">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value ?? '—'}</p>
        {trend !== undefined && trend !== null && (
          <p className={`text-xs font-semibold mt-1 flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            <span>{trend >= 0 ? '▲' : '▼'}</span> {Math.abs(trend)}% vs last month
          </p>
        )}
      </div>
    </motion.div>
  );
}
