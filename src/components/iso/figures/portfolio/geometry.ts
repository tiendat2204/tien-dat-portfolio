/*
  The drafting plotter, built once from the kit. World units are about 1 px, x runs along the rails, y across them,
  z up. Every drawn item carries the true shapes of what it draws (for the audit beside this file) and sits in a slot
  of the painter's order. A slot either stays still or moves with the gantry (x), the pen head (x, y) or the pen (x, y,
  lift); moving parts are built at their rest position and moved with a transform, so nothing is rebuilt per frame
  except the line the pen is laying.
*/
import {
  corners,
  cylinder as cylinderOf,
  depthOf,
  extrude,
  fitProjection,
  insetPlan,
  iso,
  knurl,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  radialTicks,
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
import * as tubeModule from '@/components/iso/kit/tube.mjs'
import { LIFT, NUDGE, PARK, SHEET, STROKES, type Floor } from '@/components/iso/figures/portfolio/model'

export const WIDTH = 600
export const HEIGHT = 390
const AZIMUTH = 50
const ELEVATION = 40

// --- World layout -------------------------------------------------------------------------------------------------

const BASE: Plan = { x: -160, y: -104, w: 320, d: 208, r: 9 }
const BASE_H = 12
const FOOT_H = 5

const RAIL_BASE_H = 10
const RAIL_BASES: Plan[] = [
  { x: -148, y: -96, w: 296, d: 20, r: 2 },
  { x: -148, y: 76, w: 296, d: 20, r: 2 },
]
const RAIL_Z = RAIL_BASE_H
const RAIL_TOP = RAIL_Z + 6
const RAIL_Y = [-86, 86]
const END_TOP = 24
const END_W = 12

const BED: Plan = { x: -114, y: -70, w: 228, d: 140, r: 4 }
const BED_TOP = 8
export const PAPER_TOP = BED_TOP + 0.6

// Gantry, built with its centre line at x = 0.
const TRUCK_H = 7
const TRUCK_TOP = RAIL_TOP + TRUCK_H
const BEAM_Z = 44
const BEAM_TOP = 52
const BELT_Z = 38
const BELT_H = 3
const HUB_R = 2.6
const BELT_T = 0.8
const PULLEY_Y = 85.4
const PULLEY_X = 142
const DRIVE_Y = PULLEY_Y + HUB_R + BELT_T / 2
const RETURN_Y = PULLEY_Y - HUB_R - BELT_T / 2

// Pen head, built at y = 0 on the gantry. The pen's axis sits PEN_X in front of the beam's centre line.
export const PEN_X = 17
const SCREW_X = -3.5
const SCREW_Z = 57.5
const SCREW_R = 1.5
const HEAD_TOP = 62

// Travel the audit and the camera have to cover.
const PEN_XS = STROKES.flat().map(([x]) => x)
export const GANTRY_MIN = Math.min(PARK[0], ...PEN_XS) - PEN_X - NUDGE
export const GANTRY_MAX = Math.max(PARK[0], ...PEN_XS) - PEN_X + NUDGE
const PEN_YS = STROKES.flat().map(([, y]) => y)
export const HEAD_MIN = Math.min(PARK[1], ...PEN_YS)
export const HEAD_MAX = Math.max(PARK[1], ...PEN_YS)

const box = ({ x, y, w, d }: Plan, z0: number, z1: number): Point3[] =>
  [x, x + w].flatMap(px => [y, y + d].flatMap(py => [z0, z1].map((pz): Point3 => [px, py, pz])))

// Fit the base and everything the gantry can reach: its beam ends and Y motor, and the head's solenoid over its travel.
export const P: Projection = fitProjection(
  [
    ...box(BASE, -BASE_H - FOOT_H, 0),
    ...box({ x: GANTRY_MIN - 11, y: -90, w: GANTRY_MAX - GANTRY_MIN + 22, d: 180, r: 0 }, 0, BEAM_TOP + 11.5),
    ...box({ x: GANTRY_MIN - 1, y: HEAD_MIN - 10, w: GANTRY_MAX - GANTRY_MIN + 11, d: HEAD_MAX - HEAD_MIN + 20, r: 0 }, 0, HEAD_TOP + 7.4),
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: AZIMUTH, elevation: ELEVATION }
)

// --- The round-part and tube modules of the kit are plain JS; these are the slices of them this figure uses. ----------

export type Frame = { o: Point3, a: Point3, u: Point3, v: Point3 }

type Piece = { mid: Point3, body: string, shine: string, shade: string, edges: string, wide: boolean, points: Point3[], radii: number[] }

const G = latheModule as unknown as {
  scaleOf (P: Projection): number
  viewOf (P: Projection): Point3
  frameAlong (o: Point3, a: Point3): Frame
  solidOf (profile: [number, number][], F: Frame, P: Projection): SolidPaths
  arcOf (F: Frame, s: number, r: number, P: Projection, options?: { steps?: number }): string
  circleOf (F: Frame, s: number, r: number, P: Projection, steps?: number): string
  ribsOf (F: Frame, s0: number, s1: number, r: number, count: number, P: Projection, options: { fade: [number, number] }): { d: string, alpha: number }[]
  fillet (points: Point3[], radius: number, perArc: number, options: { P: Projection, tube: number }): Point3[]
  pathLength (points: Point3[]): number
  tangentAlong (points: Point3[], at: number): Point3
  add3 (a: Point3, b: Point3): Point3
  mul3 (a: Point3, k: number): Point3
  dot3 (a: Point3, b: Point3): number
}
const tubePieces = tubeModule.tubePieces as unknown as (points: Point3[], radius: number, P: Projection, options: { maxLength: number, spacing: number, gaps: [number, number][] }) => Piece[]

const at = (point: Point3) => iso(point, P)
const KS = G.scaleOf(P)

// --- What an item draws and what it is ------------------------------------------------------------------------------

export type Shape =
  | { kind: 'slab', plan: Plan, z: number, h: number, steps: number }
  | { kind: 'extruded', ring: Plane[], z: number, h: number }
  | { kind: 'cylinder', cx: number, cy: number, r: number, z: number, h: number }
  | { kind: 'turned', F: Frame, profile: [number, number][] }
  | { kind: 'ball', c: Point3, r: number }
  | { kind: 'tube', points: Point3[], radii: number[] }

export type Mark =
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', lit?: boolean, flat?: boolean, className?: string, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }
  | { kind: 'tube', body: string, shine: string, shade: string, edges: string, wide: boolean, tone: Tone }

export type Meta = { owner?: string, ground?: boolean, limp?: boolean, anchor?: boolean }

export type Item = { name: string, marks: Mark[], shapes: (Shape & { meta?: Meta })[] }

export type Route = { name: string, points: Point3[], r: number, gaps: [number, number][], rims: [number, number], move: Move }

export type Move = 'still' | 'gantry' | 'head' | 'pen'

export type Slot = { key: string, move: Move, items: Item[] }

export type InkSlot = { key: 'ink', move: 'ink' }

const SLOTS: (Slot | InkSlot)[] = []
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
const cylShape = (cx: number, cy: number, r: number, z: number, h: number, meta?: Meta) => ({ kind: 'cylinder' as const, cx, cy, r, z, h, meta })

// A rounded block: the commonest part. `extra` adds screws, grooves and seams drawn on it.
function block (name: string, plan: Plan, z: number, h: number, tone: Tone = 'mid', { steps = 4, bevel = 0.6, extra = [], inner, crease = 'faint', meta, lit }: { steps?: number, bevel?: number, extra?: Mark[], inner?: { d: string, tone: LineTone }[], crease?: Tone | 'none', meta?: Meta, lit?: boolean } = {}) {
  item(name, [solid(slabOf(plan, z, h, P, steps, bevel), tone, { inner, crease, lit }), ...extra], [slabShape(plan, z, h, steps, meta)])
}

function post (name: string, cx: number, cy: number, r: number, z: number, h: number, tone: Tone = 'mid', { extra = [], steps = 28, crease = 'faint', lit, meta }: { extra?: Mark[], steps?: number, crease?: Tone | 'none', lit?: boolean, meta?: Meta } = {}) {
  item(name, [solid(cylinderOf(cx, cy, r, z, h, P, steps), tone, { crease, lit }), ...extra], [cylShape(cx, cy, r, z, h, meta)])
}

// A turned part on any axis: `profile` is [s, r] from one end to the other, closed to the axis at both ends.
function turned (name: string, F: Frame, profile: [number, number][], tone: Tone = 'mid', { extra = [], lit, inner, meta }: { extra?: Mark[], lit?: boolean, inner?: { d: string, tone: LineTone }[], meta?: Meta } = {}) {
  const paths = G.solidOf(profile, F, P)
  item(name, [solid(paths, tone, { lit, inner }), ...extra], [{ kind: 'turned', F, profile, meta }])
}

const along = (o: Point3, a: Point3) => G.frameAlong(o, a)
const up = (x: number, y: number, z: number) => along([x, y, z], [0, 0, 1])

const screwsOn = (points: Point3[], size = 0.5, tone: Tone = 'mid') => dots(points.map(at), size, tone)
const cornerScrews = (plan: Plan, inset: number, z: number) => corners(plan, inset).map(([x, y]): Point3 => [x, y, z])

// Points of a rectangle on the vertical face x = const (yz plane) or y = const (xz plane), for slots and plates on faces.
const faceRectX = (x: number, y0: number, y1: number, z0: number, z1: number) => pathOf([[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]].map(p => at(p as Point3)), true)
const faceRectY = (y: number, x0: number, x1: number, z0: number, z1: number) => pathOf([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]].map(p => at(p as Point3)), true)

const byDepth = (points: Plane[]) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P))

// A cable from tube.mjs: chunks and the connector shell at each end as items, painted far to near.
function cable (name: string, points: Point3[], r: number, move: Move = 'still') {
  const route = G.fillet(points, Math.max(3, r * 2.6), 10, { P, tube: r })
  const total = G.pathLength(route)
  const SHELL = Math.max(1.6, r * 2.4)
  const gaps: [number, number][] = [[0, SHELL], [total - SHELL, total]]
  ROUTES.push({ name, points: route, r, gaps, rims: [r * 1.9, r * 1.9], move })
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

// Helpers for the parts that repeat.
const [BACK_BASE, FRONT_BASE] = RAIL_BASES
// A rubber bumper on an end block's inner face, at truck height, where the gantry would stop.
const bumper = (side: -1 | 1, plan: Plan) => {
  const face = side < 0 ? plan.x + END_W : plan.x + plan.w - END_W
  const F = along([face, plan.y < 0 ? RAIL_Y[0] : RAIL_Y[1], RAIL_TOP + TRUCK_H / 2], [-side, 0, 0])
  turned(`rails.bumper.${side < 0 ? 'left' : 'right'}.${plan.y < 0 ? 'back' : 'front'}`, F, [[0, 2.4], [1.6, 2.4], [2.2, 1.8]], 'lo', { extra: [line(G.circleOf(F, 2.2, 0.8, P, 12), 'faint')] })
}
// An end block; the right one's bumper faces away from the viewer, so it goes first. The left bumper is drawn after
// the rail that ends under it.
const endBlock = (side: -1 | 1, plan: Plan) => {
  const x = side < 0 ? plan.x : plan.x + plan.w - END_W
  const blockPlan: Plan = { x, y: plan.y, w: END_W, d: plan.d, r: 1.6 }
  if (side > 0) bumper(side, plan)
  block(`rails.end.${side < 0 ? 'left' : 'right'}.${plan.y < 0 ? 'back' : 'front'}`, blockPlan, RAIL_BASE_H, END_TOP - RAIL_BASE_H, 'mid', {
    bevel: 0.8,
    inner: [{ d: sideSeam(blockPlan, RAIL_BASE_H + 4, P, 4), tone: 'faint' }],
    extra: [screwsOn([[x + END_W / 2, plan.y + 3.5, END_TOP], [x + END_W / 2, plan.y + plan.d - 3.5, END_TOP]], 0.5)],
  })
}
const railPlan = (y: number): Plan => ({ x: -136, y: y - 3, w: 272, d: 6, r: 1.2 })
const rail = (side: 'back' | 'front') => {
  const y = side === 'back' ? RAIL_Y[0] : RAIL_Y[1]
  block(`rails.${side}.rail`, railPlan(y), RAIL_Z, RAIL_TOP - RAIL_Z, 'mid', { bevel: 0.5, extra: [screwsOn([-112, -56, 0, 56, 112].map((x): Point3 => [x, y, RAIL_TOP]), 0.4, 'lo')] })
}

// Pulleys: flange, toothed hub, flange. The belt is split where it wraps a hub, so each piece is wholly in front of
// or behind it.
const pulley = (name: string, x: number, part: 'low' | 'hub' | 'high') => {
  if (part === 'low') post(`${name}.flange.low`, x, PULLEY_Y, HUB_R + 1, BELT_Z - 0.6, 0.6, 'mid', { steps: 28 })
  if (part === 'hub') post(`${name}.hub`, x, PULLEY_Y, HUB_R, BELT_Z, BELT_H, 'mid', { steps: 28, crease: 'none' })
  if (part === 'high') {
    post(`${name}.flange.high`, x, PULLEY_Y, HUB_R + 1, BELT_Z + BELT_H, 0.6, 'mid', {
      steps: 28,
      extra: [line(ringOn(x, PULLEY_Y, 0.9, BELT_Z + BELT_H + 0.6, P, 12), 'lo'), dots([at([x + 1.9, PULLEY_Y, BELT_Z + BELT_H + 0.6])], 0.4, 'mid')],
    })
  }
}
const VIEW_ANGLE = AZIMUTH * Math.PI / 180
// The angle (0 along +x) where a vertical hub's visible half begins, going round toward +y.
const LIMB = VIEW_ANGLE - Math.PI / 2
// The belt round a hub, from angle a0 to a1, as a solid annulus piece.
const wrap = (name: string, cx: number, a0: number, a1: number) => {
  const steps = 14
  const arc = (r: number, from: number, to: number) => Array.from({ length: steps + 1 }, (_, index): Plane => {
    const t = from + ((to - from) * index) / steps
    return [cx + r * Math.cos(t), PULLEY_Y + r * Math.sin(t)]
  })
  const ringPoints = [...arc(HUB_R + BELT_T, a0, a1), ...arc(HUB_R, a1, a0)]
  item(name, [solid(extrude(ringPoints, BELT_Z, BELT_H, P, { convex: false }), 'lo', { crease: 'none' })], [{ kind: 'extruded', ring: ringPoints, z: BELT_Z, h: BELT_H }])
}
const run = (name: string, y: number, x0: number, x1: number) =>
  block(name, { x: x0, y: y - BELT_T / 2, w: x1 - x0, d: BELT_T, r: 0.1 }, BELT_Z, BELT_H, 'lo', { bevel: 0, steps: 1, crease: 'none' })

// The power entry at the back left corner, its lead to the control box, and the X motor's lead along the left edge.
const INLET: Plan = { x: -159, y: -84, w: 9, d: 10, r: 1.2 }
const BOX: Plan = { x: -152, y: -62, w: 28, d: 34, r: 2 }
const BOX_Z = 2
const BOX_TOP = BOX_Z + 13
const MOTOR: Plan = { x: -PULLEY_X - 6, y: PULLEY_Y - 6, w: 12, d: 12, r: 2.4 }
const MOTOR_BODY = insetPlan(MOTOR, 0.5)
const LANE = 1.25
block('power.inlet', INLET, 0, 7, 'mid', { extra: [line(faceRectY(INLET.y + INLET.d, INLET.x + 2, INLET.x + 7, 2, 5.4), 'lo'), screwsOn([[INLET.x + 4.5, INLET.y + 2, 7]], 0.45)] })
cable('cable.power', [[BOX.x, -56, 5.5], [-155.5, -56, 5.5], [-155.5, INLET.y + INLET.d, 5.5]], 0.75)
cable('cable.xmotor', [[MOTOR_BODY.x - 2, PULLEY_Y, END_TOP + 5.6], [-155, PULLEY_Y, END_TOP + 5.6], [-155, PULLEY_Y, LANE], [-155, -12, LANE], [-155, -40, 5], [BOX.x - 8, -45, 5], [BOX.x, -45, 5]], 0.8)
block('xmotor.plug', { x: MOTOR_BODY.x - 2, y: PULLEY_Y - 2.5, w: 2, d: 5, r: 0.5 }, END_TOP + 3.6, 4, 'mid', { bevel: 0, steps: 2 })

// Rail bases, the back end blocks and the back rail, with a ruler strip inside it.
block('rails.back.base', BACK_BASE, 0, RAIL_BASE_H, 'mid', { extra: [screwsOn([-120, -60, 0, 60, 120].map((x): Point3 => [x, BACK_BASE.y + 3, RAIL_BASE_H]), 0.45)] })
endBlock(-1, BACK_BASE)
rail('back')
bumper(-1, BACK_BASE)
const BACK_STRIP: Plan = { x: -128, y: -81.5, w: 256, d: 4.6, r: 0.8 }
const backTicks = topTicks(BACK_STRIP.x + 4, BACK_STRIP.x + BACK_STRIP.w - 4, 4, 5, BACK_STRIP.y, RAIL_BASE_H + 0.6, [1.6, 3], P)
block('rails.back.strip', BACK_STRIP, RAIL_BASE_H, 0.6, 'lo', { crease: 'none', bevel: 0, steps: 3, extra: [line(backTicks.minor, 'lo'), line(backTicks.major, 'mid')] })
endBlock(1, BACK_BASE)

// The control box on the left: case with vents, a dial and knob, a toggle and a lamp on the lid.
for (const [x, y] of byDepth(corners(BOX, 4))) post('box.foot', x, y, 2, 0, BOX_Z, 'lo', { steps: 16 })
const BOX_VENTS = [0, 1, 2, 3].map(index => {
  const y = BOX.y + 7 + index * 5
  return pathOf([[BOX.x + BOX.w, y, 5], [BOX.x + BOX.w, y + 2.4, 5], [BOX.x + BOX.w, y + 2.4, 10], [BOX.x + BOX.w, y, 10]].map(p => at(p as Point3)), true)
}).join('')
block('box.case', BOX, BOX_Z, BOX_TOP - BOX_Z, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(BOX, BOX_TOP - 2.6, P, 4), tone: 'faint' }],
  extra: [
    line(BOX_VENTS, 'lo'),
    line(planOutline(insetPlan(BOX, 2.2), BOX_TOP, P, 4), 'faint'),
    screwsOn(cornerScrews(BOX, 3.6, BOX_TOP), 0.45),
  ],
})
const DIAL: Plane = [BOX.x + 10, BOX.y + 20]
const dialTicks = radialTicks(DIAL[0], DIAL[1], 7.2, 24, 6, BOX_TOP + 0.4, [1, 1.8], P, -2.4, 4.8)
post('box.dial', DIAL[0], DIAL[1], 7.4, BOX_TOP, 0.4, 'lo', { crease: 'none', steps: 40, extra: [line(dialTicks.minor, 'lo'), line(dialTicks.major, 'mid')] })
post('box.knob', DIAL[0], DIAL[1], 3.4, BOX_TOP + 0.4, 4, 'mid', {
  steps: 32,
  extra: [line(knurl(DIAL[0], DIAL[1], 3.4, BOX_TOP + 0.4, BOX_TOP + 4.4, 28, P), 'lo'), line(lineOnTop([DIAL[0], DIAL[1]], [DIAL[0] + 2.4, DIAL[1] - 2.4], BOX_TOP + 4.4, P), 'hi')],
})
post('box.toggle.bezel', BOX.x + 21, BOX.y + 9, 2.2, BOX_TOP, 1, 'mid', { steps: 20 })
turned('box.toggle.lever', along([BOX.x + 21, BOX.y + 9, BOX_TOP + 1], [0.4, 0, 1]), [[0, 0.8], [3.6, 0.55]], 'mid')
post('box.lamp', BOX.x + 21, BOX.y + 26, 1.4, BOX_TOP, 0.8, 'mid', { steps: 16, extra: [dots([at([BOX.x + 21, BOX.y + 26, BOX_TOP + 0.8])], 0.6, 'hi')] })

// Label plate in front of the box, three rule lines that stand for its print.
const LABEL: Plan = { x: -150, y: 30, w: 26, d: 16, r: 1.2 }
block('stand.label', LABEL, 0, 0.8, 'lo', {
  crease: 'none',
  bevel: 0,
  steps: 3,
  extra: [
    line(planOutline(insetPlan(LABEL, 1.4), 0.8, P, 3), 'faint'),
    line([16, 11, 14].map((w, row) => lineOnTop([LABEL.x + 4, LABEL.y + 4.5 + row * 3.4], [LABEL.x + 4 + w, LABEL.y + 4.5 + row * 3.4], 0.8, P)).join(''), 'lo', true),
    screwsOn([[LABEL.x + LABEL.w - 2.6, LABEL.y + 2.6, 0.8], [LABEL.x + LABEL.w - 2.6, LABEL.y + LABEL.d - 2.6, 0.8]], 0.45),
  ],
})

// --- Bed and sheet --------------------------------------------------------------------------------------------------

block('bed.table', BED, 0, BED_TOP, 'mid', {
  steps: 6,
  bevel: 1.2,
  inner: [{ d: sideSeam(BED, 3, P, 6), tone: 'faint' }],
  extra: [line(planOutline(insetPlan(BED, 4), BED_TOP, P, 6), 'faint'), screwsOn(cornerScrews(BED, 8, BED_TOP), 0.5)],
})
const SHEET_PLAN: Plan = { ...SHEET, r: 0.6 }
item('sheet', [solid(slabOf(SHEET_PLAN, BED_TOP, 0.6, P, 2), 'hi', { crease: 'none', className: 'plotter-sheet' }), line(planOutline(insetPlan(SHEET_PLAN, 5), PAPER_TOP, P, 2), 'faint')], [slabShape(SHEET_PLAN, BED_TOP, 0.6, 2)])

// Two clamps hold the sheet's far corners, each with a knurled thumb screw.
for (const side of [-1, 1] as const) {
  const plan: Plan = { x: side < 0 ? SHEET.x - 6 : SHEET.x + SHEET.w - 8, y: SHEET.y - 5, w: 14, d: 9, r: 1.5 }
  block(`sheet.clamp.${side}`, plan, PAPER_TOP, 2.6, 'mid', { bevel: 0.5 })
  const cx = plan.x + plan.w / 2
  const cy = plan.y + plan.d / 2
  post(`sheet.clamp.${side}.knob`, cx, cy, 2.6, PAPER_TOP + 2.6, 3, 'mid', { steps: 24, extra: [line(knurl(cx, cy, 2.6, PAPER_TOP + 2.6, PAPER_TOP + 5.6, 20, P), 'lo'), line(ringOn(cx, cy, 1, PAPER_TOP + 5.6, P, 12), 'lo')] })
}

SLOTS.push({ key: 'ink', move: 'ink' })

slot('front', 'still')
for (const side of [-1, 1] as const) {
  const [x, y] = [side * 75, SHEET.y + SHEET.d - 5]
  post(`sheet.magnet.${side}`, x, y, 3, PAPER_TOP, 1.4, 'mid', { steps: 28, extra: [line(ringOn(x, y, 1.6, PAPER_TOP + 1.4, P, 16), 'faint')] })
}

// Spare sheets right of the bed, held flat by a knurled weight.
const STACK: Plan = { x: 121, y: -66, w: 30, d: 40, r: 0.6 }
for (let index = 0; index < 3; index++) {
  const plan: Plan = { ...STACK, x: STACK.x + [0, 1.2, 0.4][index], y: STACK.y + [0, -0.8, 0.6][index] }
  block('stack.sheet', plan, index * 0.5, 0.5, 'hi', { bevel: 0, steps: 2, crease: 'none' })
}
const WEIGHT: Plane = [STACK.x + 18, STACK.y + 22]
post('stack.weight', WEIGHT[0], WEIGHT[1], 5, 1.5, 5, 'mid', { steps: 40, extra: [line(knurl(WEIGHT[0], WEIGHT[1], 5, 2.5, 5.5, 40, P), 'lo'), line(sideArc(WEIGHT[0], WEIGHT[1], 5, 2.5, P, 32) + sideArc(WEIGHT[0], WEIGHT[1], 5, 5.5, P, 32), 'faint')] })
post('stack.weight.knob', WEIGHT[0], WEIGHT[1], 1.8, 6.5, 2.6, 'mid', { steps: 20, extra: [line(ringOn(WEIGHT[0], WEIGHT[1], 0.8, 9.1, P, 12), 'lo')] })

// The pen rack right of the bed: four bores, three pens standing capped, the fourth bore empty.
const RACK: Plan = { x: 122, y: -2, w: 20, d: 52, r: 3 }
const BORES = [8, 20, 32, 44].map((dy): Plane => [RACK.x + RACK.w / 2, RACK.y + dy])
block('rack.block', RACK, 0, 9, 'mid', {
  bevel: 0.8,
  inner: [{ d: sideSeam(RACK, 3, P, 4), tone: 'faint' }],
  extra: [line(BORES.map(([x, y]) => ringOn(x, y, 2.9, 9, P, 24)).join(''), 'lo'), dots([at([BORES[3][0], BORES[3][1], 9])], 1.4, 'lo'), screwsOn([[RACK.x + 3, RACK.y + 3, 9], [RACK.x + RACK.w - 3, RACK.y + RACK.d - 3, 9]], 0.45)],
})
for (const [x, y] of byDepth(BORES.slice(0, 3))) {
  post('rack.pen.body', x, y, 1.9, 9, 18, 'hi', { steps: 24, extra: [line(sideArc(x, y, 1.9, 13, P, 16), 'lo')] })
  post('rack.pen.cap', x, y, 2.2, 27, 5, 'hi', { steps: 24, extra: [line(ringOn(x, y, 1, 32, P, 12), 'lo')] })
  block('rack.pen.clip', { x: x + 2.2, y: y - 0.5, w: 0.6, d: 1, r: 0.2 }, 27.5, 4, 'mid', { bevel: 0, steps: 1, crease: 'none' })
}

// --- Front rail with its ruler, the X motor and the right idler ----------------------------------------------------

block('rails.front.base', FRONT_BASE, 0, RAIL_BASE_H, 'mid', { extra: [screwsOn([-120, -60, 0, 60, 120].map((x): Point3 => [x, FRONT_BASE.y + FRONT_BASE.d - 2.2, RAIL_BASE_H]), 0.45)] })
const FRONT_STRIP: Plan = { x: -128, y: 90.6, w: 256, d: 4.8, r: 0.8 }
const frontTicks = topTicks(FRONT_STRIP.x + 4, FRONT_STRIP.x + FRONT_STRIP.w - 4, 4, 5, FRONT_STRIP.y, RAIL_BASE_H + 0.6, [1.8, 3.4], P)
block('rails.front.strip', FRONT_STRIP, RAIL_BASE_H, 0.6, 'lo', {
  crease: 'none',
  bevel: 0,
  steps: 3,
  extra: [line(frontTicks.minor, 'lo'), line(frontTicks.major, 'mid'), line(onTop([[0, FRONT_STRIP.y], [0, FRONT_STRIP.y + FRONT_STRIP.d]], RAIL_BASE_H + 0.6, P), 'hi')],
})
endBlock(-1, FRONT_BASE)

// The X stepper stands on the front left end block, shaft up, its pulley at belt height.
block('xmotor.cap.low', MOTOR, END_TOP, 2.4, 'mid', { bevel: 0.4 })
block('xmotor.body', MOTOR_BODY, END_TOP + 2.4, 7.4, 'mid', {
  bevel: 0,
  inner: [{ d: sideSeam(MOTOR_BODY, END_TOP + 5, P, 4) + sideSeam(MOTOR_BODY, END_TOP + 7.2, P, 4), tone: 'faint' }],
})
block('xmotor.cap.high', MOTOR, END_TOP + 9.8, 2.4, 'mid', { bevel: 0.4, extra: [screwsOn(cornerScrews(MOTOR, 1.8, END_TOP + 12.2), 0.45)] })
const MOTOR_TOP = END_TOP + 12.2
post('xmotor.boss', -PULLEY_X, PULLEY_Y, 2.4, MOTOR_TOP, 0.6, 'mid', { steps: 24 })
post('xmotor.shaft', -PULLEY_X, PULLEY_Y, 0.9, MOTOR_TOP + 0.6, BELT_Z - 0.6 - MOTOR_TOP - 0.6, 'mid', { steps: 16 })
pulley('xpulley', -PULLEY_X, 'low')
wrap('belt.wrap.left.back', -PULLEY_X, LIMB + Math.PI, Math.PI * 1.5)

rail('front')
bumper(-1, FRONT_BASE)
endBlock(1, FRONT_BASE)
const IDLER_POST_TOP = BELT_Z - 0.6
post('idler.post', PULLEY_X, PULLEY_Y, 2.4, END_TOP, IDLER_POST_TOP - END_TOP, 'mid', { steps: 24, extra: [line(sideArc(PULLEY_X, PULLEY_Y, 2.4, END_TOP + 3, P, 20), 'faint')] })
pulley('idler', PULLEY_X, 'low')

// --- Gantry: two trucks on the rails, two side plates, the beam ---------------------------------------------------

const truck = (side: 'back' | 'front') => {
  const y = side === 'back' ? RAIL_Y[0] : RAIL_Y[1]
  const plan: Plan = { x: -11, y: y - 8, w: 22, d: 16, r: 2 }
  const wiper = (end: -1 | 1) => block(`gantry.${side}.wiper`, { x: end < 0 ? -12 : 11, y: y - 7, w: 1, d: 14, r: 0.4 }, RAIL_TOP + 0.4, TRUCK_H - 1, 'lo', { bevel: 0, steps: 2 })
  wiper(-1)
  block(`gantry.${side}.truck`, plan, RAIL_TOP, TRUCK_H, 'mid', {
    bevel: 0.6,
    inner: [{ d: sideSeam(plan, RAIL_TOP + 2, P, 4), tone: 'faint' }],
    extra: [screwsOn(cornerScrews(plan, 2.6, TRUCK_TOP), 0.45)],
  })
  wiper(1)
  post(`gantry.${side}.nipple`, -8, y + (side === 'back' ? -5.5 : 5.5), 0.7, TRUCK_TOP, 1.6, 'mid', { steps: 12 })
}
const PLATE_W = 18
const sidePlate = (side: 'back' | 'front') => {
  const y0 = side === 'back' ? -88 : 84
  const plan: Plan = { x: -PLATE_W / 2, y: y0, w: PLATE_W, d: 4, r: 0.8 }
  block(`gantry.${side}.plate`, plan, TRUCK_TOP, BEAM_Z - TRUCK_TOP, 'mid', {
    bevel: 0.5,
    extra: [
      line(faceRectY(y0 + 4, -5, 5, TRUCK_TOP + 4, TRUCK_TOP + 10), 'faint'),
      screwsOn([[-6, y0 + 4, TRUCK_TOP + 2.2], [6, y0 + 4, TRUCK_TOP + 2.2], [-6, y0 + 4, BEAM_Z - 2.2], [6, y0 + 4, BEAM_Z - 2.2]], 0.45),
    ],
  })
}

const YMOTOR: Plan = { x: SCREW_X - 6, y: -90, w: 12, d: 7, r: 1.2 }
const JACK: Plan = { x: SCREW_X - 3, y: -90.8, w: 6, d: 2.8, r: 0.5 }
slot('gantry.low', 'gantry')
// The Y motor's lead drops behind the beam's end to the jack on the back plate.
cable('cable.ymotor', [[SCREW_X, YMOTOR.y, BEAM_TOP + 6], [SCREW_X, -95, BEAM_TOP + 6], [SCREW_X, -95, 36], [SCREW_X, JACK.y, 36]], 0.6, 'gantry')
truck('back')
block('gantry.back.jack', JACK, 33, 6, 'mid', { bevel: 0, steps: 2 })
sidePlate('back')
truck('front')
item('gantry.front.index', [solid(slabOf({ x: -1, y: RAIL_Y[1] + 8, w: 2, d: 1, r: 0.3 }, RAIL_BASE_H + 1.2, RAIL_TOP - RAIL_BASE_H - 1.2, P, 2), 'mid'), line(pathOf([at([0, RAIL_Y[1] + 9, RAIL_TOP]), at([0, RAIL_Y[1] + 9, RAIL_BASE_H + 1.2])]), 'hi')], [slabShape({ x: -1, y: RAIL_Y[1] + 8, w: 2, d: 1, r: 0.3 }, RAIL_BASE_H + 1.2, RAIL_TOP - RAIL_BASE_H - 1.2, 2)])

slot('belt.return', 'still')
run('belt.return', RETURN_Y, -PULLEY_X, PULLEY_X)
wrap('belt.wrap.right.back', PULLEY_X, -Math.PI / 2, LIMB)
pulley('idler', PULLEY_X, 'hub')

slot('gantry.plate', 'gantry')
sidePlate('front')

slot('belt.drive', 'still')
pulley('xpulley', -PULLEY_X, 'hub')
wrap('belt.wrap.left.front', -PULLEY_X, Math.PI / 2, LIMB + Math.PI)
run('belt.drive', DRIVE_Y, -PULLEY_X, PULLEY_X)
wrap('belt.wrap.right.front', PULLEY_X, LIMB, Math.PI / 2)
pulley('idler', PULLEY_X, 'high')
pulley('xpulley', -PULLEY_X, 'high')

slot('gantry.high', 'gantry')
block('gantry.clamp', { x: -5, y: DRIVE_Y + BELT_T / 2, w: 10, d: 1.8, r: 0.5 }, BELT_Z - 1, BELT_H + 2, 'mid', { bevel: 0.3, steps: 2, extra: [screwsOn([[-3, DRIVE_Y + BELT_T / 2 + 1.8, BELT_Z + 1.5], [3, DRIVE_Y + BELT_T / 2 + 1.8, BELT_Z + 1.5]], 0.45)] })
const BEAM: Plan = { x: -7, y: -90, w: 14, d: 180, r: 1.5 }
block('gantry.beam', BEAM, BEAM_Z, BEAM_TOP - BEAM_Z, 'mid', {
  steps: 4,
  bevel: 0.8,
  inner: [{ d: sideSeam(BEAM, BEAM_Z + 2.4, P, 4), tone: 'faint' }],
  extra: [screwsOn([[-3.5, -86, BEAM_TOP], [3.5, -86, BEAM_TOP], [-3.5, 86, BEAM_TOP], [3.5, 86, BEAM_TOP]], 0.45)],
})

// Lead screw on the beam, between two bearing blocks, driven by the Y motor through a coupling.
block('ymotor.body', YMOTOR, BEAM_TOP, 11.5, 'mid', { bevel: 0.5, inner: [{ d: sideSeam(YMOTOR, BEAM_TOP + 2.4, P, 4) + sideSeam(YMOTOR, BEAM_TOP + 9.1, P, 4), tone: 'faint' }], extra: [screwsOn(cornerScrews(YMOTOR, 1.6, BEAM_TOP + 11.5), 0.4)] })
const SCREW_F = along([SCREW_X, 0, SCREW_Z], [0, 1, 0])
turned('ymotor.coupling', SCREW_F, [[-83, 2.1], [-80, 2.1]], 'mid', { inner: [{ d: G.arcOf(SCREW_F, -81.5, 2.1, P), tone: 'faint' }] })
const bearing = (y0: number) => block('gantry.bearing', { x: SCREW_X - 3.5, y: y0, w: 7, d: 4, r: 0.8 }, BEAM_TOP, SCREW_Z + 2.5 - BEAM_TOP, 'mid', { bevel: 0.4, extra: [screwsOn([[SCREW_X, y0 + 2, SCREW_Z + 2.5]], 0.45)] })
bearing(-80)
const threads = Array.from({ length: 76 }, (_, index) => G.arcOf(SCREW_F, -75 + index * 2, SCREW_R, P, { steps: 10 })).join('')
turned('gantry.leadscrew', SCREW_F, [[-76, SCREW_R], [76, SCREW_R]], 'mid', { inner: [{ d: threads, tone: 'faint' }] })
bearing(76)

// --- Pen head: a carriage on the beam, a half-nut on the screw, the lift solenoid ---------------------------------

slot('head', 'head')
block('head.plate', { x: 7, y: -10, w: 3, d: 20, r: 0.6 }, 36, BEAM_TOP - 36, 'mid', { bevel: 0.4, steps: 2, extra: [line(faceRectX(10, -7, 7, 38.5, 49.5), 'faint')] })
const HEAD: Plan = { x: -1, y: -10, w: 11, d: 20, r: 1.5 }
block('head.nut', { x: -7.5, y: -6, w: 6.5, d: 12, r: 1 }, SCREW_Z + SCREW_R, HEAD_TOP - SCREW_Z - SCREW_R, 'mid', { bevel: 0.4, steps: 3, extra: [screwsOn([[-4.2, -3.6, HEAD_TOP], [-4.2, 3.6, HEAD_TOP]], 0.4)] })
block('head.block', HEAD, BEAM_TOP, HEAD_TOP - BEAM_TOP, 'mid', {
  bevel: 0.6,
  inner: [{ d: sideSeam(HEAD, BEAM_TOP + 3, P, 4), tone: 'faint' }],
  extra: [screwsOn([[1.6, -7.6, HEAD_TOP], [1.6, 7.6, HEAD_TOP], [8.2, -7.6, HEAD_TOP], [8.2, 7.6, HEAD_TOP]], 0.45)],
})
post('head.solenoid', 4.5, 0, 3.4, HEAD_TOP, 6, 'mid', { steps: 32, extra: [line(sideArc(4.5, 0, 3.4, HEAD_TOP + 2, P, 24), 'faint')] })
post('head.solenoid.cap', 4.5, 0, 2.4, HEAD_TOP + 6, 1.4, 'mid', { steps: 24, extra: [line(ringOn(4.5, 0, 1, HEAD_TOP + 7.4, P, 12), 'lo')] })

// --- The pen and its clamp, which ride up on the head plate to lift the tip ---------------------------------------

slot('pen', 'pen')
const PEN: Plane = [PEN_X, 0]
block('pen.clamp', { x: 10, y: -4, w: 4, d: 8, r: 0.6 }, 38, 10, 'mid', { bevel: 0.3, steps: 2 })
const TIP_F = up(PEN[0], PEN[1], PAPER_TOP)
turned('pen.tip', TIP_F, [[0, 0.3], [1.4, 0.5], [3.6, 1.1], [4.6, 1.4]], 'hi', { lit: true })
turned('pen.nose', TIP_F, [[4.6, 1.9], [5.6, 1.9]], 'hi')
post('pen.body.low', PEN[0], PEN[1], 1.8, PAPER_TOP + 5.6, 38 - PAPER_TOP - 5.6, 'hi', { steps: 24, extra: [line(sideArc(PEN[0], PEN[1], 1.8, 20, P, 16) + sideArc(PEN[0], PEN[1], 1.8, 21.2, P, 16), 'lo')] })
post('pen.collar.low', PEN[0], PEN[1], 3, 38, 3, 'mid', { steps: 28 })
post('pen.body.mid', PEN[0], PEN[1], 1.8, 41, 4, 'hi', { steps: 24 })
post('pen.collar.high', PEN[0], PEN[1], 3, 45, 3, 'mid', { steps: 28 })
post('pen.body.high', PEN[0], PEN[1], 1.8, 48, 4.5, 'hi', { steps: 24 })
post('pen.cap', PEN[0], PEN[1], 2.1, 52.5, 3, 'hi', { steps: 24, extra: [line(ringOn(PEN[0], PEN[1], 0.9, 55.5, P, 12), 'lo')] })
// Thumb screw into the clamp's near side, knurled.
block('pen.screw.neck', { x: 11.2, y: 4, w: 1.6, d: 2.2, r: 0.4 }, 42.2, 1.6, 'mid', { bevel: 0, steps: 2 })
const THUMB_F = along([12, 6.2, 43], [0, 1, 0])
const thumbKnurl = G.ribsOf(THUMB_F, 0, 2.6, 2, 18, P, { fade: [0.05, 0.5] })
turned('pen.screw.knob', THUMB_F, [[0, 2], [2.6, 2]], 'mid', {
  extra: [line(thumbKnurl.filter(rib => rib.alpha > 0.5).map(rib => rib.d).join(''), 'lo'), line(G.circleOf(THUMB_F, 2.6, 0.8, P, 12), 'lo')],
})

// --- Exports for the static art, the live loop and the audit ----------------------------------------------------

export const PARTS = SLOTS

// Ink lines: the full layout (the settled pose) and the line the pen is laying.
const inkPath = (points: Floor[], closed = false) => pathOf(points.map(([x, y]) => at([x, y, PAPER_TOP])), closed)
export const INK_FULL = STROKES.map(stroke => inkPath(stroke))
export const inkOf = (points: Floor[]) => (points.length > 1 ? inkPath(points) : '')

// Screen transforms for the moving slots, from the pen tip's floor point, its lift (0..1) and the gantry nudge.
export function movesOf (tip: Floor, lift: number, nudge: number) {
  const gx = tip[0] - PEN_X + nudge
  const hy = tip[1]
  return {
    gantry: translateAlong(P, [gx, 0, 0]),
    head: translateAlong(P, [gx, hy, 0]),
    pen: translateAlong(P, [gx, hy, lift * LIFT]),
  }
}

export const SCALE = KS
export const PROJECTION = P
