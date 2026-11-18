import { insetPlan, iso, planOutline, slabOf, type Plan, type Projection, type SolidPaths } from '@/components/iso/kit/iso-kit'

// The pure geometry of the AgriTA figure: the exploded frontend stack (kit isometry), the TA Farm land lots and the
// QR matrix on the product label. All numbers are viewBox units (640 x 520).

// --- The stack: five boards of the apps' real frontend layers (figures/agrita/config.ts), top board first --------------

export type Layer = { id: string, label: string, tech: string }

export const LAYERS: Layer[] = [
  { id: 'ui', label: 'ui', tech: 'React 19 · shadcn/ui' },
  { id: 'routes', label: 'routes', tech: 'TanStack Router' },
  { id: 'data', label: 'data', tech: 'Query · Zustand' },
  { id: 'forms', label: 'forms', tech: 'Hook Form · Zod' },
  { id: 'api', label: 'api', tech: 'Axios · OpenAPI' },
]

const PLAN: Plan = { x: -38, y: -26, w: 76, d: 52, r: 3 }
const THICK = 4
const PITCH = 6
const OPEN = 18
// A lower camera than the kit's default keeps each opened board's label clear of the board above.
const ELEVATION = 22
export const PROJ: Projection = { origin: [420, 190], scale: 1, elevation: ELEVATION }

// Screen px one world z unit rises: cos(elevation) * the kit's unit.
const Z_PX = Math.cos((ELEVATION * Math.PI) / 180) * Math.sqrt(1.6)

export type Board = {
  layer: Layer
  n: number
  solid: SolidPaths
  inset: string
  label: [number, number]
  root: [number, number]
  balloon: [number, number]
  lift: number
}

// Board k (0 = bottom = api) assembled at z = k * PITCH; `lift` is how far (screen px) it rises when the stack opens.
export const BOARDS: Board[] = LAYERS.map((layer, i) => {
  const k = LAYERS.length - 1 - i
  const z = k * PITCH
  const top = z + THICK
  const root = iso([PLAN.x + PLAN.w, PLAN.y + PLAN.r, top - THICK / 2], PROJ)
  const balloon: [number, number] = [root[0] + 30, root[1] - 9]
  return {
    layer,
    n: i + 1,
    solid: slabOf(PLAN, z, THICK, PROJ),
    inset: planOutline(insetPlan(PLAN, 7), top, PROJ),
    label: iso([9, 7, top], PROJ),
    root,
    balloon,
    lift: k * OPEN * Z_PX,
  }
}).reverse()

export const AXIS_X = PROJ.origin[0]
export const AXIS_TOP = BOARDS[BOARDS.length - 1]!.label[1] - BOARDS[BOARDS.length - 1]!.lift - 28
export const AXIS_BOTTOM = iso([0, 0, -6], PROJ)[1]

// --- TA Farm: land lot polygons on the map panel, lot B being edited with Geoman -----------------------------------------

export const LOTS = [
  'M62 70L150 60L166 122L76 138Z',
  'M176 66L278 58L298 126L192 132Z',
  'M304 86L322 90L322 150L300 142Z',
  'M86 146L198 140L212 184L96 190Z',
  'M216 140L296 134L312 178L226 186Z',
]
export const ACTIVE_LOT = 1
export const LOT_VERTICES: [number, number][] = [[176, 66], [278, 58], [298, 126], [192, 132]]
export const LOT_MIDPOINTS: [number, number][] = LOT_VERTICES.map(([x, y], i) => {
  const [nx, ny] = LOT_VERTICES[(i + 1) % LOT_VERTICES.length]!
  return [(x + nx) / 2, (y + ny) / 2]
})
// The same lot as a thumbnail on the trace page (scaled into a 60 x 44 box).
export const LOT_THUMB = 'M556 350L598 347L606 375L562 378Z'

// --- The QR matrix on the label: three finder patterns and a seeded data field (decorative, encodes nothing) ------------

export const QR_N = 21
export const QR_CELL = 4.4
export const QR_X = 32
export const QR_Y = 338
export const QR_SIZE = QR_N * QR_CELL
const BANDS = 7

const inFinder = (r: number, c: number) => (r < 8 && c < 8) || (r < 8 && c >= QR_N - 8) || (r >= QR_N - 8 && c < 8)

function dataBands () {
  let seed = 7
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed >>> 20
  }
  const bands: string[] = Array.from({ length: BANDS }, () => '')
  for (let r = 0; r < QR_N; r++) {
    for (let c = 0; c < QR_N; c++) {
      const on = next() % 100 < 48
      if (!on || inFinder(r, c)) continue
      const band = Math.min(BANDS - 1, Math.floor(((r + c) / (2 * QR_N - 2)) * BANDS))
      bands[band] += `M${QR_X + c * QR_CELL} ${QR_Y + r * QR_CELL}h${QR_CELL}v${QR_CELL}h${-QR_CELL}z`
    }
  }
  return bands
}

export const QR_FINDERS: [number, number][] = [[0, 0], [0, QR_N - 7], [QR_N - 7, 0]]
export const QR_BANDS = dataBands()
