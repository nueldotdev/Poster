// src/components/MasonryBackground.tsx
import { useEffect, useState } from 'react'
import { sample } from '../assets/Index';
import '../styles/components/masonrybg.css'


const ALL = Object.values(sample)
// 3 columns, each with panel heights — tall, short, medium etc
const COLUMNS: number[][] = [
  [0, 3],
  [1, 4, 7],
  [2, 5],
]
function MasonryPanel({ src, index }: { src: string; index: number }) {
  const [current, setCurrent] = useState(src)
  const [next, setNext] = useState(src)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // each panel cycles at a different interval so they never all swap at once
    const interval = setInterval(() => {
      const newSrc = ALL[Math.floor(Math.random() * ALL.length)]
      setNext(newSrc)
      setFading(true)
      setTimeout(() => {
        setCurrent(newSrc)
        setFading(false)
      }, 800)
    }, 3000 + index * 700) // staggered intervals per panel

    return () => clearInterval(interval)
  }, [index])

  return (
    <div className="masonry-panel">
      <img src={current} className="masonry-img" alt="" />
      <img
        src={next}
        className="masonry-img masonry-img-next"
        style={{ opacity: fading ? 1 : 0 }}
        alt=""
      />
    </div>
  )
}

export default function MasonryBackground() {
  return (
    <div className="masonry-bg">
      {COLUMNS.map((col, ci) => (
        <div key={ci} className="masonry-col">
          {col.map((imgIndex) => (
            <MasonryPanel key={imgIndex} src={ALL[imgIndex]} index={imgIndex} />
          ))}
        </div>
      ))}
    </div>
  )
}