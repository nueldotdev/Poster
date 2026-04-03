import React from 'react';
import '../../styles/components/objects/Skeleton.css';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'text' | 'title' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  style, 
  variant = 'rect' 
}) => {
  return (
    <span 
      className={`skeleton skeleton-${variant} ${className}`} 
      style={style}
    />
  );
};
