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
