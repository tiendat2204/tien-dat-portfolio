import type { FigureInput, FigureModel } from '@/components/iso/figure-contract'

// The drafting plotter's truth, with no DOM: the page wireframe the pen drafts, the pen's path over the sheet,
// and the eased state that scroll progress and the pointer drive. Geometry and the live loop read the same numbers.

export type Floor = [number, number]

// The sheet on the bed, in world units (x along the rails, y across them, the page's top edge at -y).
export const SHEET = { x: -80, y: -55, w: 160, d: 110 }

// Where the pen waits off the sheet, on the bed's left margin, before and after a draft.
export const PARK: Floor = [-94, 0]

const rect = (x0: number, y0: number, x1: number, y1: number): Floor[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]

// The page being drafted: a header bar, a hero block with an image cross, three cards and a footer, in drawing order.
export const STROKES: Floor[][] = [
  rect(-68, -46, 68, -37),
  rect(-68, -31, 68, 3),
  [[-68, -31], [68, 3]],
  [[68, -31], [-68, 3]],
  rect(-68, 9, -24, 34),
  rect(-22, 9, 22, 34),
  rect(24, 9, 68, 34),
  rect(-68, 40, 68, 46),
]

// The pen rises this far for a travel move or when someone hovers.
export const LIFT = 4
// How far a hover or an arrow key nudges the gantry along x, at most.
export const NUDGE = 6

const RAMP = 3
const DRAFT_SECONDS = 0.28
const LIFT_SECONDS = 0.16
const NUDGE_SECONDS = 0.3

type Segment = { a: Floor, b: Floor, down: boolean, length: number, start: number, ink: number, fromPark: boolean, toPark: boolean }

const distance = (a: Floor, b: Floor) => Math.hypot(b[0] - a[0], b[1] - a[1])

function planOf (strokes: Floor[][]) {
  const segments: Segment[] = []
  let start = 0
  let ink = 0
  let at = PARK
  const push = (a: Floor, b: Floor, down: boolean, fromPark = false, toPark = false) => {
    const length = distance(a, b)
    segments.push({ a, b, down, length, start, ink, fromPark, toPark })
    start += length
    if (down) ink += length
  }
  strokes.forEach((stroke, index) => {
    push(at, stroke[0], false, index === 0)
    for (let point = 1; point < stroke.length; point++) push(stroke[point - 1], stroke[point], true)
    at = stroke[stroke.length - 1]
  })
  push(at, PARK, false, false, true)
  return { segments, total: start, ink }
}

const PLAN = planOf(STROKES)

export const INK_LENGTH = PLAN.ink

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const smooth = (value: number) => {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

// Exponential follow that lands exactly on its target, so a settled state stops the loop.
function follow (current: number, target: number, dt: number, seconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-dt / seconds))
  return Math.abs(target - next) < 1e-4 ? target : next
}

function segmentAt (along: number) {
  for (const segment of PLAN.segments) if (along <= segment.start + segment.length) return segment
  return PLAN.segments[PLAN.segments.length - 1]
}

export type PenPose = {
  // The pen tip over the sheet.
  at: Floor
  // Ink laid so far, in world units of line.
  ink: number
  // 0 with the tip on the paper, 1 at full lift.
  lift: number
  // Which stroke the pen is on and how far along it, for drawing the partial line.
  stroke: number
  reach: Floor[]
}

// Where the pen is after `draft` (0..1) of the whole run, park to park.
export function penAt (draft: number): PenPose {
  const along = clamp(draft, 0, 1) * PLAN.total
  const segment = segmentAt(along)
  const into = clamp(along - segment.start, 0, segment.length)
  const t = segment.length ? into / segment.length : 1
  const at: Floor = [segment.a[0] + (segment.b[0] - segment.a[0]) * t, segment.a[1] + (segment.b[1] - segment.a[1]) * t]
  const ink = segment.ink + (segment.down ? into : 0)
  const lift = segment.down
    ? 0
    : Math.min(segment.fromPark ? 1 : smooth(into / RAMP), segment.toPark ? 1 : smooth((segment.length - into) / RAMP))
  return { at, ink, lift, ...reachOf(ink, at) }
}

function reachOf (ink: number, at: Floor) {
  let laid = 0
  for (let index = 0; index < STROKES.length; index++) {
    const stroke = STROKES[index]
    let length = 0
    for (let point = 1; point < stroke.length; point++) length += distance(stroke[point - 1], stroke[point])
    if (ink < laid + length - 1e-9) {
      const reach: Floor[] = [stroke[0]]
      let left = ink - laid
      for (let point = 1; point < stroke.length && left > 0; point++) {
        const step = distance(stroke[point - 1], stroke[point])
        if (left >= step) reach.push(stroke[point])
        else reach.push(at)
        left -= step
      }
      return { stroke: index, reach }
    }
    laid += length
  }
  return { stroke: STROKES.length, reach: [] }
}

export type PortfolioState = {
  // Eased share of the run, park to park, that scroll progress asks for.
  draft: number
  // Eased hover lift, 0..1.
  hover: number
  // Eased gantry nudge in world units along x.
  nudge: number
}

export const portfolioModel: FigureModel<PortfolioState> = {
  init () {
    return { draft: 0, hover: 0, nudge: 0 }
  },
  step (state, dt, input: FigureInput) {
    const pointer = input.pointer
    return {
      draft: follow(state.draft, clamp(input.progress, 0, 1), dt, DRAFT_SECONDS),
      hover: follow(state.hover, pointer ? 1 : 0, dt, LIFT_SECONDS),
      nudge: follow(state.nudge, pointer ? clamp(pointer.x, -1, 1) * NUDGE : 0, dt, NUDGE_SECONDS),
    }
  },
  readout (state) {
    const percent = Math.round((penAt(state.draft).ink / INK_LENGTH) * 100)
    return state.hover > 0.5 ? `sheet ${percent}% · pen up` : `sheet ${percent}%`
  },
}

// Everything the drawing needs from a state: the pen pose plus hover lift and nudge folded in.
export function poseOf (state: PortfolioState) {
  const pen = penAt(state.draft)
  return { ...pen, lift: Math.max(pen.lift, state.hover), nudge: state.nudge }
}

export const settled = (state: PortfolioState, input: FigureInput) =>
  state.draft === clamp(input.progress, 0, 1) && state.hover === (input.pointer ? 1 : 0) && state.nudge === (input.pointer ? clamp(input.pointer.x, -1, 1) * NUDGE : 0)
