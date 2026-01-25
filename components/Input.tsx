import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{label}</label>}
      <div className="relative">
        <input
          className={`
            w-full px-3 py-2.5 bg-white border rounded-lg text-sm text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow duration-150
            disabled:bg-gray-100 disabled:text-gray-500
            ${error ? 'border-red focus:ring-red focus:border-red' : 'border-gray-200'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red">{error}</p>}
    </div>
  );
};