import React from 'react'
import '../../styles/components/objects/Button.css'
import { getProps } from '../../hooks/utils'


export const Button = (props: ComponentProps) => {
  const filter = getProps(props);

  return (
    <button {...filter.rest} className={`button ${filter.customProps.className}`}  >
      {props.children}
    </button>
  )
}