import type { FigureInput, FigureModel } from '@/components/iso/figure-contract'

// The traceability line's truth, with no DOM. A harvest-lot crate rides a bench conveyor from the plot stage, under
// the recording arch, past the warehouse shelf to the parcel stage, where the label printer stamps a QR label on its
// lid. The lot counts as recorded once the crate has passed the arch, and only a recorded lot gets a label.
// Geometry, the live loop and the readout all read these numbers.

// Crate centre along the belt (world x): where the lot starts, where it is recorded, where it docks under the stamp.
export const X_START = -106
export const SCAN_X = -40
export const X_END = 108
// How far a hover or an arrow key jogs the crate along the belt, at most.
export const JOG = 5
// How far the stamp pad travels down onto the lid.
export const STROKE = 8

// Shares of the section's scroll: the crate travels until CARRY_END, the stamp runs from PRINT_START to PRINT_POINT.
const CARRY_END = 0.72
const PRINT_START = 0.8
export const PRINT_POINT = 0.96

const RUN_SECONDS = 0.3
const JOG_SECONDS = 0.3
const DONE = 1e-6

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const smooth = (value: number) => {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

// Exponential follow that lands exactly on its target, so a settled state stops changing.
function follow (current: number, target: number, dt: number, seconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-dt / seconds))
  return Math.abs(target - next) < 1e-4 ? target : next
}

export type AgritaState = {
  // Eased share of the line that scroll progress asks for.
  run: number
  // Eased jog of the crate along the belt, -1..1 of JOG.
  jog: number
}

export type LinePose = {
  // Crate centre along the belt.
  x: number
  // The crate has passed the recording arch.
  recorded: boolean
  // 0..1 through the stamp: the pad goes down until 0.5 and back up by 1.
  print: number
  // 0 with the pad up, 1 with the pad on the lid.
  press: number
  // The printed label sits on the lid (it is laid at the bottom of the stroke, under the pad).
  label: boolean
  // The label is printed, stamped and the pad is clear: the lot's QR is live.
  qr: boolean
}

export function poseOf (state: AgritaState): LinePose {
  const carried = X_START + (X_END - X_START) * smooth(state.run / CARRY_END)
  const reached = carried >= SCAN_X
  const stamp = reached ? smooth((state.run - PRINT_START) / (PRINT_POINT - PRINT_START)) : 0
  const press = stamp < 0.5 ? smooth(stamp / 0.5) : smooth((1 - stamp) / 0.5)
  // The crate holds still under the pad while it presses.
  const x = clamp(carried + state.jog * JOG * (1 - press), X_START - JOG, X_END + JOG)
  const recorded = x >= SCAN_X
  const print = recorded ? stamp : 0
  return { x, recorded, print, press: recorded ? press : 0, label: print >= 0.5, qr: print > 1 - DONE }
}

export const agritaModel: FigureModel<AgritaState> = {
  init () {
    return { run: 0, jog: 0 }
  },
  step (state, dt, input: FigureInput) {
    return {
      run: follow(state.run, clamp(input.progress, 0, 1), dt, RUN_SECONDS),
      jog: follow(state.jog, input.pointer ? clamp(input.pointer.x, -1, 1) : 0, dt, JOG_SECONDS),
    }
  },
  readout (state) {
    return poseOf(state).qr ? 'lot 1 · QR active' : 'lot 1 · no QR yet'
  },
}
