import React from 'react'


const Loader = ({ className, color, animation }: ComponentProps) => {
  return (
    <div className={`loader-container ${animation || 'fade-in'} delay-1s`}>
      <div className={`${className || ''} loader`} style={{ borderTopColor: color ? color : "var(--accent)" }}></div>
    </div>
  )
}

export default Loader;