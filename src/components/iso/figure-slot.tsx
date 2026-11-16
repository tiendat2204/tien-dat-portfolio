'use client'

import { useEffect, useRef, useState } from 'react'

import { FigureActiveContext } from '@/components/iso/figure-activity'
import type { FigureModule, ProgressRef } from '@/components/iso/figure-contract'
import { FigureFrame } from '@/components/iso/figure-frame'
import { useStillness } from '@/components/iso/kit/react/live'
import { loadFigure } from '@/components/iso/registry'
import type { FigureId } from '@/data/projects-page'

const NEAR_MARGIN = '200px 0px'

function readProgress (section: HTMLElement) {
  const value = Number(section.dataset.progress)
  return Number.isFinite(value) ? value : 0
}

// Lazy-loads one figure when its section nears the viewport and feeds it the section's scroll progress.
export function FigureSlot ({ figureId }: { figureId?: FigureId }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const progressRef: ProgressRef = useRef(0)
  const [near, setNear] = useState(false)
  const [figure, setFigure] = useState<FigureModule | null>(null)
  const still = useStillness()

  useEffect(() => {
    const root = rootRef.current
    if (!root || !figureId) return
    const observer = new IntersectionObserver(
      entries => setNear(entries.some(entry => entry.isIntersecting)),
      { rootMargin: NEAR_MARGIN }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [figureId])

  useEffect(() => {
    if (!near || !figureId || figure?.id === figureId) return
    let cancelled = false
    loadFigure(figureId).then((loaded) => {
      if (!cancelled) setFigure(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [near, figureId, figure])

  // Mirror the section's data-progress into progressRef while near the viewport; no React render per change.
  useEffect(() => {
    const section = rootRef.current?.closest('section')
    if (!near || !section) return
    progressRef.current = readProgress(section)
    const observer = new MutationObserver(() => {
      progressRef.current = readProgress(section)
    })
    observer.observe(section, { attributes: true, attributeFilter: ['data-progress'] })
    return () => observer.disconnect()
  }, [near])

  if (!figureId) return null

  const ready = figure?.id === figureId ? figure : null
  return (
    <div ref={rootRef} data-figure={figureId} className='mt-6 aspect-[4/3] w-full'>
      {ready && (
        <FigureActiveContext value={near}>
          <FigureFrame fig={ready.fig} title={ready.title} hint={ready.hint}>
            {still ? <ready.Static /> : <ready.Live progressRef={progressRef} />}
          </FigureFrame>
        </FigureActiveContext>
      )}
    </div>
  )
}
