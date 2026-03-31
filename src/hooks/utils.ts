import { useState } from 'react'

const getProps = (props: ComponentProps) => {
  const { className, size, type, ...rest } = props;
  const customProps = {
    className: `${className} ${size ? `size-${size}` : ''} ${type ? `type-${type}` : ''}`,
  }
  
  return { rest, customProps };
}


interface ToastState {
  message: string
  role: 'success' | 'error' | 'info'
}

const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, role: ToastState['role'] = 'info') => {
    setToast({ message, role })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}


export { getProps, useToast };