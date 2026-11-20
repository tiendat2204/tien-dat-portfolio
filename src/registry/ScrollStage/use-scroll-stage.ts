'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

import { writeProgress, writeSmoothed } from './scroll-progress'
import { createFrameThrottle, progressToScroll, scrollStagePlan, smoothToward } from './scroll-stage-plan'

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
  /** How `goTo` scrolls the page. Defaults to a native smooth scroll; with Lenis pass `top => lenis.scrollTo(top)`. */
  scrollTo?: (top: number) => void
}

/**
 * Pins `ref` while the page scrolls and writes, on that element:
 * - `--p` and `data-progress`: the scroll progress, 0..1, exactly as scrolled;
 * - `--ps`: the same progress eased, so effects trail the scroll a little instead of snapping to it;
 * - `--v`: how fast it is still moving, -1..1 and 0 at rest, for skew or blur while scrolling.
 * Which way it plays (pinned, once on narrow screens, or not at all with reduced motion) follows scrollStagePlan.
 * With smooth scrolling such as Lenis, call `ScrollTrigger.update()` from its scroll event.
 * Returns `goTo(progress)`, which scrolls a pinned stage to that progress, and `pinned`, whether a pin is live.
 */
export function useScrollStage<T extends HTMLElement> (
  ref: RefObject<T | null>,
  { distance = 1.5, topOffset = 0, pinFrom = 1024, duration = 1, onProgress, scrollTo }: ScrollStageOptions = {}
) {
  const onProgressRef = useRef(onProgress)
  const scrollToRef = useRef(scrollTo)
  const triggerRef = useRef<ScrollTrigger | null>(null)
  // True only while a pin is live: `goTo` has nothing to scroll to on narrow screens or with reduced motion.
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    onProgressRef.current = onProgress
    scrollToRef.current = scrollTo
  })

  useEffect(() => {
    const element = ref.current

    if (!element) return

    // The eased value chases the real one on animation frames, and stops once it has arrived.
    let target = 0
    let eased = 0
    let frame: number | null = null
    let still = false

    const tick = () => {
      frame = null

      const next = smoothToward(eased, target)

      eased = next.value
      writeSmoothed(element, eased, next.velocity)

      if (next.velocity !== 0) frame = requestAnimationFrame(tick)
    }

    const report = (progress: number) => {
      writeProgress(element, progress)
      onProgressRef.current?.(progress)
      target = progress

      if (still) {
        eased = progress
        writeSmoothed(element, eased, 0)
      } else if (frame === null) {
        frame = requestAnimationFrame(tick)
      }
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
        // Reduced motion shows the finished state with nothing trailing behind it.
        still = reduce

        if (mode === 'static') {
          report(1)

          return
        }

        report(0)

        if (mode === 'pinned') {
          const trigger = ScrollTrigger.create({
            trigger: element,
            start: `top ${topOffset}px`,
            end: `+=${distance * 100}%`,
            pin: true,
            // GSAP turns spacing off when the parent is a flex or grid container, which lets the next content slide under the stage.
            pinSpacing: true,
            scrub: true,
            onUpdate: self => report(self.progress),
          })

          triggerRef.current = trigger

          setPinned(true)

          // GSAP runs this when the pin is reverted (a resize across `pinFrom`, a reduced-motion change, unmount).
          return () => {
            triggerRef.current = null
            setPinned(false)
          }
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
      triggerRef.current = null
      if (frame !== null) cancelAnimationFrame(frame)
      observer.disconnect()
      throttle.cancel()
      media.revert()
    }
  }, [ref, distance, topOffset, pinFrom, duration])

  /** Scrolls a pinned stage to `progress` (0..1). Does nothing when the stage is not pinned. */
  const goTo = useCallback((progress: number) => {
    const trigger = triggerRef.current

    if (!trigger) return

    const top = progressToScroll(trigger.start, trigger.end, progress)

    // A smooth-scroll library keeps writing its own position every frame, which would undo a native scroll.
    if (scrollToRef.current) scrollToRef.current(top)
    else window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  return { goTo, pinned }
}
