import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-3xl shadow-md hover:shadow-lg border border-blue-200 transition-all duration-300 ${className}`}>
      {(title || action) && (
        <div className="px-6 py-5 border-b border-blue-100 flex justify-between items-center">
          {title && <h3 className="font-bold text-black tracking-tight">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};