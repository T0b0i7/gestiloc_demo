import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-surface rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          {title && <h3 className="font-semibold text-gray-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};