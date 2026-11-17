/*
  The card catalog and loan desk, built once from the kit. World units are about 1 px, x runs along the cabinet and the
  desk, y toward the viewer's left, z up. Every drawn item carries the true shapes of what it draws (for the audit
  beside this file) and sits in a slot of the painter's order. A slot either stays still, slides with the picked drawer
  or the neighbouring drawer (y), moves with the stamp (z) or runs with the hoist's trolley along its beam (x). The
  catalog card and the hoist's hook are the parts rebuilt per frame: the card turns from standing in its drawer to
  lying on the desk and the hook's cable pays out and reels in, so their slots hold no items and are drawn from
  `cardOf` and `hookOf`.
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
  roundedPlan,
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
import { CARD_LIFT, CARD_REST, OPEN, PEEK, STAMP_TRAVEL, type CardPose, type Point } from '@/components/iso/figures/library/model'

export const WIDTH = 600
export const HEIGHT = 390
const AZIMUTH = 50
const ELEVATION = 40

// --- World layout -------------------------------------------------------------------------------------------------

const BASE: Plan = { x: -168, y: -96, w: 306, d: 152, r: 9 }
const BASE_H = 12
const FOOT_H = 5

// The cabinet: three columns of drawers, three closed rows in one carcass and a top row of loose cells under the top.
const CAB: Plan = { x: -148, y: -80, w: 124, d: 64, r: 1.5 }
const FRONT = CAB.y + CAB.d
const CELLS = [-145, -105, -65]
const CELL_W = 38
const ROW_H = 20
const ROWS = [5, 25, 45]
const TOP_ROW = 65
const TOP_Z = 85
const LID_TOP = TOP_Z + 4

// A drawer box inside a top-row cell, built closed; its front panel is the box's front wall.
const BOX_Y = -56
const BOX_D = 40
const WALL_H = 8
const MAIN_X = CELLS[1]
const PEEK_X = CELLS[0]
const RAIL_TOP = TOP_ROW + 1
const FLOOR_TOP = RAIL_TOP + 1

// The card: 30 wide, 16 tall, 0.5 thick, standing on its bottom edge.
const CARD_W = 30
const CARD_H = 16
export const CARD_T = 0.5

// The loan desk: a top on two pedestals; the stamp stands on it right of where the card lands.
const DESK: Plan = { x: 2, y: -50, w: 120, d: 80, r: 2 }
const DESK_Z = 40
const DESK_TOP = 44

// The stamp, built raised: a carriage slides down the -x face of a column and carries an arm, a neck and the head.
const COLUMN: Plan = { x: 84, y: -10, w: 8, d: 12, r: 1 }
const COLUMN_TOP = 86
const PAD_Z = DESK_TOP + CARD_T + STAMP_TRAVEL
const HEAD: Plan = { x: 55, y: -10, w: 14, d: 12, r: 1.2 }
const ARM_Z = 66

// The hoist over the catalog and the desk: a beam on two posts, a trolley under it, and a hook on a cable that holds
// the card by its far end. The cable hangs on a line just in front of the card's plane.
const HOOK_GAP = 1.2
const HOOK_DY: [number, number] = [-2, 6]
const HOOK_H = 6
const HOOK_LIFT = 0.2
const CABLE_R = 0.75
const CABLE_DX = -CARD_W / 2 - HOOK_GAP / 2
const HOIST_Y = CARD_REST[1] + OPEN + 5
const BEAM_Z = 132
const BEAM: Plan = { x: -154, y: HOIST_Y - 2.5, w: 248, d: 5, r: 1 }
const TROLLEY_Z = BEAM_Z - 8
// The hook's reference point (where the trolley's items are built): the card's bottom-edge centre in the open drawer.
const HOOK_REF_X = CARD_REST[0]

const box = ({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] =>
  [x, x + w].flatMap(px => [y, y + d].flatMap(py => [z0, z1].map((pz): Point3 => [px, py, pz])))

// Fit the base, the cabinet and the card at the top of its lift.
const P: Projection = fitProjection(
  [
    ...box(BASE, -BASE_H - FOOT_H, 0),
    ...box(CAB, 0, LID_TOP),
    ...box({ x: CARD_REST[0] - CARD_W / 2, y: CARD_REST[1] + OPEN, w: CARD_W, d: 1, r: 0 }, 0, CARD_REST[2] + CARD_LIFT + CARD_H),
    ...box(COLUMN, DESK_TOP, COLUMN_TOP + 4),
    ...box(BEAM, 0, BEAM_Z + 4),
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
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', lit?: boolean, flat?: boolean, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }
  | { kind: 'tube', body: string, shine: string, shade: string, edges: string, wide: boolean, tone: Tone }

export type Meta = { owner?: string, ground?: boolean, limp?: boolean }

export type Item = { name: string, marks: Mark[], shapes: (Shape & { meta?: Meta })[] }

type Route = { name: string, points: Point3[], r: number, gaps: [number, number][], rims: [number, number] }

export type Move = 'still' | 'peek' | 'drawer' | 'stamp' | 'trolley'

export type Slot = { key: string, move: Move, items: Item[] }

// The two places the card is drawn: among the drawer's cards while it is in the drawer, and over the desk once clear.
export type CardSlot = { key: 'card.low' | 'card.high', move: 'card' }
// The same two places for the hoist's hook and its cable.
export type HookSlot = { key: 'hook.low' | 'hook.high', move: 'hook' }

const SLOTS: (Slot | CardSlot | HookSlot)[] = []
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

const slabShape = (plan: Plan, z: number, h: number, steps = 4, meta?: Meta) => ({ kind: 'slab' as const, plan, z, h, steps, meta })

type BlockOptions = { steps?: number, bevel?: number, extra?: Mark[], inner?: { d: string, tone: LineTone }[], crease?: Tone | 'none', meta?: Meta, lit?: boolean }

// A rounded block: the commonest part. `extra` adds screws, grooves and seams drawn on it.
function block (name: string, plan: Plan, z: number, h: number, tone: Tone = 'mid', { steps = 4, bevel = 0.6, extra = [], inner, crease = 'faint', meta, lit }: BlockOptions = {}) {
  item(name, [solid(slabOf(plan, z, h, P, steps, bevel), tone, { inner, crease, lit }), ...extra], [slabShape(plan, z, h, steps, meta)])
}

function post (name: string, cx: number, cy: number, r: number, z: number, h: number, tone: Tone = 'mid', { extra = [], steps = 28, crease = 'faint', meta }: { extra?: Mark[], steps?: number, crease?: Tone | 'none', meta?: Meta } = {}) {
  item(name, [solid(cylinderOf(cx, cy, r, z, h, P, steps), tone, { crease }), ...extra], [{ kind: 'cylinder', cx, cy, r, z, h, meta }])
}

// A turned part on any axis: `profile` is [s, r] from one end to the other, closed to the axis at both ends.
function turned (name: string, F: Frame, profile: [number, number][], tone: Tone = 'mid', { extra = [], meta }: { extra?: Mark[], meta?: Meta } = {}) {
  item(name, [solid(G.solidOf(profile, F, P), tone), ...extra], [{ kind: 'turned', F, profile, meta }])
}

const along = (o: Point3, a: Point3) => G.frameAlong(o, a)

const screwsOn = (points: Point3[], size = 0.5, tone: Tone = 'mid') => dots(points.map(at), size, tone)
const cornerScrews = (plan: Plan, inset: number, z: number) => corners(plan, inset).map(([x, y]): Point3 => [x, y, z])

// A closed rectangle on the vertical face y = const (the xz plane), for label holders and slots on a front.
const faceRectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(p => at(p as Point3)), true)
// A closed rectangle on the vertical face x = const (the yz plane).
const faceRectX = (x: number, y0: number, y1: number, z0: number, z1: number) => pathOf([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]].map(p => at(p as Point3)), true)
// A line across a face from one edge to the other.
const across = (from: Point3, to: Point3) => pathOf([at(from), at(to)])

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

// --- Drawer fronts ----------------------------------------------------------------------------------------------------

// A pull knob on a front face, turned along +y: a rose, a neck and a domed head.
const KNOB: [number, number][] = [[0, 2.2], [0.7, 2.2], [0.9, 1.1], [1.9, 1.1], [2.3, 2.4], [3.6, 2.4], [4.2, 1.7]]

// The label holder over the pull: a frame with a card in it, two rivets and the label's one rule line.
function holderMarks (cx: number, face: number, z0: number): Mark[] {
  const [x0, x1, h0, h1] = [cx - 7.5, cx + 7.5, z0 + 10.5, z0 + 16]
  return [
    line(faceRectY(face, x0, x1, h0, h1), 'lo'),
    line(faceRectY(face, x0 + 1.2, x1 - 1.2, h0 + 1, h1 - 1), 'faint'),
    line(across([cx - 4.6, face, h0 + 2.75], [cx + 3.4, face, h0 + 2.75]), 'lo', true),
    screwsOn([[x0 - 1.2, face, (h0 + h1) / 2], [x1 + 1.2, face, (h0 + h1) / 2]], 0.45),
  ]
}

// One drawer front: the panel, its label holder and its pull. `y0` is the panel's back face, `t` its thickness.
function front (name: string, x: number, y0: number, t: number, z0: number) {
  const plan: Plan = { x: x + 0.4, y: y0, w: CELL_W - 0.8, d: t, r: 0.5 }
  const cx = x + CELL_W / 2
  const face = y0 + t
  block(`${name}.front`, plan, z0 + 1.2, ROW_H - 1.8, 'mid', { bevel: 0.4, steps: 3, extra: holderMarks(cx, face, z0) })
  const F = along([cx, face, z0 + 6.5], [0, 1, 0])
  turned(`${name}.knob`, F, KNOB, 'mid', { extra: [line(G.circleOf(F, 3.6, 1, P, 14), 'lo')] })
}

// --- Base -----------------------------------------------------------------------------------------------------------

slot('base', 'still')
item('stand.halo', [{ kind: 'halo', d: slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill }])
// A turned foot: a pad on the ground and a neck up into the plate.
const FOOT_PROFILE: [number, number][] = [[0, 7], [1.6, 7], [1.6, 5.4], [FOOT_H, 5.4]]
for (const [x, y] of byDepth(corners(BASE, 24))) {
  turned('stand.foot', along([x, y, -BASE_H - FOOT_H], [0, 0, 1]), FOOT_PROFILE, 'lo', { meta: { ground: true } })
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

// Label plate in front of the cabinet, clear of the plate's corner screw, three rule lines that stand for its print.
const LABEL: Plan = { x: -150, y: 28, w: 30, d: 17, r: 1.2 }
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

// --- The cabinet: the carcass with three closed rows ---------------------------------------------------------------

slot('cabinet', 'still')
// The near side is framed: a raised panel outline with a second, inset one, like the panel in a carcass side.
const SIDE_X = CAB.x + CAB.w
const sidePanel = (z0: number, z1: number) => [
  line(faceRectX(SIDE_X, CAB.y + 6, FRONT - 6, z0, z1), 'lo'),
  line(faceRectX(SIDE_X, CAB.y + 9, FRONT - 9, z0 + 3, z1 - 3), 'faint'),
]
block('cabinet.body', CAB, 0, TOP_ROW, 'mid', {
  steps: 4,
  bevel: 0.8,
  inner: [{ d: sideSeam(CAB, 4, P, 4), tone: 'faint' }],
  extra: [...sidePanel(9, 60), screwsOn([[SIDE_X, CAB.y + 3, 7], [SIDE_X, FRONT - 3, 7], [SIDE_X, CAB.y + 3, 62], [SIDE_X, FRONT - 3, 62]], 0.45)],
})
// The closed drawers, far column first, each from the bottom row up.
for (const x of CELLS) {
  for (const [row, z0] of ROWS.entries()) front(`cabinet.drawer.${x}.${row}`, x, FRONT, 1.2, z0)
}

// --- The top row: side, the neighbouring drawer, divider, rails and the picked drawer --------------------------------

slot('top.left', 'still')
block('cabinet.side.left', { x: CAB.x, y: CAB.y, w: 3, d: CAB.d, r: 0.6 }, TOP_ROW, TOP_Z - TOP_ROW, 'mid', { bevel: 0.4, steps: 2 })

// A drawer box: floor, walls and cards, built closed in its cell. `cards` are the y of each standing card's back face.
const boxPlan = (x: number): Plan => ({ x: x + 0.5, y: BOX_Y, w: CELL_W - 1, d: BOX_D, r: 0.6 })
const wallPlan = (x: number, side: 'left' | 'right'): Plan => ({ x: side === 'left' ? x + 0.5 : x + CELL_W - 1.7, y: BOX_Y + 1.2, w: 1.2, d: BOX_D - 1.2, r: 0.3 })
const cardPlan = (cx: number, y: number): Plan => ({ x: cx - CARD_W / 2, y, w: CARD_W, d: CARD_T, r: 0.2 })
const standing = (name: string, cx: number, y: number, z: number) =>
  block(name, cardPlan(cx, y), z, CARD_H, 'hi', { bevel: 0, steps: 1, crease: 'lo', extra: [line(lineOnTop([cx - CARD_W / 2 + 0.6, y + CARD_T / 2], [cx + CARD_W / 2 - 0.6, y + CARD_T / 2], z + CARD_H, P), 'lo')] })

slot('peek', 'peek')
block('peek.floor', boxPlan(PEEK_X), TOP_ROW, FLOOR_TOP - TOP_ROW, 'lo', { bevel: 0, steps: 2 })
block('peek.wall.left', wallPlan(PEEK_X, 'left'), FLOOR_TOP, WALL_H, 'mid', { bevel: 0.3, steps: 2 })
standing('peek.card', PEEK_X + CELL_W / 2, -23, FLOOR_TOP)
block('peek.wall.right', wallPlan(PEEK_X, 'right'), FLOOR_TOP, WALL_H, 'mid', { bevel: 0.3, steps: 2 })
front('peek', PEEK_X, FRONT, 2, TOP_ROW)

slot('top.mid', 'still')
block('cabinet.divider.left', { x: PEEK_X + CELL_W, y: CAB.y, w: 2, d: CAB.d, r: 0.4 }, TOP_ROW, TOP_Z - TOP_ROW, 'mid', { bevel: 0.3, steps: 2 })
// The picked drawer's rails: two runners on the cell floor, their ends flush with the closed front.
for (const x of [MAIN_X + 5, MAIN_X + CELL_W - 7]) {
  block('rails.runner', { x, y: CAB.y + 2, w: 2, d: CAB.d, r: 0.4 }, TOP_ROW, RAIL_TOP - TOP_ROW, 'lo', { bevel: 0, steps: 2, extra: [screwsOn([[x + 1, FRONT - 4, RAIL_TOP]], 0.4)] })
}

// The picked drawer, back half: floor, back wall, left wall and the cards behind the picked one.
slot('drawer.back', 'drawer')
const MAIN_CX = MAIN_X + CELL_W / 2
block('drawer.floor', boxPlan(MAIN_X), RAIL_TOP, FLOOR_TOP - RAIL_TOP, 'lo', { bevel: 0, steps: 2 })
block('drawer.wall.back', { x: MAIN_X + 0.5, y: BOX_Y, w: CELL_W - 1, d: 1.2, r: 0.3 }, FLOOR_TOP, WALL_H, 'mid', { bevel: 0.3, steps: 2 })
block('drawer.wall.left', wallPlan(MAIN_X, 'left'), FLOOR_TOP, WALL_H, 'mid', { bevel: 0.3, steps: 2 })
for (const y of [-45, -39, -33]) standing('drawer.card', MAIN_CX, y, FLOOR_TOP)

SLOTS.push({ key: 'hook.low', move: 'hook' })
SLOTS.push({ key: 'card.low', move: 'card' })

// The picked drawer, front half: the right wall and the front with its pull.
slot('drawer.front', 'drawer')
block('drawer.wall.right', wallPlan(MAIN_X, 'right'), FLOOR_TOP, WALL_H, 'mid', { bevel: 0.3, steps: 2 })
front('drawer', MAIN_X, FRONT, 2, TOP_ROW)

// --- The top row's near side and the top ------------------------------------------------------------------------------

slot('top.right', 'still')
block('cabinet.divider.right', { x: MAIN_X + CELL_W, y: CAB.y, w: 2, d: CAB.d, r: 0.4 }, TOP_ROW, TOP_Z - TOP_ROW, 'mid', { bevel: 0.3, steps: 2 })
const RIGHT: Plan = { x: CELLS[2], y: CAB.y, w: CAB.x + CAB.w - CELLS[2], d: CAB.d, r: 0.8 }
block('cabinet.block.right', RIGHT, TOP_ROW, TOP_Z - TOP_ROW, 'mid', { bevel: 0.4, steps: 3, extra: sidePanel(69, 81) })
front('cabinet.drawer.right', CELLS[2], FRONT, 1.2, TOP_ROW)
const LID: Plan = { x: CAB.x - 2, y: CAB.y - 2, w: CAB.w + 4, d: CAB.d + 5, r: 2 }
block('cabinet.top', LID, TOP_Z, LID_TOP - TOP_Z, 'mid', {
  steps: 6,
  bevel: 1,
  inner: [{ d: sideSeam(LID, TOP_Z + 1.4, P, 6), tone: 'faint' }],
  extra: [line(planOutline(insetPlan(LID, 4), LID_TOP, P, 6), 'faint'), screwsOn(cornerScrews(LID, 7, LID_TOP), 0.45)],
})

// A short stack of books on the lid's back corner: boards, the spine (near-left face) with its bands, the page edges
// (right face), and the top book's ribbon over its page edge.
const BOOKS: { plan: Plan, h: number }[] = [
  { plan: { x: -64, y: -75, w: 34, d: 24, r: 0.3 }, h: 6 },
  { plan: { x: -62, y: -73, w: 30, d: 21, r: 0.3 }, h: 5 },
  { plan: { x: -63, y: -72, w: 31, d: 19, r: 0.3 }, h: 4.5 },
]
let bookZ = LID_TOP
for (const [index, { plan, h }] of BOOKS.entries()) {
  const z0 = bookZ
  const z1 = bookZ + h
  const spine = plan.y + plan.d
  const edge = plan.x + plan.w
  const bands = [plan.x + 5, plan.x + 8, plan.x + plan.w - 8, plan.x + plan.w - 5].map(x => across([x, spine, z0], [x, spine, z1])).join('')
  // The page edges run from the fore-edge corner to the spine's turn-in, a line just short of the spine.
  const turnIn = across([edge, spine - 1.4, z0], [edge, spine - 1.4, z1])
  const pages = Array.from({ length: Math.floor((h - 1) / 1.2) }, (_, row) => across([edge, plan.y + plan.r, z0 + 0.8 + row * 1.2], [edge, spine - 1.4, z0 + 0.8 + row * 1.2])).join('')
  block(`book.${index}`, plan, z0, h, index === 1 ? 'mid' : 'hi', {
    bevel: 0.3,
    steps: 2,
    extra: [line(bands, 'lo'), line(pages, 'faint'), line(turnIn, 'faint'), line(planOutline(insetPlan(plan, 2.4), z1, P, 2), 'faint')],
  })
  bookZ = z1
}
{
  const { plan, h } = BOOKS[2]
  const edge = plan.x + plan.w
  const [y0, y1, top, low] = [plan.y + 6, plan.y + 8, bookZ, bookZ - h]
  const strip = pathOf([at([edge - 6, y0, top]), at([edge, y0, top]), at([edge, y0, low]), at([edge, (y0 + y1) / 2, low + 1.2]), at([edge, y1, low]), at([edge, y1, top]), at([edge - 6, y1, top])], true)
  item('book.ribbon', [line(strip, 'hi')])
}

// --- The loan desk ------------------------------------------------------------------------------------------------------

slot('desk', 'still')
for (const x of [DESK.x + 4, DESK.x + DESK.w - 9]) {
  const plan: Plan = { x, y: DESK.y + 4, w: 5, d: DESK.d - 8, r: 1 }
  block('desk.pedestal', plan, 0, DESK_Z, 'mid', { bevel: 0.5, inner: [{ d: sideSeam(plan, 4, P, 4), tone: 'faint' }] })
}
block('desk.top', DESK, DESK_Z, DESK_TOP - DESK_Z, 'mid', {
  steps: 6,
  bevel: 1,
  inner: [{ d: sideSeam(DESK, DESK_Z + 1.4, P, 6), tone: 'faint' }],
  extra: [line(planOutline(insetPlan(DESK, 4), DESK_TOP, P, 6), 'faint'), screwsOn(cornerScrews(DESK, 7, DESK_TOP), 0.45)],
})

// The terminal block at the back left of the desk: two screw terminals the reader's lead ends on.
const TERMINAL: Plan = { x: 14, y: -45, w: 14, d: 9, r: 1 }
const TERMINAL_TOP = DESK_TOP + 6
const TERMINAL_Y = TERMINAL.y + TERMINAL.d / 2
block('desk.terminal', TERMINAL, DESK_TOP, TERMINAL_TOP - DESK_TOP, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(TERMINAL, DESK_TOP + 2, P, 4), tone: 'faint' }],
  extra: [
    line([18, 24].map(x => ringOn(x, TERMINAL_Y, 1.8, TERMINAL_TOP, P, 16)).join(''), 'lo'),
    line([18, 24].map(x => lineOnTop([x - 1.2, TERMINAL_Y], [x + 1.2, TERMINAL_Y], TERMINAL_TOP, P)).join(''), 'mid'),
  ],
})

// The key-card reader's lead runs from the reader's back, behind the stamp, to the terminal block.
const READER: Plan = { x: 96, y: 6, w: 22, d: 15, r: 2 }
const LEAD_Z = DESK_TOP + 4
cable('reader.lead', [[107, READER.y, LEAD_Z], [107, -38, LEAD_Z], [60, -40, LEAD_Z], [TERMINAL.x + TERMINAL.w, TERMINAL_Y, LEAD_Z]], 0.8)

// The stamp's foot plate, on the desk under the column.
const FOOT: Plan = { x: 80, y: -14, w: 16, d: 18, r: 2 }
block('stamp.foot', FOOT, DESK_TOP, 2.5, 'mid', { bevel: 0.6, extra: [screwsOn(cornerScrews(FOOT, 2.4, DESK_TOP + 2.5), 0.45)] })

SLOTS.push({ key: 'hook.high', move: 'hook' })
SLOTS.push({ key: 'card.high', move: 'card' })

// --- The date stamp: carriage, arm, neck and head, raised; they move down together ----------------------------------

slot('stamp', 'stamp')
const HEAD_CX = HEAD.x + HEAD.w / 2
const HEAD_CY = HEAD.y + HEAD.d / 2
block('stamp.pad', insetPlan(HEAD, 1), PAD_Z, 1.2, 'lo', { bevel: 0, steps: 3, crease: 'none' })
block('stamp.head', HEAD, PAD_Z + 1.2, 5, 'mid', {
  bevel: 0.6,
  inner: [{ d: sideSeam(HEAD, PAD_Z + 2.8, P, 4) + sideSeam(HEAD, PAD_Z + 4.4, P, 4), tone: 'faint' }],
  extra: [screwsOn(cornerScrews(HEAD, 2.2, PAD_Z + 6.2), 0.4)],
})
post('stamp.neck', HEAD_CX, HEAD_CY, 2, PAD_Z + 6.2, ARM_Z - PAD_Z - 6.2, 'mid', { steps: 20, extra: [line(sideArc(HEAD_CX, HEAD_CY, 2, PAD_Z + 8, P, 16), 'faint')] })
const ARM: Plan = { x: HEAD_CX - 5, y: -7, w: COLUMN.x - 8 - HEAD_CX + 5, d: 6, r: 1 }
block('stamp.arm', ARM, ARM_Z, 5, 'mid', { bevel: 0.5, extra: [screwsOn([[HEAD_CX, HEAD_CY, ARM_Z + 5]], 0.5)] })
const CARRIAGE: Plan = { x: COLUMN.x - 8, y: -9, w: 8, d: 10, r: 1 }
block('stamp.carriage', CARRIAGE, ARM_Z - 6, 14, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(CARRIAGE, ARM_Z - 2, P, 4), tone: 'faint' }],
  extra: [screwsOn([[CARRIAGE.x + 2, CARRIAGE.y + 2, ARM_Z + 8], [CARRIAGE.x + 2, CARRIAGE.y + CARRIAGE.d - 2, ARM_Z + 8]], 0.45)],
})
// A knurled thumb screw locks the carriage, on its near face.
const THUMB_F = along([CARRIAGE.x + 4, CARRIAGE.y + CARRIAGE.d, ARM_Z + 3], [0, 1, 0])
const thumbKnurl = G.ribsOf(THUMB_F, 1.2, 3.8, 2.2, 18, P, { fade: [0.05, 0.5] })
turned('stamp.thumb', THUMB_F, [[0, 1], [1.2, 1], [1.2, 2.2], [3.8, 2.2]], 'mid', {
  extra: [line(thumbKnurl.filter(rib => rib.alpha > 0.5).map(rib => rib.d).join(''), 'lo'), line(G.circleOf(THUMB_F, 3.8, 0.8, P, 12), 'lo')],
})

slot('stamp.column', 'still')
block('stamp.column', COLUMN, DESK_TOP + 2.5, COLUMN_TOP - DESK_TOP - 2.5, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(COLUMN, DESK_TOP + 6, P, 4), tone: 'faint' }],
  extra: [line(faceRectX(COLUMN.x + COLUMN.w, COLUMN.y + 4, COLUMN.y + 8, DESK_TOP + 14, COLUMN_TOP - 6), 'lo')],
})
const CAP: Plane = [COLUMN.x + COLUMN.w / 2, COLUMN.y + COLUMN.d / 2]
post('stamp.cap', CAP[0], CAP[1], 3.4, COLUMN_TOP, 4, 'mid', {
  steps: 32,
  extra: [line(knurl(CAP[0], CAP[1], 3.4, COLUMN_TOP, COLUMN_TOP + 4, 28, P), 'lo'), line(ringOn(CAP[0], CAP[1], 1.2, COLUMN_TOP + 4, P, 12), 'lo')],
})

// --- In front of the stamp: the ink pad and the key-card reader ---------------------------------------------------

slot('front', 'still')
// The hoist's near post stands on the desk between the stamp's column and the key-card reader, clear of the card.
const POST_R: Plan = { x: BEAM.x + BEAM.w - 4, y: HOIST_Y - 2, w: 4, d: 4, r: 0.8 }
block('hoist.post', POST_R, DESK_TOP, BEAM_Z - DESK_TOP, 'mid', {
  bevel: 0.4,
  steps: 3,
  inner: [{ d: sideSeam(POST_R, DESK_TOP + 3, P, 3), tone: 'faint' }],
  extra: [screwsOn([[POST_R.x + 2, POST_R.y + POST_R.d, DESK_TOP + 6], [POST_R.x + 2, POST_R.y + POST_R.d, BEAM_Z - 6]], 0.4)],
})
const TIN: Plan = { x: 64, y: 12, w: 24, d: 14, r: 2.4 }
block('inkpad.tin', TIN, DESK_TOP, 2.6, 'mid', { bevel: 0.5, extra: [screwsOn([[TIN.x + 2.2, TIN.y + TIN.d / 2, DESK_TOP + 2.6]], 0.4)] })
block('inkpad.felt', insetPlan(TIN, 2.2), DESK_TOP + 2.6, 0.5, 'lo', { bevel: 0, steps: 3, crease: 'none', extra: [line(planOutline(insetPlan(TIN, 3.6), DESK_TOP + 3.1, P, 3), 'faint')] })

// Role-based access is a key card in the reader's slot, with a status lamp beside it.
const READER_TOP = DESK_TOP + 9
const SLOT_PLAN: Plan = { x: READER.x + 3, y: READER.y + 6, w: 12, d: 1.4, r: 0.6 }
block('reader.body', READER, DESK_TOP, READER_TOP - DESK_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(READER, DESK_TOP + 2.4, P, 4), tone: 'faint' }],
  extra: [
    line(planOutline(SLOT_PLAN, READER_TOP, P, 3), 'lo'),
    line([0, 1, 2].map(index => faceRectY(READER.y + READER.d, READER.x + 5 + index * 4.6, READER.x + 7.4 + index * 4.6, DESK_TOP + 3.6, DESK_TOP + 6.6)).join(''), 'lo'),
    screwsOn([[READER.x + 2.6, READER.y + 2.6, READER_TOP], [READER.x + READER.w - 2.6, READER.y + READER.d - 2.6, READER_TOP]], 0.45),
  ],
})
const KEYCARD_Y = SLOT_PLAN.y + 0.45
block('reader.keycard', { x: SLOT_PLAN.x + 1, y: KEYCARD_Y, w: SLOT_PLAN.w - 2, d: 0.5, r: 0.2 }, READER_TOP, 8, 'hi', {
  bevel: 0,
  steps: 1,
  crease: 'lo',
  extra: [line(faceRectY(KEYCARD_Y + 0.5, SLOT_PLAN.x + 2.6, SLOT_PLAN.x + 6, READER_TOP + 3.4, READER_TOP + 6), 'lo')],
})
const LAMP: Plane = [READER.x + READER.w - 4, READER.y + READER.d - 5]
post('reader.lamp', LAMP[0], LAMP[1], 1.6, READER_TOP, 1.2, 'mid', { steps: 20, extra: [dots([at([LAMP[0], LAMP[1], READER_TOP + 1.2])], 0.7, 'hi')] })

// --- The hoist: the far post, the trolley and the beam, over everything else ----------------------------------------

slot('hoist.far', 'still')
const POST_L: Plan = { x: BEAM.x, y: HOIST_Y - 2, w: 4, d: 4, r: 0.8 }
block('hoist.post', POST_L, 0, BEAM_Z, 'mid', {
  bevel: 0.4,
  steps: 3,
  inner: [{ d: sideSeam(POST_L, 3, P, 3), tone: 'faint' }],
  extra: [screwsOn([[POST_L.x + 2, POST_L.y + POST_L.d, 6], [POST_L.x + 2, POST_L.y + POST_L.d, BEAM_Z - 6]], 0.4)],
})

// The trolley hangs under the beam on two wheels, built over the open drawer; it runs along x with the hook.
slot('trolley', 'trolley')
const TROLLEY_X = HOOK_REF_X + CABLE_DX
const TROLLEY: Plan = { x: TROLLEY_X - 7, y: HOIST_Y - 4, w: 14, d: 8, r: 1 }
const TROLLEY_FACE = TROLLEY.y + TROLLEY.d
block('trolley.body', TROLLEY, TROLLEY_Z, BEAM_Z - TROLLEY_Z, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(TROLLEY, TROLLEY_Z + 1.6, P, 4), tone: 'faint' }],
  extra: [
    line([-3.6, 3.6].map(dx => G.circleOf(along([TROLLEY_X + dx, TROLLEY_FACE, BEAM_Z - 3.4], [0, 1, 0]), 0, 2.2, P, 16)).join(''), 'lo'),
    screwsOn([-3.6, 3.6].map((dx): Point3 => [TROLLEY_X + dx, TROLLEY_FACE, BEAM_Z - 3.4]), 0.5),
  ],
})

slot('beam', 'still')
block('hoist.beam', BEAM, BEAM_Z, 4, 'mid', {
  bevel: 0.5,
  steps: 3,
  inner: [{ d: sideSeam(BEAM, BEAM_Z + 2, P, 3), tone: 'faint' }],
  extra: [screwsOn([[BEAM.x + 2, HOIST_Y, BEAM_Z + 4], [BEAM.x + BEAM.w - 2, HOIST_Y, BEAM_Z + 4]], 0.5)],
})

// --- Exports for the static art, the live loop and the audit ----------------------------------------------------

export const PARTS = SLOTS
export const PROJECTION = P

// The card's frame for a pose: the bottom edge's centre, the face normal tipping from +y (standing) to +z (lying).
export function cardFrame (pose: CardPose): Frame {
  const angle = pose.tilt * Math.PI / 2
  const [c, s] = [Math.cos(angle), Math.sin(angle)]
  return { o: pose.at as Point3, a: [0, c, s], u: [1, 0, 0], v: [0, s, -c] }
}

// The card's outline in its own plane: u across, v from the bottom edge (0) to the top edge (-CARD_H).
export const CARD_POLYGON: Plane[] = roundedPlan({ x: -CARD_W / 2, y: -CARD_H, w: CARD_W, d: CARD_H, r: 0.8 }, 3)

export type CardDraw = { paths: SolidPaths, rules: string, hole: string, mark: string, date: string }

const onFace = (F: Frame, points: Plane[]) => points.map(([u, v]): Flat => at([
  F.o[0] + F.a[0] * (CARD_T + 0.02) + F.u[0] * u + F.v[0] * v,
  F.o[1] + F.a[1] * (CARD_T + 0.02) + F.u[1] * u + F.v[1] * v,
  F.o[2] + F.a[2] * (CARD_T + 0.02) + F.u[2] * u + F.v[2] * v,
]))

// The stamp's impression on the card, in card coordinates: under the pad's centre when the card lies at CARD_LAND.
const MARK = { u0: -5.4, u1: 5.4, v0: -10.6, v1: -5.4 }

// Everything drawn for the card in a pose: its solid, its printed rules, the rod hole, and the stamp mark once inked.
export function cardOf (pose: CardPose, inked: boolean): CardDraw {
  const F = cardFrame(pose)
  const rules = [[-11, -14.2, 9], [-11, -12.6, 4], [-11, -2.8, -5]].map(([u0, v, u1]) => pathOf(onFace(F, [[u0, v], [u1, v]]))).join('')
  const hole = pathOf(onFace(F, Array.from({ length: 16 }, (_, index): Plane => [1.1 * Math.cos(index * Math.PI / 8) + 4, 1.1 * Math.sin(index * Math.PI / 8) - 2.6])), true)
  const mark = inked ? pathOf(onFace(F, [[MARK.u0, MARK.v0], [MARK.u1, MARK.v0], [MARK.u1, MARK.v1], [MARK.u0, MARK.v1]]), true) : ''
  const date = inked ? pathOf(onFace(F, [[MARK.u0 + 1.8, (MARK.v0 + MARK.v1) / 2], [MARK.u1 - 2.4, (MARK.v0 + MARK.v1) / 2]])) : ''
  return { paths: G.prismOf(F, CARD_POLYGON, 0, CARD_T, P), rules, hole, mark, date }
}

// The hook for a point it holds (the card's bottom-edge centre): a clip beside the card's far end and the cable from
// the clip up to the trolley. While the hook is down in the drawer (not `clear`) the cable is drawn in two lengths split
// at the cabinet top's underside: the length below it sits behind the open drawer's front, the length above it in
// front of the cabinet top. Otherwise `low` is null and `high` is the whole cable.
type Cable = { cx: number, cy: number, r: number, z: number, h: number }
type HookShapes = { clip: { plan: Plan, z: number, h: number }, low: Cable | null, high: Cable }

export function hookShapes (hook: Point, clear: boolean): HookShapes {
  const [x, y, z] = hook
  const clip = { plan: { x: x - CARD_W / 2 - HOOK_GAP, y: y + HOOK_DY[0], w: HOOK_GAP, d: HOOK_DY[1] - HOOK_DY[0], r: 0.3 }, z: z + HOOK_LIFT, h: HOOK_H }
  const top = clip.z + clip.h
  const split = clear ? top : Math.max(top, TOP_Z)
  const cable = (from: number, to: number): Cable => ({ cx: x + CABLE_DX, cy: HOIST_Y, r: CABLE_R, z: from, h: to - from })
  return { clip, low: split - top > 0.01 ? cable(top, split) : null, high: cable(split, TROLLEY_Z) }
}

export type HookDraw = { clip: SolidPaths, pin: string, low: SolidPaths | null, high: SolidPaths }

export function hookOf (hook: Point, clear: boolean): HookDraw {
  const { clip, low, high } = hookShapes(hook, clear)
  const face = clip.plan.x
  const pin = G.circleOf(along([face, hook[1] + 2.2, clip.z + 3], [-1, 0, 0]), 0, 0.9, P, 12)
  const cable = ({ cx, cy, r, z, h }: Cable) => cylinderOf(cx, cy, r, z, h, P, 12)
  return { clip: slabOf(clip.plan, clip.z, clip.h, P, 2, 0), pin, low: low && cable(low), high: cable(high) }
}

// Screen transforms for the moving slots: the picked drawer's share out, the neighbour's peek, the stamp's press and
// the trolley over the hook.
export function movesOf (open: number, peek: number, press: number, hookX: number) {
  return {
    drawer: translateAlong(P, [0, open * OPEN, 0]),
    peek: translateAlong(P, [0, peek * PEEK, 0]),
    stamp: translateAlong(P, [0, 0, -press * STAMP_TRAVEL]),
    trolley: translateAlong(P, [hookX - HOOK_REF_X, 0, 0]),
  }
}
