import React from 'react'

interface LoaderProps {
  className?: string;
  color?: string;
  animationPreset?: 'fade-in' | 'slide-up' | 'slide-down' | 'scale';
}

const Loader = ({ className, color, animationPreset }: LoaderProps) => {
  return (
    <div className={`loader-container ${animationPreset || 'fade-in'} delay-1s`}>
      <div className={`${className || ''} loader`} style={{ borderTopColor: color ? color : "var(--accent)" }}></div>
    </div>
  )
}

export default Loader;