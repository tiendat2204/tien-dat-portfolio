'use client'

import { useRef, type ComponentPropsWithoutRef } from 'react'

import { useScrollStage, type ScrollStageOptions } from './use-scroll-stage'

export type { ScrollStageOptions } from './use-scroll-stage'
export { draw, fade, pulse, rise, seg, travel } from './scroll-progress'

type ScrollStageProps = ComponentPropsWithoutRef<'div'> & ScrollStageOptions

/**
 * A block that pins while the page scrolls and exposes the scroll progress as the CSS variable `--p` (0..1).
 * Style its children with the helpers from `scroll-progress` (draw, fade, rise, travel, pulse) or any `calc(var(--p))`.
 * Before scripts run `--p` is 0 (the stage starts empty); with reduced motion it is 1 (the finished state).
 */
export function ScrollStage ({ distance, topOffset, pinFrom, duration, onProgress, style, children, ...rest }: ScrollStageProps) {
  const ref = useRef<HTMLDivElement>(null)

  useScrollStage(ref, { distance, topOffset, pinFrom, duration, onProgress })

  return (
    <div ref={ref} style={{ '--p': 0, ...style } as React.CSSProperties} {...rest}>
      {children}
    </div>
  )
}

export default ScrollStage
