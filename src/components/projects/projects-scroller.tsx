'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLenis } from 'lenis/react'
import { useEffect, useRef, type ReactNode } from 'react'

import { PIN_MIN_WIDTH, PIN_VIEWPORTS, scrollPlan } from '@/lib/projects/scroll-plan'

gsap.registerPlugin(ScrollTrigger)

// Figures read progress from these two outputs, so no React re-render is involved.
function writeProgress (section: HTMLElement, progress: number) {
  section.dataset.progress = progress.toFixed(4)
  section.style.setProperty('--p', progress.toFixed(4))
}

export function ProjectsScroller ({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)

  // Keep ScrollTrigger in step with the global Lenis instance (never create another one).
  useLenis(() => ScrollTrigger.update())

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const sections = gsap.utils.toArray<HTMLElement>('section', root)
    const mm = gsap.matchMedia()

    mm.add(
      { wide: `(min-width: ${PIN_MIN_WIDTH}px)`, reduce: '(prefers-reduced-motion: reduce)' },
      (context) => {
        const reduce = context.conditions?.reduce === true
        const mode = scrollPlan(window.innerWidth, reduce)

        if (mode === 'static') {
          sections.forEach(section => writeProgress(section, 1))
          return
        }

        sections.forEach((section) => {
          writeProgress(section, 0)
          if (mode === 'pinned') {
            ScrollTrigger.create({
              trigger: section,
              start: 'top top',
              end: `+=${PIN_VIEWPORTS * 100}%`,
              pin: true,
              scrub: true,
              onUpdate: self => writeProgress(section, self.progress),
            })
            return
          }
          const state = { value: 0 }
          ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(state, {
                value: 1,
                duration: 1,
                ease: 'power2.out',
                onUpdate: () => writeProgress(section, state.value),
              })
            },
          })
        })
      }
    )

    return () => mm.revert()
  }, [])

  return <div ref={rootRef}>{children}</div>
}
