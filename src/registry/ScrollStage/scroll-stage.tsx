'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties } from 'react'

import { ScrollStageRail } from './scroll-stage-rail'
import { chapterAt, chapterTarget, sortChapters, type ScrollStageChapter } from './scroll-stage-plan'
import { useScrollStage, type ScrollStageOptions } from './use-scroll-stage'

export type { ScrollStageOptions } from './use-scroll-stage'
export type { ScrollStageChapter } from './scroll-stage-plan'
export { draw, fade, pulse, rise, seg, travel } from './scroll-progress'

/**
 * Tells every stage below it how to scroll the page for a chapter jump, once, instead of a `scrollTo` prop on each.
 * Use it with a smooth-scroll library: `<ScrollStageScroller value={top => lenis?.scrollTo(top)}>`.
 * A stage's own `scrollTo` prop wins; with neither, jumps use a native smooth scroll.
 */
const ScrollerContext = createContext<((top: number) => void) | undefined>(undefined)

export const ScrollStageScroller = ScrollerContext.Provider

type ScrollStageProps = ComponentPropsWithoutRef<'div'> & ScrollStageOptions & {
  /** Named parts of the scroll. Adds a numbered strip under the content; a cell scrolls the stage to its chapter. */
  chapters?: readonly ScrollStageChapter[]
}

/**
 * A block that pins while the page scrolls and exposes the scroll progress as CSS variables:
 * `--p` (0..1), `--ps` (the same, eased) and `--v` (velocity, -1..1). With `chapters` it also sets `data-chapter`
 * (the active index) and shows a chapter strip.
 * Style children with the helpers from `scroll-progress` (draw, fade, rise, travel, pulse) or any `calc(var(--p))`.
 * Before scripts run `--p` is 0 (the stage starts empty); with reduced motion it is 1 (the finished state).
 */
export function ScrollStage ({ distance, topOffset, pinFrom, duration, onProgress, scrollTo, chapters: chaptersProp, style, children, ...rest }: ScrollStageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const providedScrollTo = useContext(ScrollerContext)
  const [chapter, setChapter] = useState(0)
  const chapters = useMemo(() => chaptersProp && sortChapters(chaptersProp), [chaptersProp])

  const handleProgress = useCallback((progress: number) => {
    if (chapters) setChapter(chapterAt(progress, chapters))
    onProgress?.(progress)
  }, [chapters, onProgress])

  const { goTo, pinned } = useScrollStage(ref, { distance, topOffset, pinFrom, duration, onProgress: handleProgress, scrollTo: scrollTo ?? providedScrollTo })

  return (
    <div
      ref={ref}
      data-chapter={chapters ? chapter : undefined}
      style={{ '--p': 0, '--ps': 0, '--v': 0, ...style } as CSSProperties}
      {...rest}
    >
      {children}
      {chapters && chapters.length > 0 && (
        <ScrollStageRail chapters={chapters} active={chapter} interactive={pinned} onSelect={target => goTo(chapterTarget(target, chapters))} />
      )}
    </div>
  )
}

export default ScrollStage
