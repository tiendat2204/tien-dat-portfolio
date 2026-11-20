// Which way a ScrollStage plays, decided from the viewport. Pure, so it is unit-tested without a browser.
export type ScrollStageMode =
  /** The stage pins and the scroll scrubs `--p` from 0 to 1. */
  | 'pinned'
  /** No pinning (narrow screens): `--p` plays 0 to 1 once when the stage comes into view. */
  | 'stacked'
  /** Reduced motion: no scroll-linked animation, `--p` stays at 1 so the finished state shows. */
  | 'static'

export function scrollStagePlan (width: number, reducedMotion: boolean, pinFrom: number): ScrollStageMode {
  if (reducedMotion) return 'static'
  if (width < pinFrom) return 'stacked'

  return 'pinned'
}

/** Coalesces a burst of requests into one `run` per frame. `schedule`/`cancel` are injected (requestAnimationFrame). */
export function createFrameThrottle (
  run: () => void,
  schedule: (callback: () => void) => number,
  cancel: (id: number) => void
) {
  let pending: number | null = null

  return {
    request () {
      if (pending !== null) return

      pending = schedule(() => {
        pending = null
        run()
      })
    },
    cancel () {
      if (pending === null) return

      cancel(pending)
      pending = null
    },
  }
}

export interface ScrollStageChapter {
  /** Progress (0..1) where the chapter starts. */
  at: number
  label: string
}

/** Index of the chapter a progress value falls in: the last one that has started (0 before the first `at`). */
export function chapterAt (progress: number, chapters: readonly ScrollStageChapter[]): number {
  let index = 0

  chapters.forEach((chapter, i) => {
    if (progress >= chapter.at) index = i
  })

  return index
}

/** The page scroll offset that puts a pinned stage at `progress`, given its trigger's start and end offsets. */
export const progressToScroll = (start: number, end: number, progress: number) =>
  start + (end - start) * Math.min(1, Math.max(0, progress))

/**
 * One frame of easing `current` toward `target`. Returns the new value and a velocity in -1..1 (how far it still has
 * to travel, so it is 0 at rest): the pair that feeds `--ps` and `--v`.
 */
export function smoothToward (current: number, target: number, ease = 0.12) {
  const gap = target - current

  if (Math.abs(gap) < 0.0005) return { value: target, velocity: 0 }

  return { value: current + gap * ease, velocity: Math.min(1, Math.max(-1, gap * 8)) }
}
