import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, icon, className, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-purple-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full px-4 py-2 border border-purple-200 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out bg-white text-gray-800 placeholder-gray-400 ${icon ? 'pl-10' : ''} ${className || ''}`}
          {...props}
        />
      </div>
    </div>
  );
};