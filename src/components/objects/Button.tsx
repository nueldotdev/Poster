import React from 'react'
import '../../styles/components/objects/Button.css'


export const Button = (props: ComponentProps) => {
  return (
    <button {...props}>
      {props.children}
    </button>
  )
}