import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    info: "bg-[#E6F2FF] text-primary border border-blue-200",
    success: "bg-emerald-50 text-emerald border border-emerald-200",
    warning: "bg-orange-50 text-orange border border-orange-200",
    error: "bg-red-50 text-red border border-red-200",
    default: "bg-gray-100 text-gray-600 border border-gray-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};