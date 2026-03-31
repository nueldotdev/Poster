import React from 'react'
import { getProps } from '../../hooks/utils';
import '../../styles/components/objects/TextInput.css'

export const TextInput = (props: TextInputProps) => {
  const filter = getProps(props);


  return (
    <input {...filter.rest} className={`text-input ${filter.customProps.className}`} />
  )
}
