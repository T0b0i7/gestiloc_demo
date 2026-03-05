import React from 'react';
import '../animations.css';

interface AnimatedListProps {
  children: React.ReactNode;
  stagger?: boolean;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  stagger = true,
  className = ''
}) => {
  const staggerClass = stagger ? 'stagger-item' : '';

  return (
    <div className={`${staggerClass} ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedList;
