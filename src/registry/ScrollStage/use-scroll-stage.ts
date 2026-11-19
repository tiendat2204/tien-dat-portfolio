'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, type RefObject } from 'react'

import { writeProgress } from './scroll-progress'
import { createFrameThrottle, scrollStagePlan } from './scroll-stage-plan'

gsap.registerPlugin(ScrollTrigger)

export interface ScrollStageOptions {
  /** How long the stage stays pinned, in viewport heights. */
  distance?: number
  /** Distance from the top of the viewport where the stage pins, e.g. a sticky header's height. */
  topOffset?: number
  /** Viewport width from which the stage pins; narrower screens play once instead. */
  pinFrom?: number
  /** Seconds the one-shot play takes on narrow screens. */
  duration?: number
  /** Called with each new progress value (0..1), e.g. to drive a canvas. */
  onProgress?: (progress: number) => void
}

/**
 * Pins `ref` while the page scrolls and writes the scroll progress to its `--p` property and `data-progress`.
 * Which way it plays (pinned, once on narrow screens, or not at all with reduced motion) follows scrollStagePlan.
 * With smooth scrolling such as Lenis, call `ScrollTrigger.update()` from its scroll event.
 */
export function useScrollStage<T extends HTMLElement> (
  ref: RefObject<T | null>,
  { distance = 1.5, topOffset = 0, pinFrom = 1024, duration = 1, onProgress }: ScrollStageOptions = {}
) {
  const onProgressRef = useRef(onProgress)

  useEffect(() => {
    onProgressRef.current = onProgress
  })

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const report = (progress: number) => {
      writeProgress(element, progress)
      onProgressRef.current?.(progress)
    }

    let hasTriggers = false
    // Lazy content changes heights after mount, so the trigger positions are measured again (once per frame).
    const throttle = createFrameThrottle(
      () => {
        if (hasTriggers) ScrollTrigger.refresh()
      },
      callback => requestAnimationFrame(callback),
      id => cancelAnimationFrame(id)
    )
    const observer = new ResizeObserver(() => throttle.request())

    observer.observe(element)

    const media = gsap.matchMedia()

    // matchMedia only runs its callback when a condition matches, so `narrow` keeps the narrow mode reachable.
    media.add(
      {
        wide: `(min-width: ${pinFrom}px)`,
        narrow: `(width < ${pinFrom}px)`,
        reduce: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const reduce = context.conditions?.reduce === true
        const width = context.conditions?.narrow === true ? pinFrom - 1 : pinFrom
        const mode = scrollStagePlan(width, reduce, pinFrom)

        hasTriggers = mode !== 'static'

        if (mode === 'static') {
          report(1)

          return
        }

        report(0)

        if (mode === 'pinned') {
          ScrollTrigger.create({
            trigger: element,
            start: `top ${topOffset}px`,
            end: `+=${distance * 100}%`,
            pin: true,
            // GSAP turns spacing off when the parent is a flex or grid container, which lets the next content slide under the stage.
            pinSpacing: true,
            scrub: true,
            onUpdate: self => report(self.progress),
          })

          return
        }

        const state = { value: 0 }

        ScrollTrigger.create({
          trigger: element,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(state, { value: 1, duration, ease: 'power2.out', onUpdate: () => report(state.value) })
          },
        })
      }
    )

    return () => {
      observer.disconnect()
      throttle.cancel()
      media.revert()
    }
  }, [ref, distance, topOffset, pinFrom, duration])
}
