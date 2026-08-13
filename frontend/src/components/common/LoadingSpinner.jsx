import React from 'react';

export default function LoadingSpinner({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-3 border-primary-200 border-t-primary-700 rounded-full animate-spin`}
        style={{ borderWidth: 3 }} />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex items-center justify-center py-10">{spinner}</div>;
}
