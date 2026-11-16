import type { FigureInput, FigureModel } from '@/components/iso/figure-contract'

// The forum desk's truth, with no DOM. One eased number, `run`, follows scroll progress and drives every stage in turn:
// a page of the story is read (0..0.35), a comment card drops through the board's slot and is pinned (0.35..0.65), the
// rating beam tips and the story's book rises one place in the ranking rack (0.65..0.95). Geometry, the live loop and
// the readout all read the same numbers.

export const STAGES = ['reading', 'commented', 'rating', 'ranked up'] as const
export const BOUNDS = [0.35, 0.65, 0.95] as const

// How far a hover or an arrow key swings the ranking lever, in radians at most.
export const NUDGE = 0.18

const RUN_SECONDS = 0.3
const NUDGE_SECONDS = 0.3

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const smooth = (value: number) => {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}
const share = (run: number, from: number, to: number) => smooth((run - from) / (to - from))

// Exponential follow that lands exactly on its target, so a settled state stops changing.
function follow (current: number, target: number, dt: number, seconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-dt / seconds))
  return Math.abs(target - next) < 1e-4 ? target : next
}

// A monotone step: 0 reading, 1 commented, 2 rating, 3 ranked up.
export function stageOf (run: number) {
  return BOUNDS.filter(bound => run >= bound).length
}

export type BetatruyenState = {
  // Eased scroll progress, 0..1.
  run: number
  // Eased lever nudge, -1..1 of NUDGE.
  nudge: number
}

export type DeskPose = {
  // The page leaf's turn, 0 lying on the right half to 1 lying on the left.
  leaf: number
  // The comment card's drop from the slot to its place on the board, 0..1.
  drop: number
  // The card's pin pressed home, 0..1.
  pin: number
  // The rating beam's tip, 0..1.
  tip: number
  // The story's book risen one place (and its neighbour lowered), 0..1.
  rank: number
  // The lever: the rank share plus the nudge, in radians from its rest angle.
  lever: number
}

export function poseOf (state: BetatruyenState): DeskPose {
  const { run } = state
  const rank = share(run, 0.8, BOUNDS[2])
  return {
    leaf: share(run, 0, 0.3),
    drop: share(run, BOUNDS[0], 0.55),
    pin: share(run, 0.55, 0.63),
    tip: share(run, BOUNDS[1], 0.8),
    rank,
    lever: rank + state.nudge * NUDGE,
  }
}

export const betatruyenModel: FigureModel<BetatruyenState> = {
  init () {
    return { run: 0, nudge: 0 }
  },
  step (state, dt, input: FigureInput) {
    return {
      run: follow(state.run, clamp(input.progress, 0, 1), dt, RUN_SECONDS),
      nudge: follow(state.nudge, input.pointer ? clamp(input.pointer.x, -1, 1) : 0, dt, NUDGE_SECONDS),
    }
  },
  readout (state) {
    return `${STAGES[stageOf(state.run)]} · 10,000+ users`
  },
}
