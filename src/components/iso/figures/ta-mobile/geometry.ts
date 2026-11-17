/*
  The field journal station, built once from the kit. World units are about 1 px, x runs along the card line (press,
  outbox, belt, rack bin), y across it, z up. Every drawn item carries the true shapes of what it draws (for the audit
  beside this file) and sits in a slot of the painter's order. A slot either stays still or moves with the card (x),
  the stamp head (z) or the signal collar on the mast (z); moving parts are built at a rest position and moved with a
  transform, so nothing is rebuilt per frame.

  The card only ever slides along x at one height, so its place in the painter's order never changes: everything on
  the line under it or behind it is drawn first, the stamp head, the front walls and the front of the bench after it.
*/
import {
  corners,
  cylinder as cylinderOf,
  depthOf,
  fitProjection,
  insetPlan,
  iso,
  knurl,
  lineOnTop,
  pathOf,
  planOutline,
  ring as ringOn,
  sideArc,
  sideSeam,
  slabOf,
  translateAlong,
  type Flat,
  type LineTone,
  type Plan,
  type Plane,
  type Point3,
  type Projection,
  type SolidPaths,
  type Tone,
} from '@/components/iso/kit/iso-kit'
import * as latheModule from '@/components/iso/kit/lathe.mjs'
import * as tubeModule from '@/components/iso/kit/tube.mjs'
import type { StationPose } from '@/components/iso/figures/ta-mobile/model'

export const WIDTH = 600
export const HEIGHT = 390
const AZIMUTH = 50
const ELEVATION = 40

// --- World layout -------------------------------------------------------------------------------------------------

const BASE: Plan = { x: -146, y: -80, w: 268, d: 156, r: 9 }
const BASE_H = 12
const FOOT_H = 5

// Top of the card line: press bed, outbox floor, belt and rack bin all meet the card's underside here.
const ZT = 12
const CARD_T = 0.8
const CARD: Plan = { x: -8, y: -10, w: 16, d: 20, r: 1 }

// Stamp press. The head rests up and presses down by STROKE onto the card.
const PRESS_CX = -106
const STROKE = 21 - ZT - CARD_T
const HEAD_LOW = 21

// Mast and the signal collar that drops by DROP when the signal is lost.
const MAST: Plane = [-59, -49]
const MAST_TOP = 66
const COLLAR_Z = 50
const DROP = 28

const P: Projection = fitProjection(
  [
    ...[BASE.x, BASE.x + BASE.w].flatMap(x => [BASE.y, BASE.y + BASE.d].flatMap(y => [-BASE_H - FOOT_H, 0].map((z): Point3 => [x, y, z]))),
    [MAST[0], MAST[1] - 11, 79],
    [MAST[0] + 4, MAST[1], 74],
    [62, -66, 58],
    [108, -66, 58],
    [108, -26, 58],
    [-126, 64, 51],
    [-126, 34, 51],
    [32, 60, 38],
    [58, 60, 38],
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: AZIMUTH, elevation: ELEVATION }
)

// --- The round-part and tube modules of the kit are plain JS; these are the slices of them this figure uses. ----------

export type Frame = { o: Point3, a: Point3, u: Point3, v: Point3 }

type Piece = { mid: Point3, body: string, shine: string, shade: string, edges: string, wide: boolean, points: Point3[], radii: number[] }

const G = latheModule as unknown as {
  viewOf (P: Projection): Point3
  frameAlong (o: Point3, a: Point3): Frame
  solidOf (profile: [number, number][], F: Frame, P: Projection): SolidPaths
  circleOf (F: Frame, s: number, r: number, P: Projection, steps?: number): string
  arcOf (F: Frame, s: number, r: number, P: Projection, options?: { steps?: number }): string
  fillet (points: Point3[], radius: number, perArc: number, options: { P: Projection, tube: number }): Point3[]
  pathLength (points: Point3[]): number
  tangentAlong (points: Point3[], at: number): Point3
  mul3 (a: Point3, k: number): Point3
  dot3 (a: Point3, b: Point3): number
}
const tubePieces = tubeModule.tubePieces as unknown as (points: Point3[], radius: number, P: Projection, options: { maxLength: number, spacing: number, gaps: [number, number][] }) => Piece[]

const at = (point: Point3) => iso(point, P)

// --- What an item draws and what it is ------------------------------------------------------------------------------

export type Shape =
  | { kind: 'slab', plan: Plan, z: number, h: number, steps: number }
  | { kind: 'cylinder', cx: number, cy: number, r: number, z: number, h: number }
  | { kind: 'turned', F: Frame, profile: [number, number][] }
  | { kind: 'tube', points: Point3[], radii: number[] }

export type Mark =
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', lit?: boolean, flat?: boolean, className?: string, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }
  | { kind: 'tube', body: string, shine: string, shade: string, edges: string, wide: boolean, tone: Tone }

type Meta = { owner?: string, ground?: boolean, limp?: boolean }

export type Item = { name: string, marks: Mark[], shapes: (Shape & { meta?: Meta })[] }

export type Move = 'still' | 'card' | 'mark' | 'head' | 'collar'

type Slot = { key: string, move: Move, items: Item[] }

type Route = { name: string, points: Point3[], r: number, gaps: [number, number][], rims: [number, number] }

const SLOTS: Slot[] = []
export const ROUTES: Route[] = []
let current: Slot = { key: 'start', move: 'still', items: [] }

function slot (key: string, move: Move) {
  current = { key, move, items: [] }
  SLOTS.push(current)
}

function item (name: string, marks: Mark[], shapes: Item['shapes'] = []) {
  current.items.push({ name, marks, shapes })
}

const solid = (paths: SolidPaths, tone: Tone = 'mid', options: Partial<Extract<Mark, { kind: 'solid' }>> = {}): Mark => ({ kind: 'solid', paths, tone, crease: 'faint', ...options })
const line = (d: string, tone: LineTone = 'lo', free = false): Mark => ({ kind: 'line', d, tone, free: free || undefined })
const dots = (points: Flat[], size = 0.5, tone: Tone = 'mid'): Mark => ({ kind: 'dots', points, size, tone })

type BlockOptions = { steps?: number, bevel?: number, extra?: Mark[], inner?: { d: string, tone: LineTone }[], crease?: Tone | 'none', meta?: Meta, lit?: boolean, flat?: boolean, className?: string }

// A rounded block: the commonest part. `extra` adds screws, grooves and seams drawn on it.
function block (name: string, plan: Plan, z: number, h: number, tone: Tone = 'mid', { steps = 4, bevel = 0.6, extra = [], inner, crease = 'faint', meta, lit, flat, className }: BlockOptions = {}) {
  item(name, [solid(slabOf(plan, z, h, P, steps, bevel), tone, { inner, crease, lit, flat, className }), ...extra], [{ kind: 'slab', plan, z, h, steps, meta }])
}

function post (name: string, cx: number, cy: number, r: number, z: number, h: number, tone: Tone = 'mid', { extra = [], steps = 28, crease = 'faint', lit, meta, className }: { extra?: Mark[], steps?: number, crease?: Tone | 'none', lit?: boolean, meta?: Meta, className?: string } = {}) {
  item(name, [solid(cylinderOf(cx, cy, r, z, h, P, steps), tone, { crease, lit, className }), ...extra], [{ kind: 'cylinder', cx, cy, r, z, h, meta }])
}

// A turned part on any axis: `profile` is [s, r] from one end to the other, closed to the axis at both ends.
function turned (name: string, F: Frame, profile: [number, number][], tone: Tone = 'mid', { extra = [], inner, meta }: { extra?: Mark[], inner?: { d: string, tone: LineTone }[], meta?: Meta } = {}) {
  item(name, [solid(G.solidOf(profile, F, P), tone, { inner }), ...extra], [{ kind: 'turned', F, profile, meta }])
}

const along = (o: Point3, a: Point3) => G.frameAlong(o, a)

const screwsOn = (points: Point3[], size = 0.5, tone: Tone = 'mid') => dots(points.map(at), size, tone)
const cornerScrews = (plan: Plan, inset: number, z: number) => corners(plan, inset).map(([x, y]): Point3 => [x, y, z])

// Closed outlines on the vertical faces x = const or y = const: slots, plates and screens drawn on a face.
const faceRectX = (x: number, y0: number, y1: number, z0: number, z1: number) => pathOf([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]].map(p => at(p as Point3)), true)
const faceRectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(p => at(p as Point3)), true)
// A line across a face of constant y, from one edge to the other.
const faceLineY = (y: number, x0: number, x1: number, z: number) => pathOf([at([x0, y, z]), at([x1, y, z])])

const byDepth = (points: Plane[]) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P))

// A cable from tube.mjs: chunks and the connector shell at each end as items, painted far to near.
function cable (name: string, points: Point3[], r: number) {
  const route = G.fillet(points, Math.max(3, r * 2.6), 10, { P, tube: r })
  const total = G.pathLength(route)
  const SHELL = Math.max(1.6, r * 2.4)
  const gaps: [number, number][] = [[0, SHELL], [total - SHELL, total]]
  ROUTES.push({ name, points: route, r, gaps, rims: [r * 1.9, r * 1.9] })
  const pieces = tubePieces(route, r, P, { maxLength: 14, spacing: Math.max(0.6, Math.min(1.6, r)), gaps })
  const chunks: Item[] = pieces
    .map((piece, index) => ({ piece, index, depth: depthOf(piece.mid, P) }))
    .sort((a, b) => a.depth - b.depth)
    .map(({ piece, index }) => ({ name: `${name}:${index}`, marks: [{ kind: 'tube', body: piece.body, shine: piece.shine, shade: piece.shade, edges: piece.edges, wide: piece.wide, tone: 'mid' }], shapes: [{ kind: 'tube', points: piece.points, radii: piece.radii, meta: { owner: name, limp: true } }] }))
  const view = G.viewOf(P)
  for (const index of [0, 1] as const) {
    const end = index ? route[route.length - 1] : route[0]
    const tangent = G.tangentAlong(route, index ? total : 0)
    const F = along(end, tangent)
    const profile: [number, number][] = index ? [[-SHELL, r * 1.9], [0, r * 1.9]] : [[0, r * 1.9], [SHELL, r * 1.9]]
    const shell: Item = { name: `${name}.shell${index}`, marks: [solid(G.solidOf(profile, F, P), 'mid')], shapes: [{ kind: 'turned', F, profile, meta: { owner: name } }] }
    // A shell is nearer than the chunk it caps when the cable runs away from the viewer out of it.
    const neighbour = chunks.findIndex(chunk => chunk.name === `${name}:${index ? pieces.length - 1 : 0}`)
    const outward = index ? tangent : G.mul3(tangent, -1)
    chunks.splice(G.dot3(outward, view) > 0 ? neighbour + 1 : neighbour, 0, shell)
  }
  chunks.forEach(part => current.items.push(part))
}

// --- Base -----------------------------------------------------------------------------------------------------------

slot('base', 'still')
item('stand.halo', [{ kind: 'halo', d: slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill }])
for (const [x, y] of byDepth(corners(BASE, 24))) {
  post('stand.foot', x, y, 7, -BASE_H - FOOT_H, 1.6, 'lo', { meta: { ground: true } })
  post('stand.foot.post', x, y, 5.4, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, 'mid')
}
block('stand.plate', BASE, -BASE_H, BASE_H, 'mid', {
  steps: 8,
  bevel: 1.6,
  inner: [{ d: sideSeam(BASE, -4.5, P, 8), tone: 'faint' }],
  extra: [
    line(planOutline(insetPlan(BASE, 5), 0, P), 'lo'),
    line(corners(BASE, 10).map(([x, y]) => ringOn(x, y, 2.2, 0, P, 16)).join(''), 'lo'),
    screwsOn(cornerScrews(BASE, 10, 0)),
  ],
  meta: { ground: true },
})

// --- Back of the bench: the uplink mast on its dock, the data cable, the server rack ---------------------------------

slot('back', 'still')
const DOCK: Plan = { x: -72, y: -62, w: 26, d: 26, r: 2 }
const DOCK_TOP = 8
block('dock.case', DOCK, 0, DOCK_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(DOCK, 3, P, 4), tone: 'faint' }],
  extra: [line(planOutline(insetPlan(DOCK, 2.2), DOCK_TOP, P, 4), 'faint'), screwsOn(cornerScrews(DOCK, 3.4, DOCK_TOP), 0.45)],
})
// The knurled gain knob on the dock's lid, with its index line.
const GAIN: Plane = [DOCK.x + 6, DOCK.y + 20]
post('dock.knob', GAIN[0], GAIN[1], 3, DOCK_TOP, 3.6, 'mid', {
  steps: 32,
  extra: [line(knurl(GAIN[0], GAIN[1], 3, DOCK_TOP, DOCK_TOP + 3.6, 26, P), 'lo'), line(lineOnTop(GAIN, [GAIN[0] + 2.2, GAIN[1] - 2.2], DOCK_TOP + 3.6, P), 'hi')],
})
// The data port on the dock's near face and the cable that runs along the bench to the rack's back.
const PORT_Y = -44
block('dock.port', { x: DOCK.x + DOCK.w, y: PORT_Y - 3, w: 1.4, d: 6, r: 0.5 }, 1.5, 6, 'mid', { bevel: 0, steps: 2 })
const CAB: Plan = { x: 62, y: -66, w: 46, d: 40, r: 2 }
const LANE = 1.6
cable('cable.data', [[DOCK.x + DOCK.w + 1.4, PORT_Y, 4.5], [-40, PORT_Y, 4.5], [-32, PORT_Y, LANE], [48, PORT_Y, LANE], [56, PORT_Y, 4.5], [CAB.x - 1.4, PORT_Y, 4.5]], 1)

// Mast: the antenna arm and whip behind it, the post, the collar that rides it, the lamp housing and the lamp.
const ARM_Z = 57
block('mast.arm', { x: MAST[0] - 1.5, y: MAST[1] - 12, w: 3, d: 10, r: 0.6 }, ARM_Z, 3, 'mid', { bevel: 0.3, steps: 2 })
const WHIP: Plane = [MAST[0], MAST[1] - 10]
post('mast.whip.base', WHIP[0], WHIP[1], 1.1, ARM_Z + 3, 1.6, 'mid', { steps: 16 })
post('mast.whip', WHIP[0], WHIP[1], 0.5, ARM_Z + 4.6, 16, 'mid', { steps: 12 })
turned('mast.whip.tip', along([WHIP[0], WHIP[1], ARM_Z + 20.6], [0, 0, 1]), [[0, 0.5], [0.4, 1], [1.4, 1]], 'mid')
post('mast.flange', MAST[0], MAST[1], 3.8, DOCK_TOP, 1.4, 'mid', { steps: 32, extra: [screwsOn([[MAST[0] + 3, MAST[1] + 0.9, DOCK_TOP + 1.4], [MAST[0] - 3, MAST[1] - 0.9, DOCK_TOP + 1.4]], 0.4)] })
const COLUMN_PLAN: Plan = { x: MAST[0] - 2, y: MAST[1] - 2, w: 4, d: 4, r: 0.6 }
const MAST_FRONT = COLUMN_PLAN.y + COLUMN_PLAN.d
// A signal scale: rungs across the column's front face, edge to edge.
const scale = Array.from({ length: 12 }, (_, index) => faceLineY(MAST_FRONT, COLUMN_PLAN.x, COLUMN_PLAN.x + COLUMN_PLAN.w, DOCK_TOP + 8 + index * 4)).join('')
block('mast.column', COLUMN_PLAN, DOCK_TOP + 1.4, MAST_TOP - DOCK_TOP - 1.4, 'mid', { bevel: 0.3, steps: 2, extra: [line(scale, 'lo')] })

// The signal slider rides the column's front face: up with a signal, down when it drops.
slot('collar', 'collar')
const SLIDER: Plan = { x: MAST[0] - 2.8, y: MAST_FRONT, w: 5.6, d: 2.2, r: 0.6 }
block('mast.slider', SLIDER, COLLAR_Z, 5, 'mid', {
  bevel: 0.3,
  steps: 2,
  inner: [{ d: sideSeam(SLIDER, COLLAR_Z + 2.5, P, 2), tone: 'hi' }],
  extra: [screwsOn([[MAST[0], SLIDER.y + SLIDER.d, COLLAR_Z + 4]], 0.4)],
})

slot('mast.top', 'still')
post('mast.housing', MAST[0], MAST[1], 4.6, MAST_TOP, 3, 'mid', { steps: 32, extra: [line(sideArc(MAST[0], MAST[1], 4.6, MAST_TOP + 1.5, P, 24), 'faint')] })
// The signal lamp: the one lit part.
post('mast.lamp', MAST[0], MAST[1], 4, MAST_TOP + 3, 3.6, 'hi', { steps: 32, lit: true, className: 'station-lamp' })
post('mast.lamp.cap', MAST[0], MAST[1], 1.6, MAST_TOP + 6.6, 1, 'mid', { steps: 20 })

// The server rack: a cabinet with drive bays and a status row on its front, vents on its side.
block('rack.port', { x: CAB.x - 1.4, y: PORT_Y - 3, w: 1.4, d: 6, r: 0.5 }, 1.5, 6, 'mid', { bevel: 0, steps: 2 })
const CAB_TOP = 58
const CAB_FRONT = CAB.y + CAB.d
const BAYS = [0, 1, 2, 3].map(index => faceRectY(CAB_FRONT, CAB.x + 6, CAB.x + CAB.w - 14, 40 - index * 7, 44.6 - index * 7)).join('')
const VENTS = [0, 1, 2, 3, 4].map(index => faceRectX(CAB.x + CAB.w, CAB.y + 8 + index * 5, CAB.y + 10.4 + index * 5, 30, 50)).join('')
block('rack.cabinet', CAB, 0, CAB_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(CAB, 6, P, 4) + sideSeam(CAB, CAB_TOP - 4, P, 4), tone: 'faint' }],
  extra: [
    line(BAYS, 'lo'),
    line(VENTS, 'lo'),
    line(planOutline(insetPlan(CAB, 3), CAB_TOP, P, 4), 'faint'),
    screwsOn(cornerScrews(CAB, 4, CAB_TOP), 0.5),
    dots([0, 1, 2, 3].map(index => at([CAB.x + CAB.w - 9, CAB_FRONT, 42.3 - index * 7])), 0.7, 'hi'),
    screwsOn([[CAB.x + 3, CAB_FRONT, 12], [CAB.x + CAB.w - 3, CAB_FRONT, 12], [CAB.x + 3, CAB_FRONT, 50], [CAB.x + CAB.w - 3, CAB_FRONT, 50]], 0.45),
  ],
})

// --- The press column, behind the line -----------------------------------------------------------------------------

const COLUMN: Plan = { x: PRESS_CX - 8, y: -42, w: 16, d: 14, r: 1.5 }
const ARM_LOW = 44
const ARM_TOP = 52
block('press.column', COLUMN, 0, ARM_LOW, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(COLUMN, 4, P, 4), tone: 'faint' }],
  extra: [line(faceRectY(COLUMN.y + COLUMN.d, COLUMN.x + 4, COLUMN.x + 12, 10, 30), 'faint'), screwsOn([[COLUMN.x + 4, COLUMN.y + COLUMN.d, 7], [COLUMN.x + 12, COLUMN.y + COLUMN.d, 7]], 0.45)],
})

// --- The card line, under and behind the card ---------------------------------------------------------------------

slot('line.back', 'still')
const BED: Plan = { x: -128, y: -16, w: 44, d: 32, r: 2 }
block('press.bed', BED, 0, ZT, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(BED, 4, P, 4), tone: 'faint' }],
  extra: [line(planOutline({ x: PRESS_CX - 10, y: -12, w: 20, d: 24, r: 1 }, ZT, P, 3), 'faint'), screwsOn(cornerScrews(BED, 3, ZT), 0.45)],
})
const BIN: Plan = { x: -78, y: -16, w: 32, d: 32, r: 2 }
block('outbox.base', BIN, 0, ZT, 'mid', { bevel: 0.8, inner: [{ d: sideSeam(BIN, 4, P, 4), tone: 'faint' }] })
const WALL_H = 6
block('outbox.wall.back', { x: BIN.x, y: BIN.y, w: BIN.w, d: 3, r: 0.8 }, ZT, WALL_H, 'mid', { bevel: 0.4, steps: 2 })

const BELT_X0 = -38
const BELT_X1 = 54
const RAIL_LOW = 6
const RAIL_TOP = ZT + 1.5
for (const x of [-42, 48]) block('belt.leg', { x, y: -14, w: 6, d: 28, r: 1 }, 0, RAIL_LOW, 'lo', { bevel: 0.4 })
block('belt.rail.back', { x: -42, y: -14, w: 100, d: 3, r: 0.8 }, RAIL_LOW, RAIL_TOP - RAIL_LOW, 'mid', {
  bevel: 0.4,
  steps: 2,
  extra: [screwsOn([-39, 51].map((x): Point3 => [x, -11, RAIL_LOW + 3.5]), 0.4)],
})
const ROLLER_R = 1.8
const ROLLER_Z = ZT - CARD_T - ROLLER_R
for (const x of [BELT_X0, BELT_X1]) {
  const F = along([x, -11, ROLLER_Z], [0, 1, 0])
  turned('belt.roller', F, [[0, ROLLER_R], [22, ROLLER_R]], 'mid', { inner: [{ d: G.arcOf(F, 2, ROLLER_R, P) + G.arcOf(F, 20, ROLLER_R, P), tone: 'faint' }] })
}
const BELT: Plan = { x: BELT_X0, y: -10.5, w: BELT_X1 - BELT_X0, d: 21, r: 0.4 }
const CLEATS = Array.from({ length: 15 }, (_, index) => lineOnTop([BELT_X0 + 4 + index * 6, BELT.y], [BELT_X0 + 4 + index * 6, BELT.y + BELT.d], ZT - CARD_T + 0.8, P)).join('')
block('belt.band', BELT, ZT - CARD_T, 0.8, 'lo', { bevel: 0, steps: 2, crease: 'none', extra: [line(CLEATS, 'faint')] })

const RBIN: Plan = { x: 62, y: -16, w: 30, d: 32, r: 2 }
block('rackbin.base', RBIN, 0, ZT, 'mid', { bevel: 0.8, inner: [{ d: sideSeam(RBIN, 4, P, 4), tone: 'faint' }] })
block('rackbin.wall.back', { x: RBIN.x, y: RBIN.y, w: RBIN.w, d: 3, r: 0.8 }, ZT, WALL_H, 'mid', { bevel: 0.4, steps: 2 })

// --- The journal card and its stamp mark (they slide together along x) ---------------------------------------------

slot('card', 'card')
const CARD_TOP = ZT + CARD_T
// Printed rows stand for the entry's text; the frame is where the photo sits.
const ROWS = [10, 8, 11].map((w, row) => lineOnTop([CARD.x + 2.4, CARD.y + 3 + row * 2.2], [CARD.x + 2.4 + w, CARD.y + 3 + row * 2.2], CARD_TOP, P)).join('')
block('card', CARD, ZT, CARD_T, 'hi', {
  bevel: 0,
  steps: 2,
  crease: 'none',
  className: 'station-card',
  extra: [line(ROWS, 'lo', true), line(planOutline({ x: CARD.x + 2.4, y: CARD.y + 10.4, w: 7, d: 7, r: 0.4 }, CARD_TOP, P, 2), 'mid')],
})

slot('mark', 'mark')
const STAMP_AT: Plane = [CARD.x + 11.6, CARD.y + 13.9]
item('card.mark', [line(ringOn(STAMP_AT[0], STAMP_AT[1], 2.4, CARD_TOP, P, 24) + ringOn(STAMP_AT[0], STAMP_AT[1], 1.4, CARD_TOP, P, 20), 'hi'), dots([at([STAMP_AT[0], STAMP_AT[1], CARD_TOP])], 0.6, 'hi')])

// --- The stamp head, its ram, the sleeve and the arm above it ---------------------------------------------------------

slot('head', 'head')
const HEAD: Plan = { x: PRESS_CX - 7, y: -7, w: 14, d: 14, r: 1.5 }
block('press.pad', insetPlan(HEAD, 1), HEAD_LOW, 1, 'lo', { bevel: 0, steps: 3, meta: { owner: 'press' } })
block('press.head', HEAD, HEAD_LOW + 1, 6, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(HEAD, HEAD_LOW + 3, P, 4), tone: 'faint' }],
  extra: [screwsOn(cornerScrews(HEAD, 2.4, HEAD_LOW + 7), 0.45)],
  meta: { owner: 'press' },
})
post('press.ram', PRESS_CX, 0, 1.6, HEAD_LOW + 7, ARM_LOW - HEAD_LOW - 7, 'mid', { steps: 20, meta: { owner: 'press' } })

slot('press.top', 'still')
post('press.sleeve', PRESS_CX, 0, 3.4, ARM_LOW - 10, 10, 'mid', { steps: 32, extra: [line(sideArc(PRESS_CX, 0, 3.4, ARM_LOW - 5, P, 24), 'faint')], meta: { owner: 'press' } })
const ARM: Plan = { x: COLUMN.x, y: COLUMN.y, w: COLUMN.w, d: 48, r: 1.5 }
block('press.arm', ARM, ARM_LOW, ARM_TOP - ARM_LOW, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(ARM, ARM_LOW + 3, P, 4), tone: 'faint' }],
  extra: [screwsOn([[ARM.x + 3.4, ARM.y + 3.4, ARM_TOP], [ARM.x + ARM.w - 3.4, ARM.y + 3.4, ARM_TOP], [ARM.x + 3.4, ARM.y + ARM.d - 3.4, ARM_TOP], [ARM.x + ARM.w - 3.4, ARM.y + ARM.d - 3.4, ARM_TOP]], 0.45)],
  meta: { owner: 'press' },
})
const DEPTH_KNOB: Plane = [PRESS_CX, -24]
post('press.knob', DEPTH_KNOB[0], DEPTH_KNOB[1], 3.2, ARM_TOP, 4, 'mid', {
  steps: 32,
  extra: [line(knurl(DEPTH_KNOB[0], DEPTH_KNOB[1], 3.2, ARM_TOP, ARM_TOP + 4, 28, P), 'lo'), line(ringOn(DEPTH_KNOB[0], DEPTH_KNOB[1], 1.2, ARM_TOP + 4, P, 14), 'lo')],
})

// --- In front of the card: the outbox's slotted front wall, the belt's front rail, the rack bin's walls -----------

slot('line.front', 'still')
const SLOTS_FRONT = [0, 1, 2, 3].map(index => faceRectY(BIN.y + BIN.d, BIN.x + 5 + index * 6.4, BIN.x + 8.2 + index * 6.4, ZT + 1.4, ZT + WALL_H - 1.4)).join('')
block('outbox.wall.front', { x: BIN.x, y: BIN.y + BIN.d - 3, w: BIN.w, d: 3, r: 0.8 }, ZT, WALL_H, 'mid', { bevel: 0.4, steps: 2, extra: [line(SLOTS_FRONT, 'lo')] })
const FRONT_RAIL: Plan = { x: -42, y: 11, w: 100, d: 3, r: 0.8 }
block('belt.rail.front', FRONT_RAIL, RAIL_LOW, RAIL_TOP - RAIL_LOW, 'mid', {
  bevel: 0.4,
  steps: 2,
  inner: [{ d: sideSeam(FRONT_RAIL, RAIL_LOW + 2, P, 2), tone: 'faint' }],
  extra: [screwsOn([-39, 51].map((x): Point3 => [x, 14, RAIL_LOW + 3.5]), 0.4)],
})
block('rackbin.wall.end', { x: RBIN.x + RBIN.w - 3, y: RBIN.y + 3, w: 3, d: RBIN.d - 6, r: 0.6 }, ZT, WALL_H, 'mid', { bevel: 0.4, steps: 2 })
block('rackbin.wall.front', { x: RBIN.x, y: RBIN.y + RBIN.d - 3, w: RBIN.w, d: 3, r: 0.8 }, ZT, WALL_H, 'mid', { bevel: 0.4, steps: 2 })

// --- Front of the bench: the handheld logger on its cradle, the plot tray, the weather vane, the label plate --------

slot('front', 'still')
const CRADLE: Plan = { x: -134, y: 30, w: 30, d: 40, r: 3 }
const CRADLE_TOP = 8
block('logger.cradle', CRADLE, 0, CRADLE_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(CRADLE, 3, P, 4), tone: 'faint' }],
  extra: [screwsOn([[CRADLE.x + 3, CRADLE.y + 3, CRADLE_TOP], [CRADLE.x + 3, CRADLE.y + CRADLE.d - 3, CRADLE_TOP], [CRADLE.x + CRADLE.w - 3, CRADLE.y + CRADLE.d - 3, CRADLE_TOP]], 0.45)],
})
const LOGGER: Plan = { x: -126, y: 34, w: 8, d: 30, r: 2 }
const LOGGER_TOP = 50
const FACE_X = LOGGER.x + LOGGER.w
block('logger.body', LOGGER, CRADLE_TOP, LOGGER_TOP - CRADLE_TOP, 'mid', {
  bevel: 0.6,
  inner: [{ d: sideSeam(LOGGER, CRADLE_TOP + 4, P, 4), tone: 'faint' }],
  extra: [screwsOn([[FACE_X, LOGGER.y + 2.4, LOGGER_TOP - 2.4], [FACE_X, LOGGER.y + LOGGER.d - 2.4, LOGGER_TOP - 2.4], [FACE_X, LOGGER.y + 2.4, 14], [FACE_X, LOGGER.y + LOGGER.d - 2.4, 14]], 0.4)],
})
// The screen: a journal form, its rows standing for text and a photo frame.
const SCREEN = { y0: LOGGER.y + 4, y1: LOGGER.y + LOGGER.d - 4, z0: 17, z1: 41 }
const SX = FACE_X + 0.8
const FORM_ROWS = [0, 1, 2].map(row => pathOf([at([SX, SCREEN.y1 - 2.5, SCREEN.z1 - 3 - row * 2.6]), at([SX, SCREEN.y1 - 2.5 - [14, 10, 12][row], SCREEN.z1 - 3 - row * 2.6])])).join('')
block('logger.screen', { x: FACE_X, y: SCREEN.y0, w: 0.8, d: SCREEN.y1 - SCREEN.y0, r: 0.4 }, SCREEN.z0, SCREEN.z1 - SCREEN.z0, 'hi', {
  bevel: 0,
  steps: 2,
  crease: 'none',
  extra: [line(FORM_ROWS, 'lo', true), line(faceRectX(SX, SCREEN.y0 + 2.5, SCREEN.y0 + 11, SCREEN.z0 + 2.5, SCREEN.z0 + 10), 'mid')],
})
block('logger.lip', { x: FACE_X, y: LOGGER.y, w: 3, d: LOGGER.d, r: 0.8 }, CRADLE_TOP, 4, 'mid', { bevel: 0.4, steps: 2 })
// The camera: a lens ring and its glass on the face above the screen; the shutter button on the top.
const LENS_F = along([FACE_X, LOGGER.y + 22, 45.5], [1, 0, 0])
turned('logger.lens.ring', LENS_F, [[0, 2.8], [1.2, 2.8]], 'mid', { extra: [line(G.circleOf(LENS_F, 1.2, 2, P, 24), 'lo')] })
turned('logger.lens.glass', LENS_F, [[1.2, 1.5], [1.7, 1.5]], 'hi')
post('logger.shutter', LOGGER.x + 4, LOGGER.y + 6, 1.6, LOGGER_TOP, 1.4, 'mid', { steps: 20, extra: [line(ringOn(LOGGER.x + 4, LOGGER.y + 6, 0.7, LOGGER_TOP + 1.4, P, 12), 'lo')] })
// The stylus lies on the cradle in front of the lip, tied to the logger by a lanyard.
const STYLUS_X = -109
const STYLUS_R = 1.1
const STYLUS_F = along([STYLUS_X, 36, CRADLE_TOP + STYLUS_R], [0, 1, 0])
turned('logger.stylus', STYLUS_F, [[0, 0.3], [2.4, STYLUS_R], [22, STYLUS_R], [22.6, 0.9], [25, 0.9]], 'hi', { inner: [{ d: G.arcOf(STYLUS_F, 4, STYLUS_R, P), tone: 'lo' }] })
cable('logger.lanyard', [[FACE_X, LOGGER.y + LOGGER.d - 3.6, 15], [FACE_X + 4, LOGGER.y + LOGGER.d - 3.6, 15], [STYLUS_X - 1, 66.5, 11], [STYLUS_X, 66, CRADLE_TOP + STYLUS_R], [STYLUS_X, 36 + 25, CRADLE_TOP + STYLUS_R]], 0.45)

// The plot tray: a growing area with furrows and four crop pegs.
const TRAY: Plan = { x: -94, y: 28, w: 52, d: 40, r: 3 }
const TRAY_TOP = 4
const SOIL = insetPlan(TRAY, 3)
block('plot.tray', TRAY, 0, TRAY_TOP, 'mid', { bevel: 0.6, extra: [screwsOn(cornerScrews(TRAY, 1.6, TRAY_TOP), 0.4)] })
const FURROWS = [1, 2, 3, 4].map(row => lineOnTop([SOIL.x, SOIL.y + row * 6.8], [SOIL.x + SOIL.w, SOIL.y + row * 6.8], TRAY_TOP + 0.5, P)).join('')
block('plot.soil', SOIL, TRAY_TOP, 0.5, 'lo', { bevel: 0, steps: 2, crease: 'none', flat: true, extra: [line(FURROWS, 'faint')] })
for (const [x, y] of byDepth([[SOIL.x + 10, SOIL.y + 6.8], [SOIL.x + 26, SOIL.y + 13.6], [SOIL.x + 38, SOIL.y + 6.8], [SOIL.x + 20, SOIL.y + 27.2]])) {
  post('plot.peg', x, y, 0.8, TRAY_TOP + 0.5, 8, 'mid', { steps: 14 })
  turned('plot.peg.leaf', along([x, y, TRAY_TOP + 8.5], [0, 0, 1]), [[0, 0.8], [1.6, 2.6], [4.2, 0.5]], 'hi')
}

// The weather vane: a footed post, a hub, the arm with its arrow and its tail fin.
const VANE: Plane = [44, 60]
const VANE_HUB = 28
post('vane.foot', VANE[0], VANE[1], 5, 0, 1.6, 'mid', { steps: 32, extra: [screwsOn([[VANE[0] + 3.4, VANE[1], 1.6], [VANE[0] - 3.4, VANE[1], 1.6]], 0.4)] })
post('vane.post', VANE[0], VANE[1], 1, 1.6, VANE_HUB - 1.6, 'mid', { steps: 16, extra: [line(sideArc(VANE[0], VANE[1], 1, 8, P, 12), 'faint')] })
post('vane.hub', VANE[0], VANE[1], 1.8, VANE_HUB, 3, 'mid', { steps: 20, extra: [line(sideArc(VANE[0], VANE[1], 1.8, VANE_HUB + 1.5, P, 16), 'faint')] })
const VANE_ARM_Z = VANE_HUB + 3
block('vane.arm', { x: VANE[0] - 12, y: VANE[1] - 0.5, w: 22, d: 1, r: 0.3 }, VANE_ARM_Z, 1, 'mid', { bevel: 0, steps: 1 })
block('vane.tail', { x: VANE[0] - 12, y: VANE[1] - 0.4, w: 6, d: 0.8, r: 0.2 }, VANE_ARM_Z + 1, 6, 'mid', { bevel: 0, steps: 1 })
turned('vane.arrow', along([VANE[0] + 10, VANE[1], VANE_ARM_Z + 0.5], [1, 0, 0]), [[0, 1.8], [3.4, 0.2]], 'hi')

// Label plate at the front, between the tray and the vane, three rule lines that stand for its print.
const LABEL: Plan = { x: -30, y: 48, w: 30, d: 18, r: 1.2 }
block('stand.label', LABEL, 0, 0.8, 'lo', {
  crease: 'none',
  bevel: 0,
  steps: 3,
  extra: [
    line(planOutline(insetPlan(LABEL, 1.4), 0.8, P, 3), 'faint'),
    line([18, 12, 15].map((w, row) => lineOnTop([LABEL.x + 4, LABEL.y + 4.5 + row * 3.6], [LABEL.x + 4 + w, LABEL.y + 4.5 + row * 3.6], 0.8, P)).join(''), 'lo', true),
    screwsOn([[LABEL.x + LABEL.w - 2.6, LABEL.y + 2.6, 0.8], [LABEL.x + LABEL.w - 2.6, LABEL.y + LABEL.d - 2.6, 0.8]], 0.45),
  ],
})

// --- Exports for the static art, the live loop and the audit ----------------------------------------------------

export const PARTS = SLOTS
export const PROJECTION = P

// World offsets of the moving slots for a pose: the card along x, the head down, the collar down the mast.
export function offsetsOf (pose: StationPose): Record<Exclude<Move, 'still'>, Point3> {
  const card: Point3 = [pose.cardX, 0, 0]
  return { card, mark: card, head: [0, 0, -pose.press * STROKE], collar: [0, 0, -(1 - pose.signal) * DROP] }
}

// Screen transforms for the moving slots.
export function movesOf (pose: StationPose) {
  const offsets = offsetsOf(pose)
  return {
    card: translateAlong(P, offsets.card),
    mark: translateAlong(P, offsets.mark),
    head: translateAlong(P, offsets.head),
    collar: translateAlong(P, offsets.collar),
  }
}
