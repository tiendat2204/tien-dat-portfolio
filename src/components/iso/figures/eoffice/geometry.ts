/*
  The routing sorter, built once from the kit. World units are about 1 px, x runs along the belt (feed on the left,
  out-tray on the right), y across it, z up. Every drawn item carries the true shapes of what it draws (for the audit
  beside this file) and sits in a slot of the painter's order. A slot stays still, moves with the sheet (x), moves
  with one station's press carriage (z), or is one gate's flap, whose few paths are rebuilt for its swing angle.
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
  sideTicks,
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
import { GATES, MARK_AHEAD, OUT_X, STATIONS } from '@/components/iso/figures/eoffice/model'

export const WIDTH = 600
export const HEIGHT = 390
const AZIMUTH = 50
const ELEVATION = 40

// --- World layout -------------------------------------------------------------------------------------------------

const BASE: Plan = { x: -172, y: -84, w: 344, d: 134, r: 9 }
const BASE_H = 12
const FOOT_H = 5

// The conveyor: two side rails, a drum at each end under the belt, a bed between them.
const RAIL_H = 14
const RAIL_X0 = -120
const RAIL_X1 = 114
const BELT_Y = 30
const DRUM_R = 5
const DRUM_X = [-112, 106]
const BELT_Z = DRUM_R * 2
const BELT_TOP = BELT_Z + 1

// The document: a sheet built at x = 0 and moved along the belt.
const SHEET_T = 0.6
const SHEET: Plan = { x: -20, y: -26, w: 40, d: 52, r: 0.6 }
const SHEET_TOP = BELT_TOP + SHEET_T

// Stations: a press column behind the belt, a carriage riding its front face, an arm over the belt, a stamp head.
const COLUMN_TOP = 42
const COLUMN_Y = -50
const COLUMN_D = 8
// Carriage and arm heights with the press down on the sheet; the live loop lifts them by up to STROKE.
const CARRIAGE_Z = 14
const CARRIAGE_H = 12
const ARM_Z = 18
const ARM_H = 4
const DIE_H = 2
const HEAD_R = 4
const DIE_R = 4.6
// Where each station's stamp lands across the sheet: draft at the back, approved at the front.
const MARK_Y = [-14, 0, 14]

// Gates: an axle across the belt between two posts on the rail tops, a flap hanging from it.
const AXLE_R = 1.4
const FLAP_T = 1.2
const FLAP_H = 12
const AXLE_Z = BELT_TOP + 0.3 + FLAP_H
const POST_TOP = AXLE_Z + AXLE_R + 1.2
const FLAP_Y = BELT_Y - 0.5

// Trays.
const TRAY_IN: Plan = { x: -168, y: -32, w: 44, d: 64, r: 2 }
const TRAY_IN_TOP = 7.6
const TRAY_OUT: Plan = { x: 116, y: -32, w: 50, d: 64, r: 2 }
const TRAY_OUT_TOP = BELT_TOP - SHEET_T * 2
const WALL_TOP = 16

// The control box at the back left, and the terminal blocks its leads run to.
const BOX: Plan = { x: -166, y: -80, w: 36, d: 24, r: 2 }
const BOX_TOP = 14
const LEAD_Z = 6

const box = ({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] =>
  [x, x + w].flatMap(px => [y, y + d].flatMap(py => [z0, z1].map((pz): Point3 => [px, py, pz])))

const P: Projection = fitProjection(
  [
    ...box(BASE, -BASE_H - FOOT_H, 0),
    ...box({ x: STATIONS[0] - 6, y: COLUMN_Y, w: STATIONS[2] - STATIONS[0] + 12, d: COLUMN_D, r: 0 }, 0, COLUMN_TOP + 6),
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
  prismOf (F: Frame, polygon: Plane[], s0: number, s1: number, P: Projection): SolidPaths
  arcOf (F: Frame, s: number, r: number, P: Projection, options?: { steps?: number }): string
  circleOf (F: Frame, s: number, r: number, P: Projection, steps?: number): string
  ribsOf (F: Frame, s0: number, s1: number, r: number, count: number, P: Projection, options: { fade: [number, number] }): { d: string, alpha: number }[]
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
  | { kind: 'prism', F: Frame, polygon: Plane[], s0: number, s1: number }
  | { kind: 'tube', points: Point3[], radii: number[] }

export type Mark =
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', lit?: boolean, className?: string, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }
  | { kind: 'stamp', index: number, d: string }
  | { kind: 'tube', body: string, shine: string, shade: string, edges: string, wide: boolean, tone: Tone }

type Meta = { owner?: string, ground?: boolean, limp?: boolean }

export type Item = { name: string, marks: Mark[], shapes: (Shape & { meta?: Meta })[] }

type Route = { name: string, points: Point3[], r: number, gaps: [number, number][], rims: [number, number] }

type Move = 'still' | 'sheet' | 'press' | 'flap'

// `index` names the station of a press or flap slot.
export type Slot = { key: string, move: Move, index: number, items: Item[] }

const SLOTS: Slot[] = []
export const ROUTES: Route[] = []
let current: Slot = { key: 'start', move: 'still', index: 0, items: [] }

function slot (key: string, move: Move = 'still', index = 0) {
  current = { key, move, index, items: [] }
  SLOTS.push(current)
}

function item (name: string, marks: Mark[], shapes: Item['shapes'] = []) {
  current.items.push({ name, marks, shapes })
}

const solid = (paths: SolidPaths, tone: Tone = 'mid', options: Partial<Extract<Mark, { kind: 'solid' }>> = {}): Mark => ({ kind: 'solid', paths, tone, crease: 'faint', ...options })
const line = (d: string, tone: LineTone = 'lo', free = false): Mark => ({ kind: 'line', d, tone, free: free || undefined })
const dots = (points: Flat[], size = 0.5, tone: Tone = 'mid'): Mark => ({ kind: 'dots', points, size, tone })

const slabShape = (plan: Plan, z: number, h: number, steps = 4, meta?: Meta) => ({ kind: 'slab' as const, plan, z, h, steps, meta })
const cylShape = (cx: number, cy: number, r: number, z: number, h: number, meta?: Meta) => ({ kind: 'cylinder' as const, cx, cy, r, z, h, meta })

type BlockOptions = { steps?: number, bevel?: number, extra?: Mark[], inner?: { d: string, tone: LineTone }[], crease?: Tone | 'none', meta?: Meta, lit?: boolean, className?: string }

// A rounded block: the commonest part. `extra` adds screws, grooves and seams drawn on it.
function block (name: string, plan: Plan, z: number, h: number, tone: Tone = 'mid', { steps = 4, bevel = 0.6, extra = [], inner, crease = 'faint', meta, lit, className }: BlockOptions = {}) {
  item(name, [solid(slabOf(plan, z, h, P, steps, bevel), tone, { inner, crease, lit, className }), ...extra], [slabShape(plan, z, h, steps, meta)])
}

function post (name: string, cx: number, cy: number, r: number, z: number, h: number, tone: Tone = 'mid', { extra = [], steps = 28, crease = 'faint', lit, meta }: { extra?: Mark[], steps?: number, crease?: Tone | 'none', lit?: boolean, meta?: Meta } = {}) {
  item(name, [solid(cylinderOf(cx, cy, r, z, h, P, steps), tone, { crease, lit }), ...extra], [cylShape(cx, cy, r, z, h, meta)])
}

// A turned part on any axis: `profile` is [s, r] from one end to the other, closed to the axis at both ends.
function turned (name: string, F: Frame, profile: [number, number][], tone: Tone = 'mid', { extra = [], inner }: { extra?: Mark[], inner?: { d: string, tone: LineTone }[] } = {}) {
  item(name, [solid(G.solidOf(profile, F, P), tone, { inner }), ...extra], [{ kind: 'turned', F, profile }])
}

const along = (o: Point3, a: Point3) => G.frameAlong(o, a)

const screwsOn = (points: Point3[], size = 0.5, tone: Tone = 'mid') => dots(points.map(at), size, tone)
const cornerScrews = (plan: Plan, inset: number, z: number) => corners(plan, inset).map(([x, y]): Point3 => [x, y, z])

// A closed rectangle on the vertical face y = const, for slots, vents and plates on faces.
const faceRectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(p => at(p as Point3)), true)

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

slot('base')
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

// Label plate in the back right corner, behind the approved station, three rule lines that stand for its print.
const LABEL: Plan = { x: 104, y: -76, w: 34, d: 18, r: 1.2 }
block('stand.label', LABEL, 0, 0.8, 'lo', {
  crease: 'none',
  bevel: 0,
  steps: 3,
  extra: [
    line(planOutline(insetPlan(LABEL, 1.4), 0.8, P, 3), 'faint'),
    line([22, 14, 18].map((w, row) => lineOnTop([LABEL.x + 4, LABEL.y + 4.5 + row * 3.4], [LABEL.x + 4 + w, LABEL.y + 4.5 + row * 3.4], 0.8, P)).join(''), 'lo', true),
    screwsOn([[LABEL.x + LABEL.w - 2.6, LABEL.y + 2.6, 0.8], [LABEL.x + LABEL.w - 2.6, LABEL.y + LABEL.d - 2.6, 0.8]], 0.45),
  ],
})

// --- Back row: control box, its two leads, the stations' terminals, columns and lamps -------------------

slot('back')
const BOX_FACE = BOX.y + BOX.d
const BOX_VENTS = [0, 1, 2, 3, 4].map(index => faceRectY(BOX_FACE, BOX.x + 5 + index * 4, BOX.x + 7 + index * 4, 3.5, 9.5)).join('')
block('box.case', BOX, 0, BOX_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(BOX, BOX_TOP - 2.6, P, 4), tone: 'faint' }],
  extra: [line(BOX_VENTS, 'lo'), line(planOutline(insetPlan(BOX, 2.2), BOX_TOP, P, 4), 'faint'), screwsOn(cornerScrews(BOX, 3.6, BOX_TOP), 0.45)],
})
const KNOB: Plane = [BOX.x + 26, BOX.y + 12]
post('box.knob', KNOB[0], KNOB[1], 4.2, BOX_TOP, 4.4, 'mid', {
  steps: 32,
  extra: [line(knurl(KNOB[0], KNOB[1], 4.2, BOX_TOP, BOX_TOP + 4.4, 30, P), 'lo'), line(lineOnTop(KNOB, [KNOB[0] + 2.6, KNOB[1] + 2.6], BOX_TOP + 4.4, P), 'hi')],
})

// Each lead leaves the box's right face and runs along the back margin to the terminal block on a column's back.
const TERMINAL_Y = COLUMN_Y - 5
cable('lead.approved', [[BOX.x + BOX.w, -72, LEAD_Z], [STATIONS[2], -72, LEAD_Z], [STATIONS[2], TERMINAL_Y, LEAD_Z]], 0.8)
cable('lead.draft', [[BOX.x + BOX.w, -63, LEAD_Z], [STATIONS[0], -63, LEAD_Z], [STATIONS[0], TERMINAL_Y, LEAD_Z]], 0.8)

for (const [index, x] of STATIONS.entries()) {
  if (index !== 1) {
    const plan: Plan = { x: x - 3.5, y: TERMINAL_Y, w: 7, d: 5, r: 0.6 }
    block(`station.${index}.terminal`, plan, 2.5, 7, 'mid', { bevel: 0.3, steps: 2, extra: [screwsOn([[x - 2, TERMINAL_Y + 2.5, 9.5], [x + 2, TERMINAL_Y + 2.5, 9.5]], 0.45)] })
  }
  const column: Plan = { x: x - 5, y: COLUMN_Y, w: 10, d: COLUMN_D, r: 1.2 }
  block(`station.${index}.column`, column, 0, COLUMN_TOP, 'mid', {
    bevel: 0.8,
    inner: [{ d: sideSeam(column, 4, P, 4) + sideSeam(column, COLUMN_TOP - 4, P, 4), tone: 'faint' }],
    extra: [screwsOn(cornerScrews(column, 2.2, COLUMN_TOP), 0.45)],
  })
  // Status lamp on the column's top; the approved station's lamp is the figure's one lit part.
  post(`station.${index}.lamp.base`, x, COLUMN_Y + COLUMN_D / 2, 4.8, COLUMN_TOP, 1.6, 'mid', { steps: 32 })
  post(`station.${index}.lamp`, x, COLUMN_Y + COLUMN_D / 2, 4.2, COLUMN_TOP + 1.6, 4.4, index === 2 ? 'hi' : 'mid', {
    steps: 32,
    lit: index === 2,
    crease: index === 2 ? 'lo' : 'faint',
    extra: [line(ringOn(x, COLUMN_Y + COLUMN_D / 2, 2, COLUMN_TOP + 6, P, 20), index === 2 ? 'lit' : 'lo')],
  })
}

// --- In-tray at the feed end: a stack of sheets waiting -----------------------------------------------------------

slot('tray.in')
block('tray.in.body', TRAY_IN, 0, TRAY_IN_TOP, 'mid', { bevel: 0.6, inner: [{ d: sideSeam(TRAY_IN, 2.6, P, 4), tone: 'faint' }] })
block('tray.in.back', { x: TRAY_IN.x, y: TRAY_IN.y, w: TRAY_IN.w, d: 2.4, r: 0.6 }, TRAY_IN_TOP, WALL_TOP - TRAY_IN_TOP, 'mid', { bevel: 0.3, steps: 2 })
block('tray.in.side', { x: TRAY_IN.x, y: TRAY_IN.y + 2.4, w: 2.4, d: TRAY_IN.d - 4.8, r: 0.6 }, TRAY_IN_TOP, WALL_TOP - TRAY_IN_TOP, 'mid', { bevel: 0.3, steps: 2 })
for (let index = 0; index < 3; index++) {
  const plan: Plan = { x: -164.6 + [0, 0.8, 0.2][index], y: -27 + [0, 0.6, -0.4][index], w: 40, d: 52, r: 0.6 }
  block('tray.in.sheet', plan, TRAY_IN_TOP + index * SHEET_T, SHEET_T, 'hi', { bevel: 0, steps: 2, crease: 'none', className: 'sorter-paper' })
}

// --- Conveyor: back rail, gate posts, drums, bed, belt ------------------------------------------------------------

slot('conveyor.back')
const railPlan = (y: number): Plan => ({ x: RAIL_X0, y, w: RAIL_X1 - RAIL_X0, d: 4, r: 1 })
block('rail.back', railPlan(-BELT_Y - 4), 0, RAIL_H, 'mid', { bevel: 0.5, extra: [screwsOn([-104, -66, 2, 58, 86].map((x): Point3 => [x, -BELT_Y - 2, RAIL_H]), 0.4, 'lo')] })
const gatePost = (name: string, x: number, y: number) =>
  block(name, { x: x - 3, y, w: 6, d: 4, r: 0.8 }, RAIL_H, POST_TOP - RAIL_H, 'mid', { bevel: 0.4, steps: 3, extra: [screwsOn([[x, y + 2, POST_TOP]], 0.45)] })
for (const [index, x] of GATES.entries()) gatePost(`gate.${index}.post.back`, x, -BELT_Y - 4)

const drum = (name: string, x: number) => {
  const F = along([x, -BELT_Y, DRUM_R], [0, 1, 0])
  turned(name, F, [[0, DRUM_R], [BELT_Y * 2, DRUM_R]], 'mid', { inner: [{ d: [12, 24, 36, 48].map(s => G.arcOf(F, s, DRUM_R, P)).join(''), tone: 'faint' }] })
}
drum('drum.feed', DRUM_X[0])
const BED: Plan = { x: DRUM_X[0] + DRUM_R + 0.5, y: -BELT_Y, w: DRUM_X[1] - DRUM_X[0] - DRUM_R * 2 - 1, d: BELT_Y * 2, r: 0.4 }
block('conveyor.bed', BED, 0, BELT_Z, 'lo', { bevel: 0, steps: 2, crease: 'none' })
drum('drum.drive', DRUM_X[1])
block('conveyor.belt', { x: DRUM_X[0], y: -BELT_Y, w: DRUM_X[1] - DRUM_X[0], d: BELT_Y * 2, r: 0.6 }, BELT_Z, BELT_TOP - BELT_Z, 'lo', { bevel: 0, steps: 2, crease: 'none' })

// --- Out-tray: its body, back wall and the approved stack the sheet lands on --------------------------------------

slot('tray.out.back')
block('tray.out.body', TRAY_OUT, 0, TRAY_OUT_TOP, 'mid', { bevel: 0.6, inner: [{ d: sideSeam(TRAY_OUT, 3, P, 4), tone: 'faint' }] })
block('tray.out.back', { x: TRAY_OUT.x, y: TRAY_OUT.y, w: TRAY_OUT.w, d: 2.4, r: 0.6 }, TRAY_OUT_TOP, WALL_TOP - TRAY_OUT_TOP, 'mid', { bevel: 0.3, steps: 2 })
const STACK_OUT: Plan = { x: OUT_X - 20, y: -26, w: 45, d: 52, r: 0.6 }
for (let index = 0; index < 2; index++) {
  block('tray.out.sheet', { ...STACK_OUT, x: STACK_OUT.x + index * 0.6, y: STACK_OUT.y - index * 0.4 }, TRAY_OUT_TOP + index * SHEET_T, SHEET_T, 'hi', { bevel: 0, steps: 2, crease: 'none', className: 'sorter-paper' })
}

// --- The document, built at x = 0: paper, print, and the three stamps it collects ---------------------------------

slot('sheet', 'sheet')
const markOf = (index: number) => {
  const [cx, cy] = [MARK_AHEAD, MARK_Y[index]]
  if (index === 0) return planOutline({ x: cx - 4, y: cy - 3, w: 8, d: 6, r: 1 }, SHEET_TOP, P, 3)
  if (index === 1) return ringOn(cx, cy, 3.4, SHEET_TOP, P, 28)
  return ringOn(cx, cy, 3.8, SHEET_TOP, P, 32) + ringOn(cx, cy, 2.4, SHEET_TOP, P, 24)
}
export const MARKS = [0, 1, 2].map(markOf)
const PRINT = [-21, -17, -13, -9, -5, -1, 3, 7, 11, 15, 19].map((y, row) => lineOnTop([-16, y], [-16 + [14, 11, 13, 9, 14, 12, 8, 13, 10, 14, 7][row], y], SHEET_TOP, P)).join('')
item('sheet', [
  solid(slabOf(SHEET, BELT_TOP, SHEET_T, P, 2), 'hi', { crease: 'none', className: 'sorter-paper' }),
  line(PRINT, 'lo', true),
  ...MARKS.map((d, index): Mark => ({ kind: 'stamp', index, d })),
], [slabShape(SHEET, BELT_TOP, SHEET_T, 2)])

// --- Gates: each axle, then its flap (rebuilt for its swing angle) ------------------------------------------------

const FLAP_FRAMES: Frame[] = GATES.map(x => ({ o: [x, 0, AXLE_Z], a: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] }))

// The flap's section in the frame's (x, z) plane at swing `angle` (0 hanging, pi/2 level): it stays tangent to the axle.
function flapPolygon (angle: number): Plane[] {
  const n: Plane = [Math.cos(angle), Math.sin(angle)]
  const d: Plane = [Math.sin(angle), -Math.cos(angle)]
  const point = (out: number, down: number): Plane => [n[0] * out + d[0] * down, n[1] * out + d[1] * down]
  return [point(AXLE_R, 0), point(AXLE_R + FLAP_T, 0), point(AXLE_R + FLAP_T, FLAP_H), point(AXLE_R, FLAP_H)]
}

// A gate swings a little past level, so an open flap reads as raised and still shows its face.
const FLAP_OPEN = (Math.PI * 5) / 9

export const flapPaths = (index: number, open: number) => G.prismOf(FLAP_FRAMES[index], flapPolygon(open * FLAP_OPEN), -FLAP_Y, FLAP_Y, P)

export const flapShape = (index: number, open: number): Shape => ({ kind: 'prism', F: FLAP_FRAMES[index], polygon: flapPolygon(open * FLAP_OPEN), s0: -FLAP_Y, s1: FLAP_Y })

for (const [index, x] of GATES.entries()) {
  slot(`gate.${index}.axle`)
  const F = along([x, -BELT_Y, AXLE_Z], [0, 1, 0])
  turned(`gate.${index}.axle`, F, [[0, AXLE_R], [BELT_Y * 2, AXLE_R]], 'mid')
  slot(`gate.${index}.flap`, 'flap', index)
}

// --- Out-tray front: right wall, the clip on the approved stack, front wall ---------------------------------------

slot('tray.out.front')
const RIGHT_X = TRAY_OUT.x + TRAY_OUT.w - 2.4
const RIGHT_WALL: Plan = { x: RIGHT_X, y: TRAY_OUT.y + 2.4, w: 2.4, d: TRAY_OUT.d - 4.8, r: 0.6 }
const JAW: Plan = { x: RIGHT_X - 4.4, y: -7, w: 4.4, d: 14, r: 0.8 }
block('tray.out.clip.jaw', JAW, BELT_TOP, 1.4, 'mid', { bevel: 0.3, steps: 3 })
block('tray.out.side', RIGHT_WALL, TRAY_OUT_TOP, WALL_TOP - TRAY_OUT_TOP, 'mid', { bevel: 0.3, steps: 2 })
const SPINE: Plan = { x: RIGHT_WALL.x - 1, y: -6, w: 4.4, d: 12, r: 0.8 }
block('tray.out.clip.spine', SPINE, WALL_TOP, 2.4, 'mid', { bevel: 0.3, steps: 3 })
const CLIP_SCREW: Plane = [SPINE.x + SPINE.w / 2, 0]
post('tray.out.clip.screw', CLIP_SCREW[0], CLIP_SCREW[1], 2.4, WALL_TOP + 2.4, 3, 'mid', {
  steps: 24,
  extra: [line(knurl(CLIP_SCREW[0], CLIP_SCREW[1], 2.4, WALL_TOP + 2.4, WALL_TOP + 5.4, 20, P), 'lo'), line(ringOn(CLIP_SCREW[0], CLIP_SCREW[1], 1, WALL_TOP + 5.4, P, 12), 'lo')],
})
block('tray.out.front', { x: TRAY_OUT.x, y: TRAY_OUT.y + TRAY_OUT.d - 2.4, w: TRAY_OUT.w, d: 2.4, r: 0.6 }, TRAY_OUT_TOP, WALL_TOP - TRAY_OUT_TOP, 'mid', { bevel: 0.3, steps: 2 })

// --- Conveyor front: the rail with its ruler, the gate posts on it, the drum hub and the tension knob --------------

slot('conveyor.front')
const FRONT_FACE = BELT_Y + 4
const railTicks = sideTicks(RAIL_X0 + 6, RAIL_X1 - 6, 4, 5, FRONT_FACE, RAIL_H, [1.8, 3.4], P)
block('rail.front', railPlan(BELT_Y), 0, RAIL_H, 'mid', { bevel: 0.5, extra: [line(railTicks.minor, 'lo'), line(railTicks.major, 'mid')] })
for (const [index, x] of GATES.entries()) gatePost(`gate.${index}.post.front`, x, BELT_Y)
const HUB_F = along([DRUM_X[0], FRONT_FACE, DRUM_R], [0, 1, 0])
turned('drum.feed.hub', HUB_F, [[0, 2.6], [1.4, 2.6]], 'mid', { extra: [line(G.circleOf(HUB_F, 1.4, 1, P, 14), 'lo')] })
const KNOB_F = along([DRUM_X[1], FRONT_FACE, DRUM_R], [0, 1, 0])
const knobRibs = G.ribsOf(KNOB_F, 0, 3.2, 3.4, 26, P, { fade: [0.05, 0.5] })
turned('drum.drive.knob', KNOB_F, [[0, 3.4], [3.2, 3.4]], 'mid', {
  extra: [line(knobRibs.filter(rib => rib.alpha > 0.5).map(rib => rib.d).join(''), 'lo'), line(G.circleOf(KNOB_F, 3.2, 1.2, P, 14), 'lo')],
})

// --- Presses, far to near: carriage on the column, arm over the belt, stamp head and die (built pressed down) ------

for (const [index, x] of STATIONS.entries()) {
  slot(`station.${index}.press`, 'press', index)
  const carriage: Plan = { x: x - 6, y: COLUMN_Y + COLUMN_D, w: 12, d: 4, r: 0.8 }
  block(`station.${index}.carriage`, carriage, CARRIAGE_Z, CARRIAGE_H, 'mid', {
    bevel: 0.4,
    extra: [screwsOn([[x - 4, carriage.y + 4, CARRIAGE_Z + 2], [x + 4, carriage.y + 4, CARRIAGE_Z + 2], [x - 4, carriage.y + 4, CARRIAGE_Z + CARRIAGE_H - 2], [x + 4, carriage.y + 4, CARRIAGE_Z + CARRIAGE_H - 2]], 0.45)],
  })
  const reach = MARK_Y[index] + DIE_R
  const arm: Plan = { x: x - 3, y: carriage.y + carriage.d, w: 6, d: reach - carriage.y - carriage.d, r: 1 }
  // The die and head hang under the arm's end, so they are painted before it.
  post(`station.${index}.die`, x, MARK_Y[index], DIE_R, SHEET_TOP, DIE_H, 'mid', { steps: 32 })
  post(`station.${index}.head`, x, MARK_Y[index], HEAD_R, SHEET_TOP + DIE_H, ARM_Z - SHEET_TOP - DIE_H, 'mid', { steps: 32, extra: [line(sideArc(x, MARK_Y[index], HEAD_R, SHEET_TOP + DIE_H + 1.6, P, 24), 'faint')] })
  block(`station.${index}.arm`, arm, ARM_Z, ARM_H, 'mid', { bevel: 0.4, inner: [{ d: sideSeam(arm, ARM_Z + 1.4, P, 4), tone: 'faint' }], extra: [screwsOn([[x, arm.y + 3, ARM_Z + ARM_H], [x, MARK_Y[index], ARM_Z + ARM_H]], 0.45)] })
}

// --- Ink pads on the front ledge, one in front of each station, nearest of all ------------------------------------

slot('pads')
for (const [index, x] of STATIONS.entries()) {
  const pad: Plan = { x: x - 7, y: FRONT_FACE + 3, w: 14, d: 7, r: 1.5 }
  block(`station.${index}.inkpad`, pad, 0, 2.4, 'mid', {
    bevel: 0.4,
    inner: [{ d: sideSeam(pad, 1.2, P, 4), tone: 'faint' }],
    extra: [line(planOutline(insetPlan(pad, 1.4), 2.4, P, 3), 'lo'), line(planOutline(insetPlan(pad, 2.6), 2.4, P, 3), 'faint')],
  })
}

// --- Exports for the static art, the live loop and the audit ----------------------------------------------------

export const PARTS = SLOTS

// Screen transforms for the moving slots: the sheet's centre along the belt and each press carriage's lift.
export function movesOf (x: number, lift: number[]) {
  return {
    sheet: translateAlong(P, [x, 0, 0]),
    press: lift.map(z => translateAlong(P, [0, 0, z])),
  }
}

export const PROJECTION = P
