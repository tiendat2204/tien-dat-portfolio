/*
  The stack anatomy, built once per layer count from the kit. World units are about 1 px; x and y lie on the bench,
  z is up. A base plate on feet carries two guide posts behind the stack and a bus riser on its right. Each layer is
  a board (bevelled, laminated, with a groove, corner screws, a ruler strip, an IC, traces, a label plate and an LED)
  on four standoffs; brackets on its back faces ride the guide posts and a port bracket on its right face meets the
  bus. The packet (a small block) rides the bus up and down. Side modules are small satellite boards on the base to
  the left of the stack (the base grows sideways, not forward, so the drawing stays wide rather than tall).

  Boards are built at the rest place of board 0 and moved with a transform: `plateOffset` is the only thing that
  changes as the stack opens. Plate index 0 is the bottom board; the config's layer k is board n - 1 - k, so the
  first layer (the UI) is the top board. Every drawn item carries its true shapes for the audit beside this file.
*/
import {
  corners,
  cylinder,
  depthOf,
  fitProjection,
  insetPlan,
  iso,
  lineOnTop,
  onTop,
  planOutline,
  ring as ringOn,
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

// --- Pure layout ------------------------------------------------------------------------------------------------------

type Offset = { x: number, y: number, z: number }

export type StackLayout = { plateOffsets: Offset[], viewBox: [number, number, number, number] }

export const WIDTH = 400
const PAD = 8

// Board thickness, standoff height (the assembled gap) and the extra gap a fully opened stack adds per board.
const BOARD_T = 4
const STANDOFF_H = 2.5
const OPEN_GAP = 8
const PITCH = BOARD_T + STANDOFF_H

const PLATE: Plan = { x: -50, y: -36, w: 100, d: 72, r: 3 }
const BASE: Plan = { x: -100, y: -52, w: 170, d: 100, r: 6 }
const BASE_H = 5
const FOOT_H = 2.5

// Guide posts behind the -y and -x faces, the bus riser beside the +x face.
const POST_R = 2.6
const POST_A: Plane = [30, PLATE.y - 3 - POST_R]
const POST_B: Plane = [PLATE.x - 3 - POST_R, 20]
const BUS_R = 3
const BUS: Plane = [PLATE.x + PLATE.w + 3 + BUS_R, -20]
const COLLAR_H = 1.2
const CAP_H = 1.6
const HEADROOM = 4

// The packet: a block on the bus's +x side, centred on board 0's mid-thickness at rest.
const PACKET = 6.5
const PACKET_PLAN: Plan = { x: BUS[0] + BUS_R, y: BUS[1] - PACKET / 2, w: PACKET, d: PACKET, r: 0.8 }
const PACKET_Z = STANDOFF_H + BOARD_T / 2 - PACKET / 2

const clamp01 = (value: number) => (Number.isNaN(value) ? 0 : Math.min(1, Math.max(0, value)))
const countOf = (layerCount: number) => (Number.isFinite(layerCount) ? Math.max(1, Math.floor(layerCount)) : 1)

// Height of the stack's top board surface when fully open: posts and the bus reach a little above it.
const topOf = (count: number) => STANDOFF_H + (count - 1) * (PITCH + OPEN_GAP) + BOARD_T
const postTopOf = (count: number) => topOf(count) + HEADROOM

function extremes (count: number): Point3[] {
  const top = postTopOf(count) + CAP_H
  const box = (plan: Plan, z0: number, z1: number): Point3[] =>
    [plan.x, plan.x + plan.w].flatMap(x => [plan.y, plan.y + plan.d].flatMap(y => [z0, z1].map((z): Point3 => [x, y, z])))
  return [
    ...box(BASE, -BASE_H - FOOT_H, 0),
    ...box(PLATE, 0, topOf(count)),
    [POST_A[0], POST_A[1] - POST_R, top],
    [POST_B[0] - POST_R, POST_B[1], top],
    [BUS[0] + BUS_R, BUS[1], top],
  ]
}

// The viewBox height follows the stack's height at one fixed scale per width, so every layer count shares a scale.
function projectionOf (count: number): { P: Projection, height: number } {
  const points = extremes(count)
  const unit = fitProjection(points, 1000, 1000, { pad: 0 })
  const flat = points.map(point => iso(point, unit))
  const xs = flat.map(([x]) => x)
  const ys = flat.map(([, y]) => y)
  const ratio = (Math.max(...ys) - Math.min(...ys)) / (Math.max(...xs) - Math.min(...xs))
  const height = Math.round((WIDTH - PAD * 2) * ratio + PAD * 2)
  return { P: fitProjection(points, WIDTH, height, { pad: PAD }), height }
}

export function layout (layerCount: number): StackLayout {
  const count = countOf(layerCount)
  const { height } = projectionOf(count)
  return {
    plateOffsets: Array.from({ length: count }, (_, i) => ({ x: 0, y: 0, z: i * PITCH })),
    viewBox: [0, 0, WIDTH, height],
  }
}

// Board i's offset from the rest place of board 0; `explode` 0 is the assembled stack, 1 fully open.
export function plateOffset (stack: StackLayout, i: number, explode: number): Offset {
  const index = Number.isFinite(i) ? i : 0
  const base = stack.plateOffsets[index] ?? { x: 0, y: 0, z: index * PITCH }
  return { x: base.x, y: base.y, z: base.z + index * OPEN_GAP * clamp01(explode) }
}

// --- What an item draws and what it is ------------------------------------------------------------------------------

export type Shape =
  | { kind: 'slab', plan: Plan, z: number, h: number, steps: number, ground?: boolean }
  | { kind: 'cylinder', cx: number, cy: number, r: number, z: number, h: number, ground?: boolean }

export type Mark =
  | { kind: 'solid', paths: SolidPaths, tone: Tone, crease: Tone | 'none', className?: string, inner?: { d: string, tone: LineTone }[] }
  | { kind: 'line', d: string, tone: LineTone, free?: boolean }
  | { kind: 'dots', points: Flat[], size: number, tone: Tone }
  | { kind: 'halo', d: string }
  | { kind: 'beam', d: string }

export type Item = { name: string, marks: Mark[], shapes: Shape[] }

// A group of items moved together: still, one board (by plate index), the packet, or a board's scan line.
export type Group =
  | { key: string, move: 'still', items: Item[] }
  | { key: string, move: 'plate', plate: number, items: Item[], scan: Item[], top: Item[] }
  | { key: string, move: 'packet', items: Item[] }

export type StackArt = {
  P: Projection
  width: number
  height: number
  count: number
  groups: Group[]
  stack: StackLayout
  // Screen transform of board i, of the packet at packetY (0 top board, 1 bottom board), of a scan line at 0..1.
  plateMove (i: number, explode: number): string
  packetMove (packetY: number, explode: number): string
  packetOffset (packetY: number, explode: number): Point3
  scanMove (sweep: number): string
  // Where each board's right corner sits when the stack is open, as a share of the viewBox height (for the chips).
  chipShare (i: number): number
}

const solid = (paths: SolidPaths, tone: Tone = 'mid', options: Partial<Extract<Mark, { kind: 'solid' }>> = {}): Mark => ({ kind: 'solid', paths, tone, crease: 'faint', ...options })
const line = (d: string, tone: LineTone = 'lo', free = false): Mark => ({ kind: 'line', d, tone, free: free || undefined })
const dots = (points: Flat[], size = 0.5, tone: Tone = 'mid'): Mark => ({ kind: 'dots', points, size, tone })

// Where an IC, its label plate and its traces sit on each board, so boards are not copies of one another.
const BOARD_LAYOUTS = [
  { ic: { x: -30, y: -22, w: 24, d: 18 }, label: { x: 8, y: -31 } },
  { ic: { x: -6, y: -20, w: 20, d: 16 }, label: { x: -33, y: -19 } },
  { ic: { x: -34, y: -12, w: 18, d: 22 }, label: { x: 10, y: -20 } },
  { ic: { x: 0, y: -24, w: 26, d: 14 }, label: { x: -36, y: -16 } },
]

// Satellite places on the base's front-left, clear of the stack and of guide post B on screen.
const SIDE_SLOTS: Plane[] = [[-86, 25], [-68, 25], [-92, 8]]
const SIDE_PLAN = { w: 16, d: 16 }
const SIDE_STANDOFF = 2.5
const SIDE_T = 3

function build (count: number, sides: number): StackArt {
  const { P, height } = projectionOf(count)
  const stack = layout(count)
  const at = (point: Point3) => iso(point, P)
  const byDepth = (points: Plane[]) => [...points].sort((a, b) => depthOf([a[0], a[1], 0], P) - depthOf([b[0], b[1], 0], P))
  const groups: Group[] = []
  let items: Item[] = []
  const item = (name: string, marks: Mark[], shapes: Shape[] = []) => { items.push({ name, marks, shapes }) }
  const slab = (plan: Plan, z: number, h: number, steps: number, ground = false): Shape => ({ kind: 'slab', plan, z, h, steps, ground })
  const post = (cx: number, cy: number, r: number, z: number, h: number, ground = false): Shape => ({ kind: 'cylinder', cx, cy, r, z, h, ground })
  const screws = (plan: Plan, inset: number, z: number, ring = 1.4) => [
    line(corners(plan, inset).map(([x, y]) => ringOn(x, y, ring, z, P, 16)).join(''), 'lo'),
    dots(corners(plan, inset).map(([x, y]) => at([x, y, z])), 0.45),
  ]
  const still = (key: string) => {
    items = []
    groups.push({ key, move: 'still', items })
  }

  // --- Base on feet, with its groove, corner screws, ruler strip and label plate ------------------------------------

  still('base')
  item('stand.halo', [{ kind: 'halo', d: slabOf(BASE, -BASE_H - FOOT_H, BASE_H, P).fill }])
  for (const [x, y] of byDepth(corners(BASE, 16))) {
    item('stand.foot', [solid(cylinder(x, y, 5, -BASE_H - FOOT_H, FOOT_H, P, 24), 'lo')], [post(x, y, 5, -BASE_H - FOOT_H, FOOT_H, true)])
  }
  const ruler: Plan = { x: 57, y: 2, w: 6, d: 38, r: 1 }
  const rulerTicks = topTicks(ruler.y + 4, ruler.y + ruler.d - 4, 4, 5, ruler.x, 0.6, [1.8, 3.2], P, 'y')
  // The label plate takes the first satellite place a side module does not use (none when all three are used).
  const free = SIDE_SLOTS[Math.min(SIDE_SLOTS.length, sides)] as Plane | undefined
  const tag: Plan = { x: free?.[0] ?? 0, y: (free?.[1] ?? 0) + 3, w: 16, d: 10, r: 1.2 }
  item('stand.plate', [
    solid(slabOf(BASE, -BASE_H, BASE_H, P, 6, 1.2), 'lo', { inner: [{ d: sideSeam(BASE, -BASE_H / 2, P, 6), tone: 'faint' }] }),
    line(planOutline(insetPlan(BASE, 4), 0, P, 6), 'faint'),
    ...screws(BASE, 6, 0, 2),
  ], [slab(BASE, -BASE_H, BASE_H, 6, true)])
  item('stand.ruler', [
    solid(slabOf(ruler, 0, 0.6, P, 3), 'lo', { crease: 'none' }),
    line(rulerTicks.minor, 'lo'),
    line(rulerTicks.major, 'mid'),
  ], [slab(ruler, 0, 0.6, 3, true)])
  if (free) {
    item('stand.tag', [
      solid(slabOf(tag, 0, 0.8, P, 3), 'lo', { crease: 'none' }),
      line(planOutline(insetPlan(tag, 1.4), 0.8, P, 3), 'faint'),
      line([9, 6].map((w, row) => lineOnTop([tag.x + 3.4, tag.y + 3.6 + row * 3], [tag.x + 3.4 + w, tag.y + 3.6 + row * 3], 0.8, P)).join(''), 'lo', true),
      dots([at([tag.x + tag.w - 2.4, tag.y + 2.4, 0.8]), at([tag.x + tag.w - 2.4, tag.y + tag.d - 2.4, 0.8])], 0.42),
    ], [slab(tag, 0, 0.8, 3, true)])
  }

  // --- Guide posts behind the stack: collar, post, cap ---------------------------------------------------------------

  const postTop = postTopOf(count)
  const guide = (name: string, [cx, cy]: Plane, r: number) => {
    item(`${name}.collar`, [solid(cylinder(cx, cy, r + 1.6, 0, COLLAR_H, P, 28), 'lo'), line(ringOn(cx, cy, r + 0.6, COLLAR_H, P, 24), 'faint')], [post(cx, cy, r + 1.6, 0, COLLAR_H)])
    item(`${name}.post`, [solid(cylinder(cx, cy, r, COLLAR_H, postTop - COLLAR_H, P, 28), 'mid', { crease: 'none' })], [post(cx, cy, r, COLLAR_H, postTop - COLLAR_H)])
    item(`${name}.cap`, [solid(cylinder(cx, cy, r + 0.6, postTop, CAP_H, P, 28), 'mid'), dots([at([cx, cy, postTop + CAP_H])], 0.5)], [post(cx, cy, r + 0.6, postTop, CAP_H)])
  }
  still('posts')
  for (const [name, at2, r] of [['guide.a', POST_A, POST_R], ['guide.b', POST_B, POST_R]] as const) guide(name, at2, r)

  // --- Satellite boards for the side modules, front-left of post B, behind the boards, far to near -----

  still('side')
  const slots = SIDE_SLOTS.slice(0, Math.max(0, Math.min(SIDE_SLOTS.length, sides))).map((slot, index) => ({ slot, index }))
  slots.sort((a, b) => depthOf([a.slot[0], a.slot[1], 0], P) - depthOf([b.slot[0], b.slot[1], 0], P))
  for (const { slot: [sx, sy], index } of slots) {
    const plan: Plan = { x: sx, y: sy, w: SIDE_PLAN.w, d: SIDE_PLAN.d, r: 1.6 }
    const z = SIDE_STANDOFF
    const sideTop = z + SIDE_T
    const name = `side${index}`
    for (const [x, y] of byDepth(corners(plan, 4))) item(`${name}.standoff`, [solid(cylinder(x, y, 1.4, 0, z, P, 16), 'lo')], [post(x, y, 1.4, 0, z)])
    item(`${name}.board`, [
      solid(slabOf(plan, z, SIDE_T, P, 3, 0.5), 'mid', { inner: [{ d: sideSeam(plan, z + SIDE_T / 2, P, 3), tone: 'faint' }] }),
      ...screws(plan, 2, sideTop, 0.8),
    ], [slab(plan, z, SIDE_T, 3)])
    const chip: Plan = { x: plan.x + 4, y: plan.y + 4, w: 8, d: 8, r: 0.6 }
    item(`${name}.chip`, [
      solid(slabOf(chip, sideTop, 1.8, P, 2, 0.3), 'mid'),
      dots(Array.from({ length: 3 }, (_, k): Flat => at([chip.x + 2 + k * 2, chip.y + chip.d + 1, sideTop])), 0.4),
    ], [slab(chip, sideTop, 1.8, 2)])
  }

  // --- The boards, bottom to top -------------------------------------------------------------------------------------

  const top = STANDOFF_H + BOARD_T
  const scanFrom = PLATE.x + 8
  const scanTo = PLATE.x + PLATE.w - 8
  for (let i = 0; i < count; i++) {
    items = []
    const scan: Item[] = []
    const onTopItems: Item[] = []
    const name = `board${i}`
    // Standoffs under the board, far to near.
    for (const [x, y] of byDepth(corners(PLATE, 12))) {
      item(`${name}.standoff`, [solid(cylinder(x, y, 2, 0, STANDOFF_H, P, 20), 'lo')], [post(x, y, 2, 0, STANDOFF_H)])
    }
    // Brackets on the back faces that ride the guide posts.
    const bracketA: Plan = { x: POST_A[0] - 3, y: POST_A[1] + POST_R, w: 6, d: PLATE.y - POST_A[1] - POST_R, r: 0.4 }
    const bracketB: Plan = { x: POST_B[0] + POST_R, y: POST_B[1] - 3, w: PLATE.x - POST_B[0] - POST_R, d: 6, r: 0.4 }
    for (const [label, plan] of [['a', bracketA], ['b', bracketB]] as const) {
      item(`${name}.bracket.${label}`, [solid(slabOf(plan, STANDOFF_H + 0.8, BOARD_T - 1.6, P, 2, 0.3), 'mid')], [slab(plan, STANDOFF_H + 0.8, BOARD_T - 1.6, 2)])
    }
    // The board: a laminated slab with a groove, corner screws and traces from its IC to the port edge.
    const board = BOARD_LAYOUTS[i % BOARD_LAYOUTS.length]
    const ic: Plan = { ...board.ic, r: 0.8 }
    const icMid = ic.y + ic.d / 2
    const edge = PLATE.x + PLATE.w
    const traces = [-4, 0, 4].map(dy => {
      const y = Math.round(icMid + dy)
      const bend = BUS[1] + dy * 0.75
      return onTop([[ic.x + ic.w / 2, y], [edge - 14 - dy, y], [edge - 10, bend], [edge, bend]], top, P)
    }).join('')
    item(`${name}.board`, [
      solid(slabOf(PLATE, STANDOFF_H, BOARD_T, P, 4, 0.8), 'mid', {
        className: 'stack-board',
        inner: [{ d: sideSeam(PLATE, STANDOFF_H + BOARD_T / 2, P, 4), tone: 'faint' }],
      }),
      line(planOutline(insetPlan(PLATE, 3.5), top, P, 4), 'faint'),
      line(traces, 'lo'),
      ...screws(PLATE, 6, top),
    ], [slab(PLATE, STANDOFF_H, BOARD_T, 4)])
    // The scan beam and its rule, drawn on the top face and moved across it in x.
    const beamW = 5
    const beam = onTop([[scanFrom - beamW, PLATE.y + 0.6], [scanFrom, PLATE.y + 0.6], [scanFrom, PLATE.y + PLATE.d - 0.6], [scanFrom - beamW, PLATE.y + PLATE.d - 0.6]], top, P, true)
    scan.push({ name: `${name}.scan`, marks: [{ kind: 'beam', d: beam }, line(lineOnTop([scanFrom, PLATE.y], [scanFrom, PLATE.y + PLATE.d], top, P), 'hi')], shapes: [] })
    // Ruler strip along the front edge, the IC with its pins, a label plate and the status LED.
    const strip: Plan = { x: PLATE.x + 8, y: PLATE.y + PLATE.d - 8, w: 56, d: 4.4, r: 0.6 }
    const ticks = topTicks(strip.x + 2, strip.x + strip.w - 2, 3, 5, strip.y, top + 0.5, [1.4, 2.6], P)
    onTopItems.push({ name: `${name}.ruler`, marks: [solid(slabOf(strip, top, 0.5, P, 2), 'lo', { crease: 'none' }), line(ticks.minor, 'lo'), line(ticks.major, 'mid')], shapes: [slab(strip, top, 0.5, 2)] })
    const pins = (count2: number, from: Plane, step: Plane) => Array.from({ length: count2 }, (_, k): Flat => at([from[0] + step[0] * k, from[1] + step[1] * k, top]))
    const pinRow = Math.max(3, Math.floor((ic.w - 4) / 3))
    const pinCol = Math.max(3, Math.floor((ic.d - 4) / 3))
    onTopItems.push({
      name: `${name}.ic`,
      marks: [
        solid(slabOf(ic, top, 2.2, P, 2, 0.4), 'mid'),
        dots([...pins(pinRow, [ic.x + 2.5, ic.y + ic.d + 1.2], [3, 0]), ...pins(pinCol, [ic.x + ic.w + 1.2, ic.y + 2.5], [0, 3])], 0.42, 'mid'),
        line(ringOn(ic.x + 3, ic.y + 3, 0.9, top + 2.2, P, 12), 'mid'),
        line(planOutline(insetPlan(ic, 2), top + 2.2, P, 2), 'faint'),
      ],
      shapes: [slab(ic, top, 2.2, 2)],
    })
    const label: Plan = { x: board.label.x, y: board.label.y, w: 20, d: 9, r: 0.8 }
    onTopItems.push({
      name: `${name}.label`,
      marks: [
        solid(slabOf(label, top, 0.6, P, 2), 'lo', { crease: 'none' }),
        line([13, 9].map((w, row) => lineOnTop([label.x + 2.4, label.y + 3 + row * 3], [label.x + 2.4 + w, label.y + 3 + row * 3], top + 0.6, P)).join(''), 'lo', true),
      ],
      shapes: [slab(label, top, 0.6, 2)],
    })
    const led: Plane = [PLATE.x + PLATE.w - 9, PLATE.y + PLATE.d - 8]
    onTopItems.push({ name: `${name}.led`, marks: [solid(cylinder(led[0], led[1], 1.6, top, 1, P, 16), 'mid'), dots([at([led[0], led[1], top + 1])], 0.9, 'hi')], shapes: [post(led[0], led[1], 1.6, top, 1)] })
    // The port bracket on the +x face that meets the bus, drawn after the board it stands out from.
    const port: Plan = { x: edge, y: BUS[1] - 3, w: BUS[0] - BUS_R - edge, d: 6, r: 0.4 }
    onTopItems.push({ name: `${name}.port`, marks: [solid(slabOf(port, STANDOFF_H + 0.8, BOARD_T - 1.6, P, 2, 0.3), 'mid')], shapes: [slab(port, STANDOFF_H + 0.8, BOARD_T - 1.6, 2)] })
    groups.push({ key: name, move: 'plate', plate: i, items, scan, top: onTopItems })
  }

  // --- The bus riser on the right, then the packet that rides it -----------------------------------------------------

  still('bus')
  guide('bus', BUS, BUS_R)
  groups.push({
    key: 'packet',
    move: 'packet',
    items: [{
      name: 'packet',
      marks: [
        solid(slabOf(PACKET_PLAN, PACKET_Z, PACKET, P, 2, 0.5), 'hi', { crease: 'lo', className: 'stack-packet' }),
        line(planOutline(insetPlan(PACKET_PLAN, 1.6), PACKET_Z + PACKET, P, 2), 'mid'),
      ],
      shapes: [slab(PACKET_PLAN, PACKET_Z, PACKET, 2)],
    }],
  })

  const packetOffset = (packetY: number, explode: number): Point3 => {
    const y = clamp01(packetY)
    const from = plateOffset(stack, count - 1, explode).z
    const to = plateOffset(stack, 0, explode).z
    return [0, 0, from + (to - from) * y]
  }
  const corner = (i: number) => at([PLATE.x + PLATE.w, PLATE.y, plateOffset(stack, i, 1).z + STANDOFF_H + BOARD_T / 2])

  return {
    P,
    width: WIDTH,
    height,
    count,
    groups,
    stack,
    plateMove: (i, explode) => translateAlong(P, [0, 0, plateOffset(stack, i, explode).z]),
    packetMove: (packetY, explode) => translateAlong(P, packetOffset(packetY, explode)),
    packetOffset,
    scanMove: sweep => translateAlong(P, [(scanTo - scanFrom) * clamp01(sweep), 0, 0]),
    chipShare: i => corner(i)[1] / height,
  }
}

const ART = new Map<string, StackArt>()

// Built once per layer count and side-module count; the drawing, the live loop and the audit share it.
export function stackArt (layerCount: number, sideCount: number): StackArt {
  const count = countOf(layerCount)
  const sides = Math.max(0, Math.min(SIDE_SLOTS.length, Math.floor(Number.isFinite(sideCount) ? sideCount : 0)))
  const key = `${count}|${sides}`
  const cached = ART.get(key)
  if (cached) return cached
  const art = build(count, sides)
  ART.set(key, art)
  return art
}
