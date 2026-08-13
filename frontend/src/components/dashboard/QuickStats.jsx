import React from 'react';
import { motion } from 'framer-motion';

/**
 * Horizontal summary strip for dashboard quick numbers.
 */
export default function QuickStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all"
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.bg || 'bg-primary-100'}`}>
              {Icon && <Icon size={20} className={s.iconColor || 'text-primary-700'} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium truncate">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value ?? '—'}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
