// Geometry and words of the AgriTA figure. All numbers are viewBox units (640 x 520).

// --- The TA Farm map (y 24..140): land lot polygons, the first one being the lot picked for editing -------------------

export const MAP = { x: 24, y: 24, w: 592, h: 116 }
export const LOTS = [
  'M40 65L145 58L164 92L54 99Z',
  'M180 60L300 56L323 95L203 102Z',
  'M340 58L445 61L457 98L352 102Z',
  'M476 64L600 60L594 100L484 104Z',
  'M65 107L193 104L203 129L77 131Z',
  'M226 109L354 107L362 130L236 132Z',
]
export const ACTIVE_LOT = 0
export const LOT_VERTICES: [number, number][] = [[40, 65], [145, 58], [164, 92], [54, 99]]
export const LOT_LABEL: [number, number] = [100, 79]
// The same lot as a thumbnail on the trace page.
export const LOT_THUMB = 'M392 266L462 262L472 300L400 306Z'

// --- The data chain (y 160..196): five blocks, one per entity of the chain ---------------------------------------------

export const CHAIN = ['land lot', 'season', 'harvest', 'stock', 'product']
export const BLOCK = { y: 160, w: 96, h: 36, step: 124 }
export const blockX = (i: number) => 24 + i * BLOCK.step

// --- The product QR (right, y 220..332) and the public trace page on TA Market (left) ----------------------------------

export const QR_FRAME = { x: 512, y: 220, w: 104, h: 112 }
export const PAGE = { x: 24, y: 220, w: 464, h: 112 }
export const TRACE = [...CHAIN].reverse()
export const rowY = (i: number) => 255 + i * 17

// --- The stack strip (y 360..444): one cell per layer of src/components/iso/figures/agrita/config.ts ------------------

export const STACK: { label: string, tech: string, lit: [number, number] }[] = [
  { label: 'ui', tech: 'React 19', lit: [0.18, 0.32] },
  { label: 'routes', tech: 'TanStack Router', lit: [0.76, 0.94] },
  { label: 'data', tech: 'TanStack Query', lit: [0.42, 0.58] },
  { label: 'forms', tech: 'React Hook Form', lit: [0.32, 0.42] },
  { label: 'api', tech: 'Axios', lit: [0.58, 0.74] },
]
export const CELL = { y: 360, w: 104, h: 84, step: 122 }
export const cellX = (i: number) => 24 + i * CELL.step

// --- The QR matrix: version 2 layout (25 modules), finders, timing rows, one alignment pattern, seeded data ---------------

export const QR_N = 25
export const QR_CELL = 3.84
export const QR_X = 516
export const QR_Y = 228
export const QR_SIZE = QR_N * QR_CELL
export const QR_FINDERS: [number, number][] = [[0, 0], [0, QR_N - 7], [QR_N - 7, 0]]
const ALIGN = 18
const BANDS = 5

const cell = (r: number, c: number) => `M${QR_X + c * QR_CELL} ${QR_Y + r * QR_CELL}h${QR_CELL}v${QR_CELL}h${-QR_CELL}z`
const inFinder = (r: number, c: number) => (r < 8 && c < 8) || (r < 8 && c >= QR_N - 8) || (r >= QR_N - 8 && c < 8)
const inAlign = (r: number, c: number) => Math.abs(r - ALIGN) <= 2 && Math.abs(c - ALIGN) <= 2

// The fixed modules: the timing rows and the alignment pattern.
function fixedCells () {
  let d = ''
  for (let i = 8; i < QR_N - 8; i += 2) d += cell(6, i) + cell(i, 6)
  for (let r = ALIGN - 2; r <= ALIGN + 2; r++) {
    for (let c = ALIGN - 2; c <= ALIGN + 2; c++) {
      const ring = Math.max(Math.abs(r - ALIGN), Math.abs(c - ALIGN))
      if (ring !== 1) d += cell(r, c)
    }
  }
  return d
}

// The data field in diagonal bands so it can fill in progressively (decorative, encodes nothing).
function dataBands () {
  let seed = 7
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed >>> 20
  }
  const bands: string[] = Array.from({ length: BANDS }, () => '')
  for (let r = 0; r < QR_N; r++) {
    for (let c = 0; c < QR_N; c++) {
      const on = next() % 100 < 44
      if (!on || inFinder(r, c) || inAlign(r, c) || r === 6 || c === 6) continue
      const band = Math.min(BANDS - 1, Math.floor(((r + c) / (2 * QR_N - 2)) * BANDS))
      bands[band] += cell(r, c)
    }
  }
  return bands
}

export const QR_FIXED = fixedCells()
export const QR_BANDS = dataBands()
