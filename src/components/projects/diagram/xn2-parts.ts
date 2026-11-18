import { iso, onTop, screenRise, slabOf, type Plan, type Projection, type SolidPaths } from '@/components/iso/kit/iso-kit'
import { xn2Config } from '@/components/iso/figures/xn2/config'

// Geometry of the XN2 figure: the exploded stack (the kit's iso projection over the real layers of the stack config),
// the spec-sheet furniture (corner crosshairs, dimension lines) and the balloons. Pure data, computed once at import.

const tenth = (value: number) => Math.round(value * 10) / 10

// `+` crosshairs at the four corners of a sub-panel, one path.
export function crosshairs (x: number, y: number, w: number, h: number, arm = 3) {
  const mark = (cx: number, cy: number) => `M${cx - arm} ${cy}h${arm * 2}M${cx} ${cy - arm}v${arm * 2}`
  return [mark(x, y), mark(x + w, y), mark(x, y + h), mark(x + w, y + h)].join('')
}

// A horizontal dimension line with arrowheads and extension ticks.
export function dimH (x1: number, x2: number, y: number) {
  return `M${x1 + 5} ${y - 2.5}L${x1} ${y}L${x1 + 5} ${y + 2.5}M${x1} ${y}H${x2}M${x2 - 5} ${y - 2.5}L${x2} ${y}L${x2 - 5} ${y + 2.5}`
}

// A vertical dimension line with arrowheads.
export function dimV (x: number, y1: number, y2: number) {
  return `M${x - 2.5} ${y1 + 5}L${x} ${y1}L${x + 2.5} ${y1 + 5}M${x} ${y1}V${y2}M${x - 2.5} ${y2 - 5}L${x} ${y2}L${x + 2.5} ${y2 - 5}`
}

// The fan of stay cables of one tower: anchors every `step` on both sides of the tower, one path.
export function cableFan (tx: number, top: number, deck: number, reach: number[]) {
  return reach.map((r) => `M${tx} ${top}L${tx - r} ${deck}M${tx} ${top}L${tx + r} ${deck}`).join('')
}

// --- the exploded stack ---------------------------------------------------------------------------------------------

export const P: Projection = { origin: [404, 338], scale: 12 }
const PLAN: Plan = { x: 0, y: 0, w: 10, d: 7, r: 0.5 }
const THICK = 0.5
export const GAP = 1.3
export const RISE = screenRise(1, P)

export type Plate = {
  id: string
  label: string
  tech: string
  n: number
  // Painter's index from the bottom (api = 0) and the collapsed z of the plate's underside.
  index: number
  z: number
  paths: SolidPaths
  // The top-face decoration (a glyph of what the layer does), already projected on the closed stack.
  glyph: string
  // Where the balloon leader starts (right corner of the top face) when the stack is closed.
  anchor: [number, number]
  // How far (px, up) the plate travels when the stack opens fully.
  lift: number
}

const SHORT: Record<string, string> = {
  ui: 'React · Radix',
  routes: 'Vite · Router',
  state: 'Redux · Query',
  forms: 'Hook Form · Zod',
  api: 'Axios',
}

const inset = (x: number, y: number, w: number, d: number): [number, number][] => [[x, y], [x + w, y], [x + w, y + d], [x, y + d]]

function glyphOf (id: string, z: number) {
  const top = z + THICK
  switch (id) {
    case 'ui': // three cards and a sidebar on the console's screen
      return [onTop(inset(1, 1, 2, 5), top, P, true), onTop(inset(3.6, 1, 2.6, 2), top, P, true), onTop(inset(6.6, 1, 2.6, 2), top, P, true), onTop(inset(3.6, 3.6, 5.6, 2.4), top, P, true)].join('')
    case 'routes': // a route tree: trunk and three branches
      return [onTop([[1.2, 3.5], [8.8, 3.5]], top, P), onTop([[3.5, 3.5], [3.5, 1.4], [5, 1.4]], top, P), onTop([[5.5, 3.5], [5.5, 5.6], [7, 5.6]], top, P), onTop([[7.5, 3.5], [7.5, 1.4], [9, 1.4]], top, P)].join('')
    case 'state': // a store ring and two slices
      return [onTop(inset(1.2, 1.2, 7.6, 4.6), top, P, true), onTop([[1.2, 3.5], [8.8, 3.5]], top, P), onTop([[5, 1.2], [5, 5.8]], top, P)].join('')
    case 'forms': // field rows and a check
      return [onTop([[1.2, 1.6], [6, 1.6]], top, P), onTop([[1.2, 3.5], [6, 3.5]], top, P), onTop([[1.2, 5.4], [6, 5.4]], top, P), onTop([[7, 3.6], [7.8, 4.6], [9, 2.6]], top, P)].join('')
    default: // a request and its response
      return [onTop([[1.2, 2.4], [8.8, 2.4], [8, 1.6]], top, P), onTop([[8.8, 4.6], [1.2, 4.6], [2, 5.4]], top, P)].join('')
  }
}

export const PLATES: Plate[] = [...xn2Config.layers].reverse().map((layer, index) => {
  const z = index * THICK
  const [ax, ay] = iso([PLAN.w, 0, z + THICK], P)
  return {
    id: layer.id,
    label: layer.label,
    tech: SHORT[layer.id] ?? layer.tech.join(' · '),
    n: xn2Config.layers.length - index,
    index,
    z,
    paths: slabOf(PLAN, z, THICK, P, 6),
    glyph: glyphOf(layer.id, z),
    anchor: [tenth(ax), tenth(ay)],
    lift: tenth(index * GAP * RISE),
  }
})

// The dashed centerline through the plates, from under the base to above the opened top plate.
const [cx, cy0] = iso([PLAN.w / 2, PLAN.d / 2, -0.6], P)
const topPlate = PLATES[PLATES.length - 1]
const [, cyTop] = iso([PLAN.w / 2, PLAN.d / 2, topPlate.z + THICK + 1.2], P)
export const AXIS = { x: tenth(cx), y0: tenth(cy0), y1: tenth(cyTop - topPlate.lift) }

// Where the packet rides: the centerline, from the opened ui plate down to the api plate.
const [, pTop] = iso([PLAN.w / 2, PLAN.d / 2, topPlate.z + THICK], P)
const [, pBase] = iso([PLAN.w / 2, PLAN.d / 2, THICK], P)
export const PACKET = { x: tenth(cx), from: tenth(pTop - topPlate.lift), to: tenth(pBase) }

// The front corner of the base, where the packet leaves the stack for the external API.
const [fx, fy] = iso([PLAN.w, PLAN.d, 0], P)
export const BASE_FRONT: [number, number] = [tenth(fx), tenth(fy)]
