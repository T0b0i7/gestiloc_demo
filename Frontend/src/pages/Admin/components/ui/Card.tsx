import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({ children, className = '', delay = 0 }) => {
  return (
    <div 
      className={`
        bg-card text-card-foreground rounded-xl border border-border shadow-sm
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out
        animate-fade-in-up
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
