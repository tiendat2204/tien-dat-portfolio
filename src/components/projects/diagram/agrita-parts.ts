// Geometry of the AgriTA figure: the land lots on the TA Farm map and the QR matrix. All numbers are viewBox units (640 x 520).

// --- The map: land lot polygons, the second one being the lot in edit mode ---------------------------------------------

export const LOTS = [
  'M48 62L150 50L168 112L62 126Z',
  'M184 54L300 46L322 118L206 130Z',
  'M338 50L440 56L452 124L350 130Z',
  'M470 60L590 54L584 128L478 134Z',
  'M72 140L196 134L206 180L84 184Z',
  'M228 144L352 140L360 182L238 186Z',
]
export const ACTIVE_LOT = 1
export const LOT_VERTICES: [number, number][] = [[184, 54], [300, 46], [322, 118], [206, 130]]
// The same lot as a thumbnail on the trace page.
export const LOT_THUMB = 'M548 348L592 345L600 374L556 378Z'

// --- The QR matrix: version 2 layout (25 modules), finders, timing rows, one alignment pattern, seeded data ---------------

export const QR_N = 25
export const QR_CELL = 7.2
export const QR_X = 24
export const QR_Y = 310
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
