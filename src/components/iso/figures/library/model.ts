import type { FigureInput, FigureModel } from '@/components/iso/figure-contract'

// The card catalog's truth, with no DOM: where the picked drawer, the catalog card and the date stamp are for one share
// of the loan (`flow`, 0..1), and whether the loan has been recorded. Geometry and the live loop read the same numbers.

export type Point = [number, number, number]

// The catalog size from the CV, shown in the readout.
const CATALOG = '40,000+ books'

// How far the picked drawer slides out on its rails, in world units along +y.
export const OPEN = 40
// How far a hover or an arrow key pulls the neighbouring drawer, at most.
export const PEEK = 9

// The picked card, by the centre of its bottom edge: standing in the closed drawer, lifted clear of the drawer, over
// the loan desk, down on the desk beside the stamp, and slid under the stamp.
export const CARD_REST: Point = [-86, -27, 66.5]
export const CARD_LIFT = 24
const CARD_OVER: Point = [30, 4, 56]
const CARD_DOWN: Point = [30, 4, 44]
export const CARD_LAND: Point = [62, 4, 44]
// The card is drawn in front of the drawer's contents (not inside them) once it has risen this far.
export const CARD_CLEAR = 17
// The arc the card follows over the gap between the cabinet and the desk.
const CARD_ARC = 10

// How far the stamp's plunger travels down to meet the card.
export const STAMP_TRAVEL = 9.5

// The loan, in shares of `flow`: the drawer opens, the card lifts, crosses, sets down and slides, the stamp presses
// and lifts. The stamp reaches the card at PRESS_AT, which is when the loan is recorded.
const PHASE = {
  open: [0, 0.35],
  lift: [0.35, 0.43],
  cross: [0.43, 0.6],
  down: [0.6, 0.64],
  slide: [0.64, 0.7],
  press: [0.7, 0.8],
  release: [0.8, 0.9],
} as const
export const PRESS_AT = PHASE.press[1]

const FLOW_SECONDS = 0.32
const PEEK_SECONDS = 0.35

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const smooth = (value: number) => {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}
const share = (flow: number, [from, to]: readonly [number, number]) => smooth((flow - from) / (to - from))
const mix = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

// Exponential follow that lands exactly on its target, so a settled state stops changing.
function follow (current: number, target: number, dt: number, seconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-dt / seconds))
  return Math.abs(target - next) < 1e-4 ? target : next
}

// How far the picked drawer is out, 0..1.
export const drawerOpen = (flow: number) => share(flow, PHASE.open)

// How far down the stamp is, 0..1: 1 exactly at PRESS_AT, with the head on the card.
export function stampPress (flow: number) {
  return flow <= PRESS_AT ? share(flow, PHASE.press) : 1 - share(flow, PHASE.release)
}

export type CardPose = {
  // The centre of the card's bottom edge (the edge it stands on, and the hinge it lies down about).
  at: Point
  // 0 standing in the drawer, 1 lying face up on the desk.
  tilt: number
  // True once the card has risen clear of the drawer: it is then drawn over everything but the desk's near parts.
  clear: boolean
}

export function cardAt (flow: number): CardPose {
  const out = drawerOpen(flow) * OPEN
  const rest: Point = [CARD_REST[0], CARD_REST[1] + out, CARD_REST[2]]
  const rise = share(flow, PHASE.lift) * CARD_LIFT
  if (flow < PHASE.cross[0]) return { at: [rest[0], rest[1], rest[2] + rise], tilt: 0, clear: rise >= CARD_CLEAR }
  const top: Point = [rest[0], rest[1], rest[2] + CARD_LIFT]
  if (flow < PHASE.down[0]) {
    const t = share(flow, PHASE.cross)
    const at = mix(top, CARD_OVER, t)
    return { at: [at[0], at[1], at[2] + CARD_ARC * Math.sin(Math.PI * t)], tilt: t, clear: true }
  }
  if (flow < PHASE.slide[0]) return { at: mix(CARD_OVER, CARD_DOWN, share(flow, PHASE.down)), tilt: 1, clear: true }
  return { at: mix(CARD_DOWN, CARD_LAND, share(flow, PHASE.slide)), tilt: 1, clear: true }
}

export type LibraryState = {
  // Eased share of the loan that scroll progress asks for, 0..1.
  flow: number
  // Eased pull on the neighbouring drawer from hover or the arrow keys, 0..1.
  peek: number
  // The loan is recorded once the stamp has pressed the card; it stays recorded until the card is back in its drawer.
  recorded: boolean
}

export const libraryModel: FigureModel<LibraryState> = {
  init () {
    return { flow: 0, peek: 0, recorded: false }
  },
  step (state, dt, input: FigureInput) {
    const flow = follow(state.flow, clamp(input.progress, 0, 1), dt, FLOW_SECONDS)
    const pointer = input.pointer
    // Pointing toward the left half of the figure, where the neighbouring drawer is, pulls it further out.
    const peek = follow(state.peek, pointer ? (1 - clamp(pointer.x, -1, 1)) / 2 : 0, dt, PEEK_SECONDS)
    // The stamp is on the card whenever flow has reached PRESS_AT, even if one long frame jumped past it.
    const recorded = flow >= PRESS_AT || (state.recorded && flow > PHASE.lift[0])
    return { flow, peek, recorded }
  },
  readout (state) {
    return `${CATALOG} · ${state.recorded ? 'loan recorded' : 'browsing'}`
  },
}
