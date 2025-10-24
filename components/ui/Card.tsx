
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        {title && <h2 className="text-xl font-bold text-purple-800 mb-4 pb-2 border-b-2 border-purple-100">{title}</h2>}
        {children}
    </div>
  );
};
