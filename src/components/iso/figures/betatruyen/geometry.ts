/*
  The forum desk, built once from the kit. World units are about 1 px, x runs left to right along the desk, y from the
  back to the front, z up. Every drawn item carries the true shapes of what it draws (for the audit beside this file)
  and sits in a slot of the painter's order. A slot either stays still or moves with one part (the comment card, its
  pin, the two ranked books, the two scale pans, the lever knob) by a transform. Three parts turn, so their paths are
  rebuilt from the pose: the page leaf, the rating beam and the ranking lever.
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
  topTicks,
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
import type { DeskPose } from '@/components/iso/figures/betatruyen/model'

export const WIDTH = 600
export const HEIGHT = 390
const AZIMUTH = 50
const ELEVATION = 40

// --- The round-part module of the kit is plain JS; this is the slice of it this figure uses. ------------------------

export type Frame = { o: Point3, a: Point3, u: Point3, v: Point3 }

const G = latheModule as unknown as {
  solidOf (profile: [number, number][], F: Frame, P: Projection): SolidPaths
  prismOf (F: Frame, polygon: Plane[], s0: number, s1: number, P: Projection): SolidPaths
  circleOf (F: Frame, s: number, r: number, P: Projection, steps?: number): string
  ribsOf (F: Frame, s0: number, s1: number, r: number, count: number, P: Projection, options: { fade: [number, number] }): { d: string, alpha: number }[]
  cross3 (a: Point3, b: Point3): Point3
}

// A right-handed frame along `a`, with `u` given: cross(u, v) = a, which prismOf and the audit both expect.
const frameOf = (o: Point3, a: Point3, u: Point3): Frame => ({ o, a, u, v: G.cross3(a, u) })
const X: Point3 = [1, 0, 0]
const Y: Point3 = [0, 1, 0]
const Z: Point3 = [0, 0, 1]

// --- World layout -------------------------------------------------------------------------------------------------

const BASE: Plan = { x: -146, y: -95, w: 272, d: 166, r: 9 }
const BASE_H = 12
const FOOT_H = 5

// Comment board, back left: two posts, a cork board between them, a slot box on top.
const POSTS = [-134, -42]
const POST_TOP = 72
const BOARD: Plan = { x: -128, y: -83, w: 86, d: 4, r: 0.4 }
const BOARD_Z = 22
const BOARD_TOP = 64
const FACE = BOARD.y + BOARD.d
const CARD_T = 0.6
const HOPPER: Plan = { x: -70, y: -87, w: 18, d: 15, r: 1 }
const HOPPER_TOP = 72
// The new card, built where it ends up; it starts this far up, in the slot.
const NEW_CARD = { x: -68, w: 14, z: 34, h: 12 }
const DROP = 30
const PIN_OUT = 1
// The slot's mouth runs this far in front of the board face, so the pin's head rides down it clear of the lip.
const MOUTH = CARD_T + 2 + PIN_OUT + 0.6

// Ranking rack, back right: four rails, a bracket and a book on each, a top bar, the lever on the side plate.
const RAILS = [40, 58, 76, 94]
const LEVELS = [40, 31, 22, 13]
const PITCH = LEVELS[0] - LEVELS[1]
const BOOK_H = [22, 20, 24, 18]
const RAIL_TOP = 72
const PIVOT: Plane = [-74, 32]
const LEVER_X = 109.5
const LEVER_LEN = 20
const LEVER_REST = -0.4
const LEVER_SWING = 0.8

// Rating balance, between the board and the rack: a pillar, a knife-edge cap, the beam and two pans.
const BAL_X = 10
const BAL_Y = -62
const CAP_TOP = 44
const BEAM_HALF = 18
const ARM = 16
const TIP = 0.2
const PAN_Z = 20
const PAN_H = 1.6

// Lectern, front left: a column, a wedge desk tilted toward the reader, a ledge, the open book.
const BOOK_X = -82
const LEDGE_Y = 40
const SLOPE = Math.atan2(13.6, 42)
const SC = Math.cos(SLOPE)
const SS = Math.sin(SLOPE)
// On the desk's top: x, s up the slope from the ledge, h off the surface.
const onDesk = (x: number, s: number, h: number): Point3 => [x, LEDGE_Y - s * SC + h * SS, 30 + s * SS + h * SC]
const T: Point3 = [0, -SC, SS]
const N: Point3 = [0, SS, SC]
const LEAF_W = 23.5
const LEAF_S: [number, number] = [2.5, 37]
const BLOCK_TOP = 4.4
const LEAF_H = BLOCK_TOP + 0.2

// Character index cabinet, front middle, with a dial whose pointer turns from its rest angle while the page is read.
const CAB: Plan = { x: 14, y: 4, w: 56, d: 34, r: 2 }
const CAB_TOP = 30
const DIAL_REST = -0.8
const DIAL_SWING = 2.2

// --- Camera ---------------------------------------------------------------------------------------------------------

const box = ({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] =>
  [x, x + w].flatMap(px => [y, y + d].flatMap(py => [z0, z1].map((pz): Point3 => [px, py, pz])))

export const P: Projection = fitProjection(
  [
    ...box(BASE, -BASE_H - FOOT_H, 0),
    ...box({ x: -137, y: -88, w: 100, d: 14, r: 0 }, 0, NEW_CARD.z + NEW_CARD.h + DROP),
    ...box({ x: 30, y: -86, w: 88, d: 24, r: 0 }, 0, RAIL_TOP + 4),
    onDesk(BOOK_X, LEAF_S[1], LEAF_H + LEAF_W),
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: AZIMUTH, elevation: ELEVATION }
)

const at = (point: Point3) => iso(point, P)

// --- What an item draws and what it is ------------------------------------------------------------------------------

export type Shape =
  | { kind: 'slab', plan: Plan, z: number, h: number, steps: number }
  | { kind: 'cylinder', cx: number, cy: number, r: number, z: number, h: number }
  | { kind: 'turned', F: Frame, profile: [number, number][] }
  | { kind: 'prism', F: Frame, poly: Plane[], s0: number, s1: number }

export type Mark =
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', lit?: boolean, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }

export type Item = { name: string, marks: Mark[], shapes: Shape[] }

export type Move = 'still' | 'card' | 'pin' | 'rise' | 'fall' | 'panBack' | 'panFront' | 'knob'

export type Turning = 'leaf' | 'beam' | 'lever' | 'dial'

export type Slot = { key: string, move: Move, items: Item[] }

type TurnSlot = { key: Turning, move: 'turn', name: string, tone: Tone }

const SLOTS: (Slot | TurnSlot)[] = []
let current: Slot = { key: 'start', move: 'still', items: [] }

function slot (key: string, move: Move = 'still') {
  current = { key, move, items: [] }
  SLOTS.push(current)
}

function turning (key: Turning, name: string, tone: Tone = 'mid') {
  SLOTS.push({ key, move: 'turn', name, tone })
}

function item (name: string, marks: Mark[], shapes: Shape[] = []) {
  current.items.push({ name, marks, shapes })
}

const solid = (paths: SolidPaths, tone: Tone = 'mid', options: Partial<Extract<Mark, { kind: 'solid' }>> = {}): Mark => ({ kind: 'solid', paths, tone, crease: 'faint', ...options })
const line = (d: string, tone: LineTone = 'lo', free = false): Mark => ({ kind: 'line', d, tone, free: free || undefined })
const dots = (points: Flat[], size = 0.5, tone: Tone = 'mid'): Mark => ({ kind: 'dots', points, size, tone })

type BlockOptions = { steps?: number, bevel?: number, extra?: Mark[], inner?: { d: string, tone: LineTone }[], crease?: Tone | 'none', lit?: boolean }

function block (name: string, plan: Plan, z: number, h: number, tone: Tone = 'mid', { steps = 4, bevel = 0.6, extra = [], inner, crease = 'faint', lit }: BlockOptions = {}) {
  item(name, [solid(slabOf(plan, z, h, P, steps, bevel), tone, { inner, crease, lit }), ...extra], [{ kind: 'slab', plan, z, h, steps }])
}

function post (name: string, cx: number, cy: number, r: number, z: number, h: number, tone: Tone = 'mid', { extra = [], steps = 28, crease = 'faint' }: { extra?: Mark[], steps?: number, crease?: Tone | 'none' } = {}) {
  item(name, [solid(cylinderOf(cx, cy, r, z, h, P, steps), tone, { crease }), ...extra], [{ kind: 'cylinder', cx, cy, r, z, h }])
}

function turned (name: string, F: Frame, profile: [number, number][], tone: Tone = 'mid', extra: Mark[] = []) {
  item(name, [solid(G.solidOf(profile, F, P), tone), ...extra], [{ kind: 'turned', F, profile }])
}

function prism (name: string, F: Frame, poly: Plane[], s0: number, s1: number, tone: Tone = 'mid', { extra = [], lit, inner }: { extra?: Mark[], lit?: boolean, inner?: { d: string, tone: LineTone }[] } = {}) {
  item(name, [solid(G.prismOf(F, poly, s0, s1, P), tone, { lit, inner }), ...extra], [{ kind: 'prism', F, poly, s0, s1 }])
}

const screwsOn = (points: Point3[], size = 0.5, tone: Tone = 'mid') => dots(points.map(at), size, tone)
const cornerScrews = (plan: Plan, inset: number, z: number) => corners(plan, inset).map(([x, y]): Point3 => [x, y, z])
const byDepth = (points: Plane[]) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P))
// A closed rectangle on the face y = const, for slots, label holders and drawer outlines.
const faceRectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(p => at(p as Point3)), true)
// Rule lines on a face y = const that stand for print: free at both ends.
const printY = (y: number, x0: number, widths: number[], z0: number, gap: number) =>
  line(widths.map((w, row) => pathOf([at([x0, y, z0 - row * gap]), at([x0 + w, y, z0 - row * gap])])).join(''), 'lo', true)
// Knurl ribs on a round part along any axis: the ones turned well toward the viewer.
const knob = (F: Frame, length: number, r: number, count: number) =>
  line(G.ribsOf(F, 0, length, r, count, P, { fade: [0.05, 0.5] }).filter(rib => rib.alpha > 0.5).map(rib => rib.d).join(''), 'lo')

// --- Base -----------------------------------------------------------------------------------------------------------

slot('base')
item('stand.halo', [{ kind: 'halo', d: slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill }])
for (const [x, y] of byDepth(corners(BASE, 24))) {
  post('stand.foot', x, y, 7, -BASE_H - FOOT_H, 1.6, 'lo')
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
})
// Ruler strip along the front edge and the label plate, three rule lines standing for its print.
const STRIP: Plan = { x: -44, y: 56, w: 104, d: 5, r: 0.8 }
const ticks = topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y + STRIP.d, 0.6, [-1.8, -3.4], P)
block('stand.strip', STRIP, 0, 0.6, 'lo', { crease: 'none', bevel: 0, steps: 3, extra: [line(ticks.minor, 'lo'), line(ticks.major, 'mid')] })
const LABEL: Plan = { x: 88, y: 34, w: 28, d: 16, r: 1.2 }
block('stand.label', LABEL, 0, 0.8, 'lo', {
  crease: 'none',
  bevel: 0,
  steps: 3,
  extra: [
    line(planOutline(insetPlan(LABEL, 1.4), 0.8, P, 3), 'faint'),
    line([17, 11, 14].map((w, row) => lineOnTop([LABEL.x + 4, LABEL.y + 4.5 + row * 3.4], [LABEL.x + 4 + w, LABEL.y + 4.5 + row * 3.4], 0.8, P)).join(''), 'lo', true),
    screwsOn([[LABEL.x + LABEL.w - 2.6, LABEL.y + 2.6, 0.8], [LABEL.x + LABEL.w - 2.6, LABEL.y + LABEL.d - 2.6, 0.8]], 0.45),
  ],
})

// --- Comment board ----------------------------------------------------------------------------------------------------

const boardPost = (x: number, side: string) => {
  const footPlan: Plan = { x: x - 3, y: -88, w: 12, d: 16, r: 1.5 }
  block(`board.foot.${side}`, footPlan, 0, 3, 'mid', { bevel: 0.5, extra: [screwsOn([[x - 0.6, -85.6, 3], [x + 6.6, -85.6, 3], [x - 0.6, -74.4, 3], [x + 6.6, -74.4, 3]], 0.45)] })
  const plan: Plan = { x, y: -84, w: 6, d: 8, r: 1 }
  block(`board.post.${side}`, plan, 3, POST_TOP - 3, 'mid', { bevel: 0.4, inner: [{ d: sideSeam(plan, 12, P, 4), tone: 'faint' }], extra: [line(planOutline(insetPlan(plan, 1.2), POST_TOP, P, 4), 'faint'), screwsOn([[x + 3, -80, POST_TOP]], 0.5)] })
}
slot('board')
boardPost(POSTS[0], 'left')
// The cork face: a loose grid of pores, under the cards.
const PORES: Flat[] = []
for (let x = BOARD.x + 3; x < BOARD.x + BOARD.w - 2; x += 5) for (let z = BOARD_Z + 3; z < BOARD_TOP - 2; z += 5) PORES.push(at([x + ((z * 7) % 3) - 1, FACE, z]))
block('board.cork', BOARD, BOARD_Z, BOARD_TOP - BOARD_Z, 'mid', {
  bevel: 0.3,
  extra: [dots(PORES, 0.35, 'lo'), line(faceRectY(FACE, BOARD.x + 1.6, BOARD.x + BOARD.w - 1.6, BOARD_Z + 1.6, BOARD_TOP - 1.6), 'faint')],
})

// Pinned comment cards, each with three rule lines and a pin at its head.
const pin = (name: string, cx: number, z: number) =>
  turned(name, frameOf([cx, FACE + CARD_T, z], Y, Z), [[-1, 0.45], [0, 0.45], [0, 1.6], [1.2, 1.6], [2, 1.1]], 'hi', [line(G.circleOf(frameOf([cx, FACE + CARD_T, z], Y, Z), 2, 0.5, P, 12), 'lo')])
const card = (name: string, x: number, w: number, z: number, h: number) => {
  const plan: Plan = { x, y: FACE, w, d: CARD_T, r: 0.2 }
  block(name, plan, z, h, 'hi', { bevel: 0, steps: 2, crease: 'none', extra: [printY(FACE + CARD_T, x + 2, [w - 4, w - 6, w - 8].map(v => Math.max(4, v)), z + h - 5, 2.4)] })
}
const CARDS = [
  { x: -122, w: 16, z: 44, h: 12 },
  { x: -100, w: 16, z: 48, h: 12 },
  { x: -118, w: 16, z: 26, h: 12 },
]
for (const spec of CARDS) {
  card('board.card', spec.x, spec.w, spec.z, spec.h)
  pin('board.pin', spec.x + spec.w / 2, spec.z + spec.h - 2.5)
}

const BACK: Plan = { x: HOPPER.x, y: HOPPER.y, w: HOPPER.w, d: FACE - HOPPER.y, r: 0.6 }
block('board.slot.back', BACK, BOARD_TOP, HOPPER_TOP - BOARD_TOP, 'mid', {
  bevel: 0.5,
  inner: [{ d: sideSeam(BACK, BOARD_TOP + 2.4, P, 4), tone: 'faint' }],
  extra: [screwsOn([[BACK.x + 2, BACK.y + 2, HOPPER_TOP], [BACK.x + BACK.w - 2, BACK.y + 2, HOPPER_TOP]], 0.45)],
})

slot('card', 'card')
card('comment.card', NEW_CARD.x, NEW_CARD.w, NEW_CARD.z, NEW_CARD.h)
slot('pin', 'pin')
pin('comment.pin', NEW_CARD.x + NEW_CARD.w / 2, NEW_CARD.z + NEW_CARD.h - 2.5)

slot('board.front')
// The slot box is open where the card runs: a back block on the board's top, a low lip in front, two cheeks between.
const LIP: Plan = { x: HOPPER.x, y: FACE + MOUTH, w: HOPPER.w, d: HOPPER.y + HOPPER.d - FACE - MOUTH, r: 0.6 }
const LIP_TOP = BOARD_TOP + 4
block('board.slot.cheek', { x: HOPPER.x, y: FACE, w: 1, d: MOUTH, r: 0 }, BOARD_TOP, LIP_TOP - BOARD_TOP, 'mid', { bevel: 0, steps: 1, crease: 'none' })
block('board.slot.cheek', { x: HOPPER.x + HOPPER.w - 1, y: FACE, w: 1, d: MOUTH, r: 0 }, BOARD_TOP, LIP_TOP - BOARD_TOP, 'mid', { bevel: 0, steps: 1, crease: 'none' })
block('board.slot.lip', LIP, BOARD_TOP, LIP_TOP - BOARD_TOP, 'mid', {
  bevel: 0.4,
  inner: [{ d: sideSeam(LIP, BOARD_TOP + 1.6, P, 4), tone: 'faint' }],
  extra: [screwsOn([[LIP.x + 2, LIP.y + LIP.d / 2, LIP_TOP], [LIP.x + LIP.w - 2, LIP.y + LIP.d / 2, LIP_TOP]], 0.45)],
})
boardPost(POSTS[1], 'right')

// --- Rating balance ---------------------------------------------------------------------------------------------------

const RODS = [BAL_Y - ARM, BAL_Y + ARM]
const rod = (y: number) => block('scale.rod', { x: BAL_X - 0.4, y: y - 0.4, w: 0.8, d: 0.8, r: 0.2 }, PAN_Z + PAN_H, CAP_TOP - PAN_Z - PAN_H, 'mid', { bevel: 0, steps: 1, crease: 'none' })
const pan = (y: number) => post('scale.pan', BAL_X, y, 6.5, PAN_Z, PAN_H, 'mid', { steps: 40, extra: [line(ringOn(BAL_X, y, 5, PAN_Z + PAN_H, P, 32), 'faint')] })

slot('scale.base')
const BAL_FOOT: Plan = { x: BAL_X - 10, y: BAL_Y - 8, w: 20, d: 16, r: 2 }
block('scale.foot', BAL_FOOT, 0, 3, 'mid', { bevel: 0.5, extra: [screwsOn(cornerScrews(BAL_FOOT, 2.4, 3), 0.45)] })
slot('scale.back', 'panBack')
pan(RODS[0])
rod(RODS[0])
slot('scale.pillar')
post('scale.pillar', BAL_X, BAL_Y, 2.4, 3, CAP_TOP - 4 - 3, 'mid', { steps: 24, extra: [line(sideArc(BAL_X, BAL_Y, 2.4, 20, P, 16), 'faint')] })
const CAP: Plan = { x: BAL_X - 3, y: BAL_Y - 1, w: 6, d: 2, r: 0.4 }
block('scale.saddle', { x: BAL_X - 3, y: BAL_Y - 3, w: 6, d: 6, r: 0.8 }, CAP_TOP - 4, 2, 'mid', { bevel: 0.3 })
block('scale.knife', CAP, CAP_TOP - 2, 2, 'mid', { bevel: 0, steps: 2 })
slot('scale.front', 'panFront')
pan(RODS[1])
rod(RODS[1])
post('scale.weight', BAL_X + 3.6, RODS[1], 2.4, PAN_Z + PAN_H, 3.4, 'hi', { steps: 24, extra: [line(ringOn(BAL_X + 3.6, RODS[1], 1, PAN_Z + PAN_H + 3.4, P, 12), 'lo')] })
turning('beam', 'scale.beam')

// --- Ranking rack -----------------------------------------------------------------------------------------------------

slot('rack.base')
const RACK_BASE: Plan = { x: 30, y: -86, w: 74, d: 24, r: 2 }
block('rack.base', RACK_BASE, 0, 4, 'mid', { bevel: 0.6, inner: [{ d: sideSeam(RACK_BASE, 1.6, P, 4), tone: 'faint' }], extra: [screwsOn(cornerScrews(RACK_BASE, 2.6, 4), 0.45)] })

const rail = (cx: number) => {
  const plan: Plan = { x: cx - 1.2, y: -84, w: 2.4, d: 2.4, r: 0.4 }
  block('rack.rail', plan, 4, RAIL_TOP - 4, 'mid', { bevel: 0, steps: 2, crease: 'none' })
}
const bracket = (index: number) => {
  const cx = RAILS[index]
  const z = LEVELS[index]
  const plan: Plan = { x: cx - 6, y: -81.6, w: 12, d: 17, r: 0.8 }
  block('rack.bracket', plan, z, 2, 'mid', { bevel: 0.3, extra: [screwsOn([[cx - 3.6, -80.2, z + 2], [cx + 3.6, -80.2, z + 2]], 0.4)] })
  const book: Plan = { x: cx - 4.5, y: -80, w: 9, d: 14, r: 1 }
  const z0 = z + 2
  const top = z0 + BOOK_H[index]
  block('rack.book', book, z0, BOOK_H[index], 'hi', {
    bevel: 0.4,
    crease: 'lo',
    inner: [{ d: sideSeam(book, z0 + 3.4, P, 4) + sideSeam(book, top - 3.4, P, 4), tone: 'lo' }],
    extra: [line(planOutline(insetPlan(book, 1.2), top, P, 4), 'faint')],
  })
}
const RISE = 2
const FALL = 1
RAILS.forEach((cx, index) => {
  slot(`rack.rail.${index}`)
  rail(cx)
  slot(`rack.book.${index}`, index === RISE ? 'rise' : index === FALL ? 'fall' : 'still')
  bracket(index)
})

slot('rack.top')
const TOP_BAR: Plan = { x: 34, y: -86, w: 66, d: 6, r: 1 }
block('rack.bar', TOP_BAR, RAIL_TOP, 4, 'mid', { bevel: 0.5, extra: [screwsOn(RAILS.map((cx): Point3 => [cx, -82.8, RAIL_TOP + 4]), 0.45)] })
const SIDE: Plan = { x: 104, y: -86, w: 3, d: 24, r: 0.6 }
block('rack.side', SIDE, 0, 44, 'mid', { bevel: 0.4, extra: [screwsOn([[107, -83, 4], [107, -65, 4], [107, -83, 40], [107, -65, 40]], 0.45)] })
const PIVOT_F = frameOf([107, PIVOT[0], PIVOT[1]], X, Y)
turned('lever.boss', PIVOT_F, [[0, 3.2], [LEVER_X - 107, 3.2]], 'mid', [line(G.circleOf(PIVOT_F, LEVER_X - 107, 1.6, P, 16), 'faint')])
turning('lever', 'lever.bar')
slot('lever.knob', 'knob')
const KNOB_F = frameOf([LEVER_X + 2, PIVOT[0], PIVOT[1] + LEVER_LEN - 1.2], X, Y)
turned('lever.knob', KNOB_F, [[0, 1.2], [0.8, 1.2], [0.8, 2.4], [4, 2.4]], 'mid', [knob(frameOf([LEVER_X + 2.8, PIVOT[0], PIVOT[1] + LEVER_LEN - 1.2], X, Y), 3.2, 2.4, 18), line(G.circleOf(KNOB_F, 4, 0.9, P, 12), 'lo')])

// --- Character index cabinet ------------------------------------------------------------------------------------------

slot('cabinet')
block('index.case', CAB, 0, CAB_TOP, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(CAB, CAB_TOP - 2.4, P, 4), tone: 'faint' }],
  extra: [line(planOutline(insetPlan(CAB, 2.4), CAB_TOP, P, 4), 'faint'), screwsOn(cornerScrews(CAB, 4, CAB_TOP), 0.45)],
})
const FRONT_Y = CAB.y + CAB.d
for (const [z0, z1] of [[16, 27.5], [3, 14.5]]) {
  for (const x0 of [CAB.x + 2, CAB.x + 29]) {
    const plan: Plan = { x: x0, y: FRONT_Y, w: 25, d: 1.2, r: 0.5 }
    const y = FRONT_Y + 1.2
    const cx = x0 + 12.5
    block('index.drawer', plan, z0, z1 - z0, 'mid', {
      bevel: 0.3,
      steps: 2,
      extra: [line(faceRectY(y, cx - 6, cx + 6, z1 - 4.4, z1 - 1.4), 'lo'), printY(y, cx - 4.4, [8.8], z1 - 2.9, 0)],
    })
    block('index.pull', { x: cx - 4, y, w: 8, d: 1.6, r: 0.6 }, z0 + 3, 1.8, 'mid', { bevel: 0.2, steps: 2 })
  }
}
const DIAL: Plane = [CAB.x + CAB.w / 2, CAB.y + CAB.d / 2]
post('index.dial', DIAL[0], DIAL[1], 3.4, CAB_TOP, 3.2, 'mid', { steps: 32, extra: [line(knurl(DIAL[0], DIAL[1], 3.4, CAB_TOP, CAB_TOP + 3.2, 28, P), 'lo')] })
// The dial's pointer bar turns to look up a main character while the page is read.
turning('dial', 'index.pointer', 'hi')

// --- Lectern and the open book ----------------------------------------------------------------------------------------

slot('lectern')
const LECT_FOOT: Plan = { x: BOOK_X - 22, y: LEDGE_Y - 38, w: 44, d: 34, r: 3 }
block('lectern.foot', LECT_FOOT, 0, 3, 'mid', { bevel: 0.6, extra: [screwsOn(cornerScrews(LECT_FOOT, 3.6, 3), 0.45)] })
post('lectern.column', BOOK_X, LEDGE_Y - 21, 4.5, 3, 19, 'mid', { steps: 32, extra: [line(sideArc(BOOK_X, LEDGE_Y - 21, 4.5, 6, P, 24), 'faint')] })
block('lectern.head', { x: BOOK_X - 10, y: LEDGE_Y - 29, w: 20, d: 16, r: 1.2 }, 22, 4, 'mid', { bevel: 0.4 })
const DESK_F = frameOf([0, 0, 0], X, Y)
prism('lectern.desk', DESK_F, [[LEDGE_Y - 42, 26], [LEDGE_Y, 26], [LEDGE_Y, 30], [LEDGE_Y - 42, 43.6]], BOOK_X - 32, BOOK_X + 32, 'mid')

// The book: one case under both halves, two page blocks, the gutter between them. Frames run along x, u off the desk.
const BOOK_F = frameOf(onDesk(0, 0, 0), X, N)
const rect = (h0: number, h1: number, s0: number, s1: number): Plane[] => [[h0, s0], [h1, s0], [h1, s1], [h0, s1]]
prism('book.case', BOOK_F, rect(0, 1, 0.5, 39), BOOK_X - 26.5, BOOK_X + 26.5, 'mid')
const PRINT_S = [32, 28.6, 25.2, 21.8, 18.4, 15, 11.6, 8.2]
const printOn = (x0: number, x1: number) =>
  line(PRINT_S.map((s, row) => pathOf([at(onDesk(x0, s, BLOCK_TOP)), at(onDesk(x1 - (row % 3) * 3, s, BLOCK_TOP))])).join(''), 'faint', true)
prism('book.left', BOOK_F, rect(1, BLOCK_TOP, LEAF_S[0], LEAF_S[1]), BOOK_X - 25, BOOK_X - 1, 'hi', { extra: [printOn(BOOK_X - 22, BOOK_X - 4)] })
prism('book.gutter', BOOK_F, rect(1, BLOCK_TOP, LEAF_S[0], LEAF_S[1]), BOOK_X - 1, BOOK_X + 1, 'lo')
prism('book.right', BOOK_F, rect(1, BLOCK_TOP, LEAF_S[0], LEAF_S[1]), BOOK_X + 1, BOOK_X + 25, 'hi', { extra: [printOn(BOOK_X + 4, BOOK_X + 22)] })
turning('leaf', 'book.leaf', 'hi')

slot('lectern.front')
block('lectern.ledge', { x: BOOK_X - 32, y: LEDGE_Y, w: 64, d: 3, r: 0.4 }, 26, 7, 'mid', { bevel: 0.3, extra: [screwsOn([[BOOK_X - 26, LEDGE_Y + 3, 29.5], [BOOK_X + 26, LEDGE_Y + 3, 29.5]], 0.45)] })
// The bookmark ribbon: out of the gutter, over the ledge and down its face. The one lit part.
const RIBBON_X: [number, number] = [BOOK_X - 2.2, BOOK_X + 2.2]
const RIBBON_F = frameOf([0, 0, 0], Y, Z)
const ribbonTop: Plan = { x: RIBBON_X[0], y: LEDGE_Y - 1.4, w: 4.4, d: 4.9, r: 0.2 }
item('ribbon', [
  solid(slabOf(ribbonTop, 33, 0.4, P, 1), 'hi', { lit: true, crease: 'none' }),
  solid(G.prismOf(RIBBON_F, [[33.4, RIBBON_X[0]], [33.4, RIBBON_X[1]], [16, RIBBON_X[1]], [13, BOOK_X], [16, RIBBON_X[0]]], LEDGE_Y + 3.5, LEDGE_Y + 4, P), 'hi', { lit: true, crease: 'none' }),
], [
  { kind: 'slab', plan: ribbonTop, z: 33, h: 0.4, steps: 1 },
  { kind: 'prism', F: RIBBON_F, poly: [[33.4, RIBBON_X[0]], [33.4, RIBBON_X[1]], [16, RIBBON_X[1]], [13, BOOK_X], [16, RIBBON_X[0]]], s0: LEDGE_Y + 3.5, s1: LEDGE_Y + 4 },
])

// --- Turning parts, rebuilt from the pose -----------------------------------------------------------------------------

const rotate = (points: Plane[], angle: number, [pu, pv]: Plane = [0, 0]): Plane[] =>
  points.map(([u, v]) => [pu + u * Math.cos(angle) - v * Math.sin(angle), pv + u * Math.sin(angle) + v * Math.cos(angle)])

// Each turning part as one prism: its frame, polygon and span along the frame's axis.
export function turnShapes (pose: DeskPose): Record<Turning, Extract<Shape, { kind: 'prism' }>> {
  const leafAngle = Math.PI * pose.leaf
  const tip = TIP * pose.tip
  const lever = LEVER_REST + LEVER_SWING * pose.lever
  const dial = DIAL_REST + DIAL_SWING * pose.leaf
  return {
    // The leaf turns about the gutter, from the right block (u > 0) to the left one.
    leaf: { kind: 'prism', F: frameOf(onDesk(BOOK_X, 0, LEAF_H), T, X), poly: rotate([[-0.2, -0.2], [LEAF_W, -0.2], [LEAF_W, 0.2], [-0.2, 0.2]], leafAngle), s0: LEAF_S[0], s1: LEAF_S[1] },
    // The beam rocks on the knife edge; its underside passes through the pivot, the front end dips as it tips.
    beam: { kind: 'prism', F: frameOf([0, BAL_Y, CAP_TOP], X, Y), poly: rotate([[-BEAM_HALF, 0], [BEAM_HALF, 0], [BEAM_HALF, 2.4], [-BEAM_HALF, 2.4]], -tip), s0: BAL_X - 1.2, s1: BAL_X + 1.2 },
    // The lever swings about its boss: 0 is upright, positive leans toward the front.
    lever: { kind: 'prism', F: frameOf([0, PIVOT[0], PIVOT[1]], X, Y), poly: rotate([[-1.2, -2.4], [1.2, -2.4], [1.2, LEVER_LEN], [-1.2, LEVER_LEN]], -lever), s0: LEVER_X, s1: LEVER_X + 2 },
    // The pointer bar lies on the dial's top and turns about its axis.
    dial: { kind: 'prism', F: frameOf([DIAL[0], DIAL[1], 0], Z, X), poly: rotate([[-0.6, -0.5], [2.8, -0.5], [2.8, 0.5], [-0.6, 0.5]], dial), s0: CAB_TOP + 3.2, s1: CAB_TOP + 3.9 },
  }
}

export function turnPaths (pose: DeskPose): Record<Turning, SolidPaths> {
  const shapes = turnShapes(pose)
  const paths = (key: Turning) => G.prismOf(shapes[key].F, shapes[key].poly, shapes[key].s0, shapes[key].s1, P)
  return { leaf: paths('leaf'), beam: paths('beam'), lever: paths('lever'), dial: paths('dial') }
}

// --- Moves ------------------------------------------------------------------------------------------------------------

// World offsets of the moving slots for a pose.
export function offsetsOf (pose: DeskPose): Record<Exclude<Move, 'still'>, Point3> {
  const card: Point3 = [0, 0, (1 - pose.drop) * DROP]
  const tan = Math.tan(TIP * pose.tip)
  const lever = LEVER_REST + LEVER_SWING * pose.lever
  const reach = LEVER_LEN - 1.2
  return {
    card,
    pin: [0, (1 - pose.pin) * PIN_OUT, card[2]],
    rise: [0, 0, PITCH * pose.rank],
    fall: [0, 0, -PITCH * pose.rank],
    panBack: [0, 0, ARM * tan],
    panFront: [0, 0, -ARM * tan],
    knob: [0, reach * Math.sin(lever), reach * Math.cos(lever) - reach],
  }
}

export function movesOf (pose: DeskPose): Record<Exclude<Move, 'still'>, string> {
  const offsets = offsetsOf(pose)
  const out = {} as Record<Exclude<Move, 'still'>, string>
  for (const key of Object.keys(offsets) as Exclude<Move, 'still'>[]) out[key] = translateAlong(P, offsets[key])
  return out
}

export const PARTS = SLOTS
export const PROJECTION = P
