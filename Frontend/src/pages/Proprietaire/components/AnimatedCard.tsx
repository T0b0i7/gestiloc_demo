import React from 'react';
import '../animations.css';

interface AnimatedCardProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'fadeInLeft' | 'slideInScale' | 'bounceIn';
  delay?: number;
  className?: string;
  hover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = '',
  hover = true
}) => {
  const animationClass = `animate-${animation}`;
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';
  const hoverClass = hover ? 'card-hover' : '';

  return (
    <div className={`${animationClass} ${delayClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedCard;
