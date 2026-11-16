import type { FigureInput, FigureModel } from '@/components/iso/figure-contract'

// The routing sorter's truth, with no DOM: where the document is on the belt, how far each press is down, which
// stamps are made and how far each gate has swung. Every one of them is a function of one eased number, `travel`,
// so a gate can only open after its station has stamped, and the readout and the parts can never disagree.

// Station centres along the belt (world x), in routing order: draft, review, approved.
export const STATIONS = [-50, 10, 70] as const
// Each station's gate stands this far downstream of it.
export const GATE_AFTER = 28
// The stamp lands this far ahead of the sheet's centre, so the sheet waits that much short of the station.
export const MARK_AHEAD = 6
// The sheet's centre where it is fed onto the belt and where it rests in the out-tray.
export const FEED_X = -90
export const OUT_X = 136
// How far a press carriage rides up off the sheet, and how far a hover or an arrow key taps it down.
export const STROKE = 6
export const TAP = 1.6

export const GATES = STATIONS.map(x => x + GATE_AFTER)

const TRAVEL_SECONDS = 0.35
const TAP_SECONDS = 0.18
// Share of the run each dwell takes, against 1 per 60 units of belt the sheet moves.
const DWELL = 0.8
const BELT_UNIT = 60

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

type Leg = { kind: 'move', from: number, to: number, weight: number } | { kind: 'dwell', station: number, weight: number }

// The run, feed to out-tray: move to a station, dwell there while it stamps and its gate swings, move on.
const LEGS: Leg[] = (() => {
  const legs: Leg[] = []
  let at = FEED_X
  STATIONS.forEach((station, index) => {
    const stop = station - MARK_AHEAD
    legs.push({ kind: 'move', from: at, to: stop, weight: (stop - at) / BELT_UNIT })
    legs.push({ kind: 'dwell', station: index, weight: DWELL })
    at = stop
  })
  legs.push({ kind: 'move', from: at, to: OUT_X, weight: (OUT_X - at) / BELT_UNIT })
  return legs
})()

const TOTAL = LEGS.reduce((sum, leg) => sum + leg.weight, 0)

export type RoutePose = {
  // The sheet's centre along the belt.
  x: number
  // Each station's press, 0 lifted to 1 on the sheet.
  press: number[]
  // Whether each station's stamp is on the sheet.
  stamped: boolean[]
  // Each gate's swing, 0 closed to 1 fully open.
  gates: number[]
  // The routing step the document is on, 1..3, by how many gates it has passed.
  stage: number
}

// Where everything is after `travel` (0..1) of the run.
export function routeAt (travel: number): RoutePose {
  let along = clamp(travel, 0, 1) * TOTAL
  let x = FEED_X
  const dwell = STATIONS.map(() => 0)
  for (const leg of LEGS) {
    const share = leg.weight ? clamp(along / leg.weight, 0, 1) : 1
    if (leg.kind === 'move') {
      if (along > 0) x = leg.from + (leg.to - leg.from) * smooth(share)
    } else dwell[leg.station] = along > 0 ? share : 0
    along -= leg.weight
    if (along <= 0) break
  }
  const press = dwell.map(phase => (1 - Math.cos(phase * Math.PI * 2)) / 2)
  const stamped = dwell.map(phase => phase >= 0.5)
  // A gate swings only in the second half of its dwell, after the press has met the sheet.
  const gates = dwell.map(phase => smooth((phase - 0.5) / 0.5))
  const stage = 1 + GATES.slice(0, 2).filter(gate => x > gate).length
  return { x, press, stamped, gates, stage }
}

export type EofficeState = {
  // Eased share of the run, feed to out-tray, that scroll progress asks for.
  travel: number
  // Eased hover tap on the presses, 0..1.
  tap: number
}

export const eofficeModel: FigureModel<EofficeState> = {
  init () {
    return { travel: 0, tap: 0 }
  },
  step (state, dt, input: FigureInput) {
    return {
      travel: follow(state.travel, clamp(input.progress, 0, 1), dt, TRAVEL_SECONDS),
      tap: follow(state.tap, input.pointer ? 1 : 0, dt, TAP_SECONDS),
    }
  },
  readout (state) {
    return `step ${routeAt(state.travel).stage}/3`
  },
}

// Everything the drawing needs from a state: the route pose plus each press carriage's lift above the sheet.
export function poseOf (state: EofficeState) {
  const route = routeAt(state.travel)
  const lift = route.press.map(press => Math.max(0, STROKE * (1 - press) - TAP * state.tap))
  return { ...route, lift }
}
