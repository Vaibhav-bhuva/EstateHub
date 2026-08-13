import React from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiHeart, FiHome, FiBell } from 'react-icons/fi';
import { formatRelativeTime } from '../../utils/formatters';

const iconMap = {
  inquiry:  { icon: FiMessageSquare, color: 'bg-purple-100 text-purple-700' },
  wishlist: { icon: FiHeart,         color: 'bg-red-100 text-red-600' },
  property: { icon: FiHome,          color: 'bg-blue-100 text-blue-700' },
  system:   { icon: FiBell,          color: 'bg-gray-100 text-gray-600' },
};

export default function RecentActivity({ notifications = [], loading = false }) {
  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          <div className="w-9 h-9 rounded-xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (!notifications.length) return (
    <div className="text-center py-8">
      <FiBell size={28} className="text-gray-200 mx-auto mb-2" />
      <p className="text-sm text-gray-400">No recent activity</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {notifications.slice(0, 8).map(n => {
        const cfg = iconMap[n.type] || iconMap.system;
        const Icon = cfg.icon;
        return (
          <div key={n.id || n._id} className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${!n.isRead ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                {n.title}
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-300 mt-0.5">{formatRelativeTime(n.createdAt)}</p>
            </div>
            {!n.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0 mt-1.5" />
            )}
          </div>
        );
      })}
    </div>
  );
}
