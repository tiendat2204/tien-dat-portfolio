'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { TransitionRouter } from 'next-transition-router'
import gsap from 'gsap'

const ROWS = 8
const COLUMNS = 18

type TransitionProviderProps = {
  children: ReactNode
}

export default function TransitionProvider ({
  children,
}: TransitionProviderProps) {
  const transitionGridRef = useRef<HTMLDivElement | null>(null)
  const blocksRef = useRef<HTMLDivElement[]>([])

  const createTransitionGrid = (): void => {
    const container = transitionGridRef.current
    if (!container) return

    container.innerHTML = ''
    blocksRef.current = []

    const blockWidth = window.innerWidth / COLUMNS
    const blockHeight = window.innerHeight / ROWS

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const block = document.createElement('div')

        block.className = 'transition-block'

        block.style.cssText = `
          width: ${blockWidth + 1}px;
          height: ${blockHeight + 1}px;
          left: ${col * blockWidth}px;
          top: ${row * blockHeight}px;
          transform-origin: ${row % 2 === 0 ? 'left' : 'right'} center;
        `

        container.appendChild(block)
        blocksRef.current.push(block)
      }
    }

    gsap.set(blocksRef.current, { scaleX: 0 })
  }

  useEffect(() => {
    createTransitionGrid()

    window.addEventListener('resize', createTransitionGrid)

    return () => {
      window.removeEventListener('resize', createTransitionGrid)
    }
  }, [])

  const getRowBlocks = (row: number): HTMLDivElement[] => {
    return blocksRef.current.slice(
      row * COLUMNS,
      row * COLUMNS + COLUMNS
    )
  }

  const animateIn = (onComplete: () => void): gsap.core.Timeline => {
    const tl = gsap.timeline({ onComplete })

    Array.from({ length: ROWS }).forEach((_, row) => {
      const blocks = getRowBlocks(row)

      tl.to(
        blocks,
        {
          scaleX: 1,
          duration: 0.3,
          ease: 'power3.inOut',
          stagger: {
            each: 0.025,
            from: row % 2 === 0 ? 'start' : 'end',
          },
        },
        '<'
      )
    })

    return tl
  }

  const animateOut = (onComplete: () => void): gsap.core.Timeline => {
    const tl = gsap.timeline({ onComplete })

    Array.from({ length: ROWS }).forEach((_, row) => {
      const blocks = getRowBlocks(row)

      tl.to(
        blocks,
        {
          scaleX: 0,
          duration: 0.3,
          ease: 'power3.inOut',
          stagger: {
            each: 0.025,
            from: row % 2 === 0 ? 'start' : 'end',
          },
        },
        '<'
      )
    })

    return tl
  }

  return (
    <TransitionRouter
      auto
      leave={(next: () => void) => {
        const tl = animateIn(next)
        return () => tl.kill()
      }}
      enter={(next: () => void) => {
        const tl = animateOut(next)
        return () => tl.kill()
      }}
    >
      {children}

      <div
        ref={transitionGridRef}
        className='transition-grid'
      />
    </TransitionRouter>
  )
}
