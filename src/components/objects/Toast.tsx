// components/Toast.tsx
import { useEffect, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps extends ComponentProps {
  message: string
  role?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({ message, role = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10) // trigger enter animation
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // wait for exit animation
    }, duration)
    return () => clearTimeout(timer)
  }, [])

  const colors: Record<ToastType, string> = {
    success: '#3a7d44',
    error:   '#c0392b',
    info:    '#E8821A',
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '12px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
      background: colors[role],
      color: 'white',
      padding: '10px 20px',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 500,
      zIndex: 9999,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  )
}