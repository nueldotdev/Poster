// Animated.tsx
import React, { forwardRef, useEffect, useState } from 'react'

type AnimationPreset = 'fade' | 'slide-up' | 'slide-down' | 'scale'

type AnimatedProps = React.HTMLAttributes<HTMLElement> & {
  duration?: number
  delay?: number
  animation?: AnimationPreset
  visible?: boolean // controls enter/exit
}

const presets: Record<AnimationPreset, { from: string; to: string }> = {
  'fade':       { from: 'opacity: 0',                        to: 'opacity: 1' },
  'slide-up':   { from: 'opacity: 0; transform: translateY(20px)', to: 'opacity: 1; transform: translateY(0)' },
  'slide-down': { from: 'opacity: 0; transform: translateY(-20px)', to: 'opacity: 1; transform: translateY(0)' },
  'scale':      { from: 'opacity: 0; transform: scale(0.9)', to: 'opacity: 1; transform: scale(1)' },
}

function parseStyle(str: string): React.CSSProperties {
  return Object.fromEntries(
    str.split(';').filter(Boolean).map(s => {
      const [key, val] = s.split(':').map(s => s.trim())
      const camel = key.replace(/-([a-z])/g, (_, l) => l.toUpperCase())
      return [camel, val]
    })
  )
}

function makeAnimatedElement<T extends HTMLElement>(tag: keyof React.JSX.IntrinsicElements) {
  return forwardRef<T, AnimatedProps>(({
    duration = 300,
    delay = 0,
    animation = 'fade',
    visible = true,
    style,
    children,
    ...props
  }, ref) => {
    const [shouldRender, setShouldRender] = useState(visible)
    const [animStyle, setAnimStyle] = useState<React.CSSProperties>(
      visible ? parseStyle(presets[animation].to) : parseStyle(presets[animation].from)
    )

    useEffect(() => {
      if (visible) {
        setShouldRender(true)
        // small timeout lets the "from" style paint before transitioning
        setTimeout(() => setAnimStyle(parseStyle(presets[animation].to)), 10)
      } else {
        setAnimStyle(parseStyle(presets[animation].from))
        // unmount after animation finishes
        setTimeout(() => setShouldRender(false), duration + delay)
      }
    }, [visible])

    if (!shouldRender) return null

    const Tag = tag as any
    return (
      <Tag
        ref={ref}
        style={{
          transition: `all ${duration}ms ease ${delay}ms`,
          ...animStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </Tag>
    )
  })
}

export const Animated = {
  div:  makeAnimatedElement<HTMLDivElement>('div'),
  span: makeAnimatedElement<HTMLSpanElement>('span'),
  p:    makeAnimatedElement<HTMLParagraphElement>('p'),
  section: makeAnimatedElement<HTMLElement>('section'),
}