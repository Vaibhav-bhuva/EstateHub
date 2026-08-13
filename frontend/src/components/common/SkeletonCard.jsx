import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="skeleton h-48 rounded-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="flex gap-3 mt-2">
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
          <div className="skeleton h-3 w-14 rounded" />
        </div>
        <div className="skeleton h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}
