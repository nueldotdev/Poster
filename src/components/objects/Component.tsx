// import React, { useEffect } from 'react'

// const Component = (props: ComponentProps) => {

//   const visibleDuration = props.visibleDuration
//   const filteredProps = props as Omit<ComponentProps, 'visibleDuration'>

//    useEffect(() => {
//     setTimeout(() => {
//       if (visibleDuration) {
//         props.visible = false

//       }
//     }, visibleDuration)
//    })

//   return (
//     <div className={props.className} style={{props.style, display: props.visible ? 'block' : 'none'}} >
//       {props.children}
//     </div>
//   )
// }

// export default Component