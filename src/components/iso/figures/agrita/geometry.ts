/*
  The traceability line, built once from the kit. World units are about 1 px, x runs along the belt (the lot's way,
  from the plot stage on the left to the parcel stage on the right), y across it toward the viewer, z up. Every drawn
  item carries the true shapes of what it draws (for the audit beside this file) and sits in a slot of the painter's
  order. A slot stays still, rides with the crate (x) or with the stamp pad (z); moving parts are built at rest (the
  crate centred on x = 0, the pad up) and moved with a transform, so nothing is rebuilt per frame.
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
  radialTicks,
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
import { JOG, SCAN_X, STROKE, X_END, X_START } from '@/components/iso/figures/agrita/model'

export const WIDTH = 600
export const HEIGHT = 390
const AZIMUTH = 50
const ELEVATION = 40

// --- World layout -------------------------------------------------------------------------------------------------

const BASE: Plan = { x: -146, y: -66, w: 282, d: 118, r: 9 }
const BASE_H = 12
const FOOT_H = 5

// The conveyor: legs, two side rails, the belt between them and a drum at the delivery end.
const LEG_XS = [-90, 84]
const LEG_H = 14
const RAIL_Z = LEG_H
const RAIL_TOP = 27
const RAIL_X = 122
const BELT_HALF = 15
const BELT_X = 114
const BELT_Z = 19
const BELT_TOP = 23
const DRUM_X = 116
const DRUM_Z = 21
const DRUM_R = 2

// The crate, built centred on x = 0 and moved along the belt.
const CRATE_W = 26
const CRATE_D = 22
const RUNNER_TOP = BELT_TOP + 1.5
const LID_Z = RUNNER_TOP + 14
const LID_TOP = LID_Z + 1.5
const LABEL_T = 0.6
const LABEL_TOP = LID_TOP + LABEL_T

// The recording arch over the belt.
const ARCH_X = SCAN_X
const POST_TOP = 54
const BAR_TOP = 60

// The label printer behind the belt at the parcel stage, its applicator arm reaching over the belt to the stamp.
const PRINTER: Plan = { x: 74, y: -62, w: 38, d: 34, r: 2 }
const PRINTER_TOP = 32
const PAD_H = 2.4
// The pad's rest (up) height: its stroke ends on the label.
const PAD_Z = LABEL_TOP + STROKE
const SLEEVE_Z = PAD_Z + PAD_H + 1
const HOUSING_Z = SLEEVE_Z + 10
const ARM_Z = HOUSING_Z + 6
const ARM_TOP = ARM_Z + 6
const PLUNGER_L = 10

const box = ({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] =>
  [x, x + w].flatMap(px => [y, y + d].flatMap(py => [z0, z1].map((pz): Point3 => [px, py, pz])))

// Fit the base and everything tall on it: the arch, the shelf, the printer's roll and arm.
const P: Projection = fitProjection(
  [
    ...box(BASE, -BASE_H - FOOT_H, 0),
    ...box({ x: ARCH_X - 6, y: -32, w: 12, d: 64, r: 0 }, 0, BAR_TOP + 3),
    ...box({ x: 4, y: -64, w: 46, d: 24, r: 0 }, 0, 50),
    ...box({ x: 80, y: -62, w: 26, d: 34, r: 0 }, 0, PRINTER_TOP + 16),
    ...box({ x: X_END - 6, y: -34, w: 12, d: 40, r: 0 }, 0, ARM_TOP),
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
  | { kind: 'tube', points: Point3[], radii: number[] }

export type Mark =
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', lit?: boolean, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }
  | { kind: 'tube', body: string, shine: string, shade: string, edges: string, wide: boolean, tone: Tone }

type Meta = { owner?: string, ground?: boolean, limp?: boolean }

export type Item = { name: string, marks: Mark[], shapes: (Shape & { meta?: Meta })[] }

type Route = { name: string, points: Point3[], r: number, gaps: [number, number][], rims: [number, number] }

// How a slot moves: still, along the belt with the crate, or down with the stamp pad.
export type Move = 'still' | 'crate' | 'pad'

// A slot whose items fade in and out as a whole: the printed label and the arch's status lamp.
export type Show = 'label' | 'lamp'

type Slot = { key: string, move: Move, show?: Show, items: Item[] }

const SLOTS: Slot[] = []
export const ROUTES: Route[] = []
let current: Slot = { key: 'start', move: 'still', items: [] }

function slot (key: string, move: Move = 'still', show?: Show) {
  current = { key, move, show, items: [] }
  SLOTS.push(current)
}

function item (name: string, marks: Mark[], shapes: Item['shapes'] = []) {
  current.items.push({ name, marks, shapes })
}

const solid = (paths: SolidPaths, tone: Tone = 'mid', options: Partial<Extract<Mark, { kind: 'solid' }>> = {}): Mark => ({ kind: 'solid', paths, tone, crease: 'faint', ...options })
const line = (d: string, tone: LineTone = 'lo', free = false): Mark => ({ kind: 'line', d, tone, free: free || undefined })
const dots = (points: Flat[], size = 0.5, tone: Tone = 'mid'): Mark => ({ kind: 'dots', points, size, tone })

type BlockOptions = { steps?: number, bevel?: number, extra?: Mark[], inner?: { d: string, tone: LineTone }[], crease?: Tone | 'none', meta?: Meta, lit?: boolean }

// A rounded block: the commonest part. `extra` adds screws, grooves and seams drawn on it.
function block (name: string, plan: Plan, z: number, h: number, tone: Tone = 'mid', { steps = 4, bevel = 0.6, extra = [], inner, crease = 'faint', meta, lit }: BlockOptions = {}) {
  item(name, [solid(slabOf(plan, z, h, P, steps, bevel), tone, { inner, crease, lit }), ...extra], [{ kind: 'slab', plan, z, h, steps, meta }])
}

function post (name: string, cx: number, cy: number, r: number, z: number, h: number, tone: Tone = 'mid', { extra = [], steps = 28, crease = 'faint', meta }: { extra?: Mark[], steps?: number, crease?: Tone | 'none', meta?: Meta } = {}) {
  item(name, [solid(cylinderOf(cx, cy, r, z, h, P, steps), tone, { crease }), ...extra], [{ kind: 'cylinder', cx, cy, r, z, h, meta }])
}

// A turned part on any axis: `profile` is [s, r] from one end to the other, closed to the axis at both ends.
function turned (name: string, F: Frame, profile: [number, number][], tone: Tone = 'mid', { extra = [], inner, meta }: { extra?: Mark[], inner?: { d: string, tone: LineTone }[], meta?: Meta } = {}) {
  item(name, [solid(G.solidOf(profile, F, P), tone, { inner }), ...extra], [{ kind: 'turned', F, profile, meta }])
}

const along = (o: Point3, a: Point3) => G.frameAlong(o, a)
const up = (x: number, y: number, z: number) => along([x, y, z], [0, 0, 1])

const screwsOn = (points: Point3[], size = 0.5, tone: Tone = 'mid') => dots(points.map(at), size, tone)
const cornerScrews = (plan: Plan, inset: number, z: number) => corners(plan, inset).map(([x, y]): Point3 => [x, y, z])

// Closed rectangles on a vertical face x = const (yz plane) or y = const (xz plane): slots, windows, handles.
const faceRectX = (x: number, y0: number, y1: number, z0: number, z1: number) => pathOf(([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]] as Point3[]).map(at), true)
const faceRectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pathOf(([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]] as Point3[]).map(at), true)

const byDepth = (points: Plane[]) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P))

// A cable from tube.mjs: chunks and the connector shell at each end as items, painted far to near.
function cable (name: string, points: Point3[], r: number, bend = Math.max(3, r * 2.6)) {
  const route = G.fillet(points, bend, 10, { P, tube: r })
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
for (const [x, y] of byDepth(corners(BASE, 22))) post('stand.foot', x, y, 6, -BASE_H - FOOT_H, FOOT_H, 'lo', { meta: { ground: true } })
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

// Label plate at the front edge, three rule lines that stand for its print.
const PLATE: Plan = { x: 10, y: 31, w: 28, d: 14, r: 1.2 }
block('stand.label', PLATE, 0, 0.8, 'lo', {
  crease: 'none',
  bevel: 0,
  steps: 3,
  extra: [
    line(planOutline(insetPlan(PLATE, 1.4), 0.8, P, 3), 'faint'),
    line([17, 12, 14].map((w, row) => lineOnTop([PLATE.x + 4, PLATE.y + 4.2 + row * 3.3], [PLATE.x + 4 + w, PLATE.y + 4.2 + row * 3.3], 0.8, P)).join(''), 'lo', true),
    screwsOn([[PLATE.x + PLATE.w - 2.6, PLATE.y + 2.6, 0.8], [PLATE.x + PLATE.w - 2.6, PLATE.y + PLATE.d - 2.6, 0.8]], 0.45),
  ],
})

// --- Behind the belt: control box, drive motor, warehouse shelf, data cable, the arch's back post, label printer -----

slot('back')

// The control box at the back left: case with vents, a dial and knob, a toggle and a lamp on the lid.
const BOX: Plan = { x: -142, y: -62, w: 24, d: 24, r: 2 }
const BOX_TOP = 14
const LANE = 1.25
const BOX_VENTS = [0, 1, 2].map(index => faceRectX(BOX.x + BOX.w, BOX.y + 4 + index * 4.4, BOX.y + 6.2 + index * 4.4, 3.5, 8.5)).join('')
block('box.case', BOX, 0, BOX_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(BOX, BOX_TOP - 2.6, P, 4), tone: 'faint' }],
  extra: [line(BOX_VENTS, 'lo'), line(planOutline(insetPlan(BOX, 2.2), BOX_TOP, P, 4), 'faint'), screwsOn(cornerScrews(BOX, 3.6, BOX_TOP), 0.45)],
})
const DIAL: Plane = [BOX.x + 8.5, BOX.y + 13]
const dialTicks = radialTicks(DIAL[0], DIAL[1], 6.2, 24, 6, BOX_TOP + 0.4, [1, 1.8], P, -2.4, 4.8)
post('box.dial', DIAL[0], DIAL[1], 6.4, BOX_TOP, 0.4, 'lo', { crease: 'none', steps: 40, extra: [line(dialTicks.minor, 'lo'), line(dialTicks.major, 'mid')] })
post('box.knob', DIAL[0], DIAL[1], 3, BOX_TOP + 0.4, 4, 'mid', {
  steps: 32,
  extra: [line(knurl(DIAL[0], DIAL[1], 3, BOX_TOP + 0.4, BOX_TOP + 4.4, 28, P), 'lo'), line(lineOnTop([DIAL[0], DIAL[1]], [DIAL[0] + 2, DIAL[1] - 2], BOX_TOP + 4.4, P), 'hi')],
})
post('box.toggle.bezel', BOX.x + 20, BOX.y + 17, 2.2, BOX_TOP, 1, 'mid', { steps: 20 })
turned('box.toggle.lever', along([BOX.x + 20, BOX.y + 17, BOX_TOP + 1], [0.4, 0, 1]), [[0, 0.8], [3.6, 0.55]], 'mid')
post('box.lamp', BOX.x + 20, BOX.y + 6, 1.4, BOX_TOP, 0.8, 'mid', { steps: 16, extra: [dots([at([BOX.x + 20, BOX.y + 6, BOX_TOP + 0.8])], 0.6, 'hi')] })

// The drive motor on the back rail, and its lead along the floor to the control box.
const MOTOR_X = -76
const FLANGE: Plan = { x: MOTOR_X - 8, y: -BELT_HALF - 6, w: 16, d: 2, r: 0.8 }
const MOTOR_F = along([MOTOR_X, FLANGE.y, DRUM_Z], [0, -1, 0])
const MOTOR_END = FLANGE.y - 13
const DRIVE_Y = BOX.y + BOX.d - 5.5
cable('cable.drive', [[MOTOR_X, MOTOR_END, DRUM_Z], [MOTOR_X, DRIVE_Y, DRUM_Z], [MOTOR_X, DRIVE_Y, LANE], [BOX.x + BOX.w + 8, DRIVE_Y, LANE], [BOX.x + BOX.w + 8, DRIVE_Y, 6], [BOX.x + BOX.w, DRIVE_Y, 6]], 0.8, 5)
turned('motor.cap', MOTOR_F, [[11, 5], [13, 5]], 'mid', { extra: [line(G.circleOf(MOTOR_F, 13, 2.6, P, 20), 'lo')] })
const motorRibs = G.ribsOf(MOTOR_F, 0, 11, 6.5, 28, P, { fade: [0.05, 0.5] })
turned('motor.body', MOTOR_F, [[0, 6.5], [11, 6.5]], 'mid', { inner: [{ d: motorRibs.filter(rib => rib.alpha > 0.5).map(rib => rib.d).join(''), tone: 'faint' }] })
block('motor.flange', FLANGE, RAIL_Z, RAIL_TOP + 1 - RAIL_Z, 'mid', { bevel: 0.3, steps: 2 })

// The warehouse shelf: two side panels, four boards and three slots. The lowest slot stands empty for the lot.
const SHELF = { x0: 4, x1: 50, y: -64, d: 24, top: 50, panel: 2.4 }
const BOARD_ZS = [0, 16, 32, 48]
const BOARD_T = 2
const shelfPanel = (side: 'left' | 'right') => {
  const x = side === 'left' ? SHELF.x0 : SHELF.x1 - SHELF.panel
  const plan: Plan = { x, y: SHELF.y, w: SHELF.panel, d: SHELF.d, r: 0.5 }
  block(`shelf.panel.${side}`, plan, 0, SHELF.top, 'mid', {
    bevel: 0.4,
    steps: 2,
    extra: [screwsOn(BOARD_ZS.slice(1).map((z): Point3 => [x + SHELF.panel, SHELF.y + SHELF.d - 3, z + BOARD_T / 2]), 0.4)],
  })
}
const binIn = (name: string, board: number, x: number) => {
  const plan: Plan = { x, y: SHELF.y + 3, w: 18, d: 18, r: 1.2 }
  const z = BOARD_ZS[board] + BOARD_T
  block(name, plan, z, 10, 'mid', {
    bevel: 0.5,
    inner: [{ d: sideSeam(plan, z + 7.6, P, 4), tone: 'faint' }],
    extra: [line(faceRectY(plan.y + plan.d, x + 5, x + 13, z + 2.6, z + 5.4), 'lo')],
  })
}
shelfPanel('left')
BOARD_ZS.forEach((z, index) => {
  const plan: Plan = { x: SHELF.x0 + SHELF.panel, y: SHELF.y, w: SHELF.x1 - SHELF.x0 - SHELF.panel * 2, d: SHELF.d, r: 0.3 }
  block(`shelf.board.${index}`, plan, z, BOARD_T, 'mid', { bevel: 0.3, steps: 2, extra: index ? [line(planOutline(insetPlan(plan, 3), z + BOARD_T, P, 2), 'faint')] : [] })
  if (index === 1) binIn('shelf.bin.low', 1, SHELF.x0 + 5)
  if (index === 2) binIn('shelf.bin.high', 2, SHELF.x0 + 21)
})
shelfPanel('right')

// The arch's lead runs along the floor behind the belt to the printer: the recorded lot's data reaches the label.
const ARCH_BACK = -BELT_HALF - 16
cable('cable.data', [[ARCH_X, ARCH_BACK, 10], [ARCH_X, ARCH_BACK - 5.5, 10], [ARCH_X, ARCH_BACK - 5.5, LANE], [PRINTER.x - 8, ARCH_BACK - 5.5, LANE], [PRINTER.x - 8, ARCH_BACK - 5.5, 6], [PRINTER.x, ARCH_BACK - 5.5, 6]], 0.8)

// The arch's back foot and post.
const archFoot = (side: 'back' | 'front') => {
  const plan: Plan = { x: ARCH_X - 7, y: side === 'back' ? ARCH_BACK - 2 : -ARCH_BACK - 8, w: 14, d: 10, r: 1.2 }
  block(`arch.${side}.foot`, plan, 0, 2, 'mid', { bevel: 0.4, steps: 3, extra: [screwsOn(cornerScrews(plan, 2.2, 2), 0.45)] })
}
const archPost = (side: 'back' | 'front') => {
  const plan: Plan = { x: ARCH_X - 5, y: side === 'back' ? ARCH_BACK : -ARCH_BACK - 6, w: 10, d: 6, r: 1 }
  block(`arch.${side}.post`, plan, 2, POST_TOP - 2, 'mid', {
    bevel: 0.5,
    inner: [{ d: sideSeam(plan, 8, P, 4) + sideSeam(plan, POST_TOP - 6, P, 4), tone: 'faint' }],
  })
}
archFoot('back')
archPost('back')

// The label printer: a case with a display and a feed slot, a short strip of labels from the slot, a knurled feed
// knob on its end, and the label roll on two cradles on its top.
const PRINTER_FRONT = PRINTER.y + PRINTER.d
block('printer.case', PRINTER, 0, PRINTER_TOP, 'mid', {
  steps: 4,
  bevel: 0.8,
  inner: [{ d: sideSeam(PRINTER, 4, P, 4) + sideSeam(PRINTER, PRINTER_TOP - 3, P, 4), tone: 'faint' }],
  extra: [
    line(faceRectY(PRINTER_FRONT, PRINTER.x + 5, PRINTER.x + 17, 12, 19), 'lo'),
    line(faceRectY(PRINTER_FRONT, PRINTER.x + 3, PRINTER.x + 19, 27.6, 28.8), 'lo'),
    screwsOn([[PRINTER.x + 23, PRINTER_FRONT, 15.5], [PRINTER.x + 28, PRINTER_FRONT, 15.5]], 0.7, 'lo'),
    screwsOn(cornerScrews(PRINTER, 2.4, PRINTER_TOP), 0.45),
  ],
})
const STRIP: Plan = { x: PRINTER.x + 4, y: PRINTER_FRONT, w: 14, d: 6, r: 0.2 }
block('printer.strip', STRIP, 27.6, 0.6, 'hi', { bevel: 0, steps: 1, crease: 'none', extra: [line(lineOnTop([STRIP.x, STRIP.y + 3], [STRIP.x + STRIP.w, STRIP.y + 3], 28.2, P), 'faint')] })
const KNOB_F = along([PRINTER.x + PRINTER.w, -45, 16], [1, 0, 0])
const knobRibs = G.ribsOf(KNOB_F, 0, 3, 4, 24, P, { fade: [0.05, 0.5] })
turned('printer.knob', KNOB_F, [[0, 4], [3, 4]], 'mid', {
  extra: [line(knobRibs.filter(rib => rib.alpha > 0.5).map(rib => rib.d).join(''), 'lo'), line(G.circleOf(KNOB_F, 3, 1.4, P, 16), 'lo')],
})
const ROLL_Y = -50
const ROLL_R = 8
const ROLL_Z = PRINTER_TOP + ROLL_R
const cradle = (x: number) => block('printer.cradle', { x, y: ROLL_Y - 4, w: 3, d: 8, r: 0.6 }, PRINTER_TOP, ROLL_R, 'mid', { bevel: 0.3, steps: 2 })
cradle(PRINTER.x + 6)
const ROLL_F = along([PRINTER.x + 9, ROLL_Y, ROLL_Z], [1, 0, 0])
turned('printer.roll', ROLL_F, [[0, ROLL_R], [20, ROLL_R]], 'hi', {
  extra: [line(G.circleOf(ROLL_F, 20, 5.4, P, 32) + G.circleOf(ROLL_F, 20, 2.6, P, 24), 'faint')],
})
cradle(PRINTER.x + 29)

// The applicator column stands on the printer's front edge.
const COLUMN: Plan = { x: X_END - 4, y: PRINTER_FRONT - 6, w: 8, d: 6, r: 1 }
block('stamp.column', COLUMN, PRINTER_TOP, ARM_Z - PRINTER_TOP, 'mid', { bevel: 0.5, inner: [{ d: sideSeam(COLUMN, PRINTER_TOP + 4, P, 4), tone: 'faint' }] })

// --- The conveyor ---------------------------------------------------------------------------------------------------

slot('conveyor')
const legPlan = (x: number, side: -1 | 1): Plan => ({ x: x - 3, y: side < 0 ? -BELT_HALF - 3.5 : BELT_HALF + 0.5, w: 6, d: 3, r: 0.6 })
for (const x of LEG_XS) block('conveyor.leg.back', legPlan(x, -1), 0, LEG_H, 'mid', { bevel: 0.4, steps: 2 })
for (const x of LEG_XS) {
  const plan: Plan = { x: x - 2, y: -BELT_HALF - 0.5, w: 4, d: BELT_HALF * 2 + 1, r: 0.4 }
  block('conveyor.brace', plan, 4, 4, 'mid', { bevel: 0.3, steps: 2 })
}
const railPlan = (side: -1 | 1): Plan => ({ x: -RAIL_X, y: side < 0 ? -BELT_HALF - 4 : BELT_HALF, w: RAIL_X * 2, d: 4, r: 1 })
const rail = (side: -1 | 1) => {
  const plan = railPlan(side)
  const y = side < 0 ? plan.y : plan.y + plan.d
  block(`conveyor.rail.${side < 0 ? 'back' : 'front'}`, plan, RAIL_Z, RAIL_TOP - RAIL_Z, 'mid', {
    bevel: 0.5,
    inner: [{ d: sideSeam(plan, RAIL_Z + 3, P, 4), tone: 'faint' }],
    extra: [screwsOn([-110, -55, 0, 55, 110].map((x): Point3 => [x, plan.y + 2, RAIL_TOP]), 0.42), ...(side > 0 ? [screwsOn([-75, -15, 35, 70].map((x): Point3 => [x, y, RAIL_Z + 7.5]), 0.45)] : [])],
  })
}
rail(-1)
const BELT: Plan = { x: -BELT_X, y: -BELT_HALF, w: BELT_X * 2, d: BELT_HALF * 2, r: 0.4 }
const CLEATS = Array.from({ length: 28 }, (_, index) => -108 + index * 8)
block('conveyor.belt', BELT, BELT_Z, BELT_TOP - BELT_Z, 'lo', {
  bevel: 0,
  steps: 2,
  crease: 'none',
  extra: [line(CLEATS.map(x => lineOnTop([x, -BELT_HALF], [x, BELT_HALF], BELT_TOP, P)).join(''), 'faint')],
})
const DRUM_F = along([DRUM_X, -BELT_HALF, DRUM_Z], [0, 1, 0])
turned('conveyor.drum', DRUM_F, [[0, DRUM_R], [BELT_HALF * 2, DRUM_R]], 'mid')

// --- The harvest-lot crate, built centred on x = 0 ------------------------------------------------------------------

slot('crate', 'crate')
const CRATE: Plan = { x: -CRATE_W / 2, y: -CRATE_D / 2, w: CRATE_W, d: CRATE_D, r: 1.2 }
for (const y of [-CRATE_D / 2 + 1, CRATE_D / 2 - 4]) block('crate.runner', { x: -CRATE_W / 2 + 0.5, y, w: CRATE_W - 1, d: 3, r: 0.5 }, BELT_TOP, RUNNER_TOP - BELT_TOP, 'lo', { bevel: 0.2, steps: 2 })
block('crate.body', CRATE, RUNNER_TOP, LID_Z - RUNNER_TOP, 'hi', {
  bevel: 0.5,
  inner: [{ d: sideSeam(CRATE, RUNNER_TOP + 4.5, P, 4) + sideSeam(CRATE, RUNNER_TOP + 9, P, 4), tone: 'lo' }],
  extra: [
    line(faceRectX(CRATE_W / 2, -5, 5, RUNNER_TOP + 10.6, RUNNER_TOP + 12.4), 'mid'),
    line(faceRectY(CRATE_D / 2, -7, 7, RUNNER_TOP + 10.6, RUNNER_TOP + 12.4), 'mid'),
  ],
})
const LID: Plan = { x: -CRATE_W / 2 - 0.5, y: -CRATE_D / 2 - 0.5, w: CRATE_W + 1, d: CRATE_D + 1, r: 1.4 }
block('crate.lid', LID, LID_Z, LID_TOP - LID_Z, 'hi', { bevel: 0.3, steps: 3, extra: [screwsOn(cornerScrews(LID, 2, LID_TOP), 0.45, 'lo')] })

// The QR label the printer stamps on the lid: the one lit part. Three finder squares and a few modules.
slot('label', 'crate', 'label')
const LABEL_HALF = 6.5
const LABEL: Plan = { x: -LABEL_HALF, y: -LABEL_HALF, w: LABEL_HALF * 2, d: LABEL_HALF * 2, r: 0.3 }
const square = (x: number, y: number, w: number) => planOutline({ x, y, w, d: w, r: 0 }, LABEL_TOP, P, 1)
const finder = (x: number, y: number) => square(x, y, 3.6) + square(x + 1.2, y + 1.2, 1.2)
const MODULES: Plane[] = [[1.4, -1.8], [3.2, 0.4], [-0.8, 2.8], [1.8, 3.2], [3.8, 3.8], [-3.2, 1.6], [0.4, 0.2], [4.2, -0.2]]
block('crate.label', LABEL, LID_TOP, LABEL_T, 'hi', {
  lit: true,
  bevel: 0,
  steps: 1,
  crease: 'none',
  extra: [
    line(finder(-5.4, -5.4) + finder(1.8, -5.4) + finder(-5.4, 1.8), 'lit'),
    line(MODULES.map(([x, y]) => square(x - 0.5, y - 0.5, 1)).join(''), 'lit'),
  ],
})

// --- The stamp: a pad and its plunger, which ride down onto the lid, built up --------------------------------------

slot('pad', 'pad')
const PAD: Plan = { x: X_END - 7, y: -7, w: 14, d: 14, r: 1 }
block('stamp.pad', PAD, PAD_Z, PAD_H, 'mid', { bevel: 0.4, steps: 3, inner: [{ d: sideSeam(PAD, PAD_Z + 0.8, P, 3), tone: 'faint' }], meta: { owner: 'stamp' } })
post('stamp.plunger', X_END, 0, 1.4, PAD_Z + PAD_H, PLUNGER_L, 'mid', { steps: 20, meta: { owner: 'stamp' } })

slot('stamp')
post('stamp.sleeve', X_END, 0, 2.6, SLEEVE_Z, HOUSING_Z - SLEEVE_Z, 'mid', { steps: 28, extra: [line(sideArc(X_END, 0, 2.6, SLEEVE_Z + 2, P, 20), 'faint')], meta: { owner: 'stamp' } })
const HOUSING: Plan = { x: X_END - 6, y: -6, w: 12, d: 12, r: 1.2 }
block('stamp.housing', HOUSING, HOUSING_Z, ARM_Z - HOUSING_Z, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(HOUSING, HOUSING_Z + 2, P, 4), tone: 'faint' }],
  extra: [line(faceRectX(HOUSING.x + HOUSING.w, -3, 3, HOUSING_Z + 3, HOUSING_Z + 4.6), 'lo')],
  meta: { owner: 'stamp' },
})
const ARM: Plan = { x: X_END - 4, y: COLUMN.y, w: 8, d: 6 - COLUMN.y, r: 1 }
block('stamp.arm', ARM, ARM_Z, ARM_TOP - ARM_Z, 'mid', {
  bevel: 0.5,
  extra: [screwsOn([[X_END, COLUMN.y + 3, ARM_TOP], [X_END, COLUMN.y + 10, ARM_TOP], [X_END - 2, 3, ARM_TOP], [X_END + 2, 3, ARM_TOP]], 0.45)],
  meta: { owner: 'stamp' },
})

// --- In front of the belt: legs, rail, bearing, the arch's front post and bar ------------------------------------

slot('front')
for (const x of LEG_XS) block('conveyor.leg.front', legPlan(x, 1), 0, LEG_H, 'mid', { bevel: 0.4, steps: 2, extra: [screwsOn([[x, BELT_HALF + 3.5, LEG_H - 3]], 0.45)] })
rail(1)
// The delivery drum's bearing on the front rail.
const BEARING_F = along([DRUM_X, BELT_HALF + 4, DRUM_Z], [0, 1, 0])
turned('conveyor.bearing', BEARING_F, [[0, 3.4], [1.4, 3.4], [1.4, 1.6], [2.4, 1.6]], 'mid')

archFoot('front')
archPost('front')
const HEAD: Plan = { x: ARCH_X - 3, y: -9, w: 6, d: 18, r: 1 }
block('arch.head', HEAD, POST_TOP - 6, 6, 'mid', { bevel: 0.4, extra: [line(faceRectX(HEAD.x + HEAD.w, -6, 6, POST_TOP - 4.4, POST_TOP - 2.6), 'lo')] })
const BAR: Plan = { x: ARCH_X - 6, y: ARCH_BACK - 1, w: 12, d: -ARCH_BACK * 2 + 2, r: 1.2 }
block('arch.bar', BAR, POST_TOP, BAR_TOP - POST_TOP, 'mid', {
  bevel: 0.6,
  inner: [{ d: sideSeam(BAR, POST_TOP + 2, P, 4), tone: 'faint' }],
  extra: [screwsOn([[ARCH_X - 3, ARCH_BACK + 3, BAR_TOP], [ARCH_X + 3, ARCH_BACK + 3, BAR_TOP], [ARCH_X - 3, -ARCH_BACK - 3, BAR_TOP], [ARCH_X + 3, -ARCH_BACK - 3, BAR_TOP]], 0.45)],
})
post('arch.lamp.bezel', ARCH_X, 0, 2.8, BAR_TOP, 1.2, 'mid', { steps: 24 })
post('arch.lamp.lens', ARCH_X, 0, 1.9, BAR_TOP + 1.2, 1.6, 'mid', { steps: 20, extra: [line(ringOn(ARCH_X, 0, 0.9, BAR_TOP + 2.8, P, 12), 'lo')] })

// The status lamp's light, shown once the lot is recorded.
slot('lamp', 'still', 'lamp')
item('arch.lamp.light', [dots([at([ARCH_X, 0, BAR_TOP + 2.8])], 1.1, 'hi')])

// --- The bench in front: the plot tray, the crop bed and a market parcel -----------------------------------------

slot('bench')
// The plot tray: a growing area cut into four lots, staked at the corners.
const TRAY: Plan = { x: -110, y: 26, w: 38, d: 22, r: 2 }
const TRAY_TOP = 5
const SOIL: Plan = insetPlan(TRAY, 2.4)
block('plot.tray', TRAY, 0, TRAY_TOP, 'mid', { bevel: 0.6, inner: [{ d: sideSeam(TRAY, 2, P, 4), tone: 'faint' }] })
block('plot.soil', SOIL, TRAY_TOP, 0.6, 'lo', {
  bevel: 0,
  steps: 2,
  crease: 'none',
  extra: [line(lineOnTop([SOIL.x + SOIL.w / 2, SOIL.y], [SOIL.x + SOIL.w / 2, SOIL.y + SOIL.d], TRAY_TOP + 0.6, P) + lineOnTop([SOIL.x, SOIL.y + SOIL.d / 2], [SOIL.x + SOIL.w, SOIL.y + SOIL.d / 2], TRAY_TOP + 0.6, P), 'mid')],
})
for (const [x, y] of byDepth(corners(SOIL, 2.4))) post('plot.stake', x, y, 1, TRAY_TOP + 0.6, 3, 'mid', { steps: 14 })

// The season's crop bed, two rows of sprouts.
const BED: Plan = { x: -64, y: 26, w: 24, d: 22, r: 2 }
const BED_TOP = 7
const BED_SOIL = insetPlan(BED, 2.4)
block('crop.bed', BED, 0, BED_TOP, 'mid', { bevel: 0.6, inner: [{ d: sideSeam(BED, 3, P, 4), tone: 'faint' }] })
block('crop.soil', BED_SOIL, BED_TOP, 0.6, 'lo', {
  bevel: 0,
  steps: 2,
  crease: 'none',
  extra: [line([BED_SOIL.y + 6, BED_SOIL.y + BED_SOIL.d - 6].map(y => lineOnTop([BED_SOIL.x, y], [BED_SOIL.x + BED_SOIL.w, y], BED_TOP + 0.6, P)).join(''), 'faint')],
})
const SPROUTS: Plane[] = [[BED.x + 7, BED.y + 7.4], [BED.x + 17, BED.y + 7.4], [BED.x + 7, BED.y + 14.6], [BED.x + 17, BED.y + 14.6]]
for (const [x, y] of byDepth(SPROUTS)) turned('crop.sprout', up(x, y, BED_TOP + 0.6), [[0, 0.6], [3.2, 0.6], [3.2, 2.2], [3.8, 2.2], [4.6, 0.5]], 'mid')

// An outgoing market parcel at the delivery end, taped shut.
const PARCEL: Plan = { x: 72, y: 26, w: 28, d: 20, r: 1 }
const PARCEL_TOP = 16
block('parcel.box', PARCEL, 0, PARCEL_TOP, 'mid', {
  bevel: 0.4,
  inner: [{ d: sideSeam(PARCEL, PARCEL_TOP - 4, P, 4), tone: 'faint' }],
  extra: [line(lineOnTop([PARCEL.x, PARCEL.y + PARCEL.d / 2], [PARCEL.x + PARCEL.w, PARCEL.y + PARCEL.d / 2], PARCEL_TOP, P), 'lo'), line(faceRectY(PARCEL.y + PARCEL.d, PARCEL.x + 4, PARCEL.x + 14, 4, 10), 'lo')],
})

// --- Exports for the static art, the live loop and the audit ----------------------------------------------------

export const PARTS = SLOTS

// The crate's travel, for the audit.
export const CRATE_MIN = X_START - JOG
export const CRATE_MAX = X_END + JOG

// Screen transforms for the moving slots, from the crate's centre along the belt and the pad's press (0 up, 1 down).
export function movesOf (x: number, press: number) {
  return {
    crate: translateAlong(P, [x, 0, 0]),
    pad: translateAlong(P, [0, 0, -press * STROKE]),
  }
}

export const PROJECTION = P
