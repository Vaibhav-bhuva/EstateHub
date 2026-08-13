import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-xl border border-gray-200 hover:border-primary-300 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
            p === page
              ? 'bg-primary-700 text-white shadow-sm'
              : 'border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-xl border border-gray-200 hover:border-primary-300 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}
