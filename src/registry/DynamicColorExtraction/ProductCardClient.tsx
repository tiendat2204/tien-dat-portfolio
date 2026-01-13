'use client'
import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface IBook {
  id: string
  coverImage: string
  title: string
  author: string
}

interface ProductCardClientProps {
  data: IBook
  children: ReactNode
}

const extractDominantColor = (img: HTMLImageElement): string => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) return 'transparent'

    canvas.width = 50
    canvas.height = 50
    ctx.drawImage(img, 0, 0, 50, 50)

    const imageData = ctx.getImageData(0, 0, 50, 50)
    const data = imageData.data

    let r = 0
    let g = 0
    let b = 0
    const pixelCount = data.length / 4

    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }

    r = Math.floor(r / pixelCount)
    g = Math.floor(g / pixelCount)
    b = Math.floor(b / pixelCount)

    return `rgba(${r}, ${g}, ${b}, 0.3)`
  } catch (error) {
    console.error('Error extracting color:', error)
    return 'transparent'
  }
}

export const ProductCardClient = ({ data, children }: ProductCardClientProps) => {
  const [bgColor, setBgColor] = useState<string>('transparent')
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const img = new window.Image()

    img.crossOrigin = 'anonymous'
    img.src = data.coverImage || '/book.png'

    img.onload = () => {
      const color = extractDominantColor(img)
      setBgColor(color)
    }
  }, [data.coverImage])

  return (
    <motion.div
      className='w-full max-w-xs  group cursor-pointer relative'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className='absolute inset-0 pointer-events-none rounded-lg'
        initial={{ opacity: 0, scale: 1 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{ backgroundColor: bgColor }}
      />

      <div className='relative z-10'>{children}</div>
    </motion.div>
  )
}
