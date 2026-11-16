import type { FigureInput, FigureModel } from '@/components/iso/figure-contract'

// The field journal station's truth, with no DOM. Scroll progress walks one journal card through the offline-first
// flow: drafted and photo-stamped at the handheld, dropped into the outbox, then flushed up the belt into the server
// rack once there is a signal. The pointer's x offset from the uplink mast stands for the signal: beyond TOLERANCE it
// drops, and the card stays queued in the outbox.

// Phase boundaries in scroll progress.
export const STAMPED = 0.4
export const QUEUED = 0.55
export const SYNCED = 0.9

// How far (in pointer units, -1..1) the pointer may stray from the mast before the signal drops.
export const TOLERANCE = 0.25

const PHASE_SECONDS = 0.25
const SIGNAL_SECONDS = 0.2
const FLUSH_SECONDS = 0.3

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const share = (value: number, from: number, to: number) => clamp((value - from) / (to - from), 0, 1)
export const smooth = (value: number) => {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

// Exponential follow that lands exactly on its target, so a settled state stops changing.
function follow (current: number, target: number, dt: number, seconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-dt / seconds))
  return Math.abs(target - next) < 1e-4 ? target : next
}

export type TaMobileState = {
  // Scroll progress as last seen, clamped to 0..1: the readout's phase.
  progress: number
  // The pointer's offset from the mast, -1..1, 0 without a pointer: the signal.
  aim: number
  // Eased progress that moves the card and the stamp.
  phase: number
  // Eased signal strength, 1 connected, 0 dropped: moves the signal collar on the mast.
  signal: number
  // Eased share of the belt run from the outbox to the rack bin; it only grows while connected.
  flush: number
}

export const connected = (state: Pick<TaMobileState, 'aim'>) => Math.abs(state.aim) <= TOLERANCE

export const delivered = (state: Pick<TaMobileState, 'flush'>) => state.flush > 1 - 1e-6

export const taMobileModel: FigureModel<TaMobileState> = {
  init () {
    return { progress: 0, aim: 0, phase: 0, signal: 1, flush: 0 }
  },
  step (state, dt, input: FigureInput) {
    const progress = clamp(input.progress, 0, 1)
    const aim = input.pointer ? clamp(input.pointer.x, -1, 1) : 0
    const online = connected({ aim })
    return {
      progress,
      aim,
      phase: follow(state.phase, progress, dt, PHASE_SECONDS),
      signal: follow(state.signal, online ? 1 : 0, dt, SIGNAL_SECONDS),
      flush: follow(state.flush, online ? share(progress, QUEUED, SYNCED) : 0, dt, FLUSH_SECONDS),
    }
  },
  readout (state) {
    if (state.progress < STAMPED) return 'journal draft'
    if (!connected(state)) return 'offline · outbox 1'
    if (state.progress >= SYNCED) return 'synced'
    return 'queued · outbox 1'
  },
}

export type StationPose = {
  // The card's centre along the line (world x), and whether its stamp mark is printed.
  cardX: number
  stamped: boolean
  // How far the stamp head is pressed down, 0..1.
  press: number
  // Signal collar height share on the mast, 1 at the top.
  signal: number
}

// Card stations along the line, world x of the card's centre.
export const PRESS_X = -106
export const OUTBOX_X = -62
export const RACK_X = 76

// Everything the drawing needs from a state.
export function poseOf (state: TaMobileState): StationPose {
  const stroke = share(state.phase, 0.1, 0.32)
  const press = Math.sin(Math.PI * stroke)
  const toOutbox = smooth(share(state.phase, STAMPED, QUEUED))
  const cardX = PRESS_X + (OUTBOX_X - PRESS_X) * toOutbox + (RACK_X - OUTBOX_X) * smooth(state.flush)
  return { cardX, stamped: stroke >= 0.5, press, signal: state.signal }
}

export const SETTLED_STATE: TaMobileState = { progress: 1, aim: 0, phase: 1, signal: 1, flush: 1 }
