import React, { useEffect, useState } from 'react';
import '../animations.css';

interface AnimatedPageProps {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'slideInScale' | 'bounceIn';
  delay?: number;
  className?: string;
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({ 
  children, 
  animation = 'fadeInUp', 
  delay = 0,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';
  const delayClass = delay > 0 ? `animate-delay-${delay}` : '';

  return (
    <div className={`${animationClass} ${delayClass} ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedPage;
