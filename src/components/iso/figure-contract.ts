import type { ComponentType } from 'react'

import type { FigureId } from '@/data/projects-page'

// The contract every projects-page figure implements (one module per FigureId under ./figures/<id>/index.ts).

// Section scroll progress, 0..1. FigureSlot keeps `current` in step with the section's `data-progress`
// without re-rendering, so a Live component reads it inside its own frame loop.
export type ProgressRef = { current: number }

// What the pure model sees each frame. `pointer` is in the figure's own world or screen units, null when absent.
export type FigureInput = { progress: number, pointer: { x: number, y: number } | null }

// Pure model: no DOM, no React. The readout text must come from the same state that moves the parts.
export type FigureModel<S> = {
  init (): S
  step (state: S, dt: number, input: FigureInput): S
  readout (state: S): string
}

export type FigureModule = {
  id: FigureId
  fig: number
  title: string
  hint: string
  // The settled pose with no motion: shown under prefers-reduced-motion.
  Static: ComponentType
  // The animated figure: runs its loop only while useFigureActive() is true, writes the card readout via the kit's useReadout().
  Live: ComponentType<{ progressRef: ProgressRef }>
}
