import { draw, fade, pulse, rise, travel } from '@/components/projects/diagram/anim'

// AgriTA: land lots on the TA Farm map, the data chain of one product (land lot, season, harvest, stock, product),
// then the public QR trace page that walks the chain back. Progress 0..1 (see anim.ts).

const CHAIN = ['land lot', 'season', 'harvest', 'stock', 'product']
const CHIP_W = 104
const CHIP_H = 38
const CHIP_X = (i: number) => 24 + i * 122
const CHIP_Y = 214

const LOTS = [
  'M60 90L170 78L190 150L74 168Z',
  'M200 84L330 74L352 160L214 156Z',
  'M366 80L470 92L488 160L378 166Z',
  'M504 100L590 96L580 168L510 170Z',
]
const LOT_B_VERTICES: [number, number][] = [[200, 84], [330, 74], [352, 160], [214, 156]]

// A QR-like module matrix (decorative, not an encoding of anything): three finder patterns plus a seeded data field.
const N = 21
const CELL = 5.5
const QR_X = 44
const QR_Y = 324
const BANDS = 7

const inFinder = (r: number, c: number) => (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8)

function dataBands () {
  let seed = 7
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed >>> 20
  }
  const bands: string[] = Array.from({ length: BANDS }, () => '')
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const on = next() % 100 < 48
      if (!on || inFinder(r, c)) continue
      const band = Math.min(BANDS - 1, Math.floor(((r + c) / (2 * N - 2)) * BANDS))
      bands[band] += `M${QR_X + c * CELL} ${QR_Y + r * CELL}h${CELL}v${CELL}h${-CELL}z`
    }
  }
  return bands
}

const FINDERS: [number, number][] = [[0, 0], [0, N - 7], [N - 7, 0]]
const BANDS_D = dataBands()

const TRACE = ['land lot', 'crop season', 'harvest lot', 'stock lot']

export function AgritaDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='AgriTA: land lots on a map, the chain land lot, season, harvest, stock and product, then a QR code that opens the public trace page' className='dg'>
      {/* TA Farm map */}
      <g>
        <rect x={24} y={40} width={592} height={150} rx={6} pathLength={1} className='dg-fill' style={draw(0, 0.08)} />
        <text x={36} y={54} className='dg-dim dg-small' style={fade(0.04, 0.1)}>TA Farm · map</text>
        <g style={fade(0.06, 0.12)}>
          <rect x={580} y={48} width={22} height={22} rx={3} className='dg-fill' />
          <path d='M586 59H596M591 54V64' className='dg-line' />
        </g>
        {LOTS.map((d, i) => (
          <path key={d} d={d} pathLength={1} className={i === 1 ? 'dg-accent' : 'dg-line'} style={draw(0.06 + i * 0.03, 0.18 + i * 0.03)} />
        ))}
        <path d={LOTS[1]} className='dg-wash' style={fade(0.2, 0.26)} />
        {LOT_B_VERTICES.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} className='dg-fill dg-accent' style={fade(0.24, 0.3)} />
        ))}
        <text x={246} y={120} className='dg-small' style={fade(0.24, 0.3)}>land lot</text>
      </g>

      {/* the data chain */}
      <text x={24} y={204} className='dg-dim dg-small' style={fade(0.2, 0.26)}>TA Farm</text>
      <text x={512} y={204} className='dg-dim dg-small' style={fade(0.2, 0.26)}>TA Market</text>
      {CHAIN.map((label, i) => (
        <g key={label}>
          <g style={fade(0.2 + i * 0.07, 0.26 + i * 0.07)}>
            <rect x={CHIP_X(i)} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={5} className='dg-fill' />
            <text x={CHIP_X(i) + CHIP_W / 2} y={CHIP_Y + CHIP_H / 2} textAnchor='middle'>{label}</text>
          </g>
          <rect x={CHIP_X(i)} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={5} className='dg-wash dg-accent' style={fade(0.26 + i * 0.08, 0.3 + i * 0.08)} />
          {i < CHAIN.length - 1 && (
            <path d={`M${CHIP_X(i) + CHIP_W} ${CHIP_Y + CHIP_H / 2}H${CHIP_X(i + 1)}`} pathLength={1} className='dg-accent' style={draw(0.22 + i * 0.07, 0.28 + i * 0.07)} />
          )}
        </g>
      ))}
      <circle cx={CHIP_X(0) + CHIP_W / 2} cy={CHIP_Y + CHIP_H + 8} r={3.5} className='dg-solid' style={{ ...travel(0.26, 0.62, 4 * 122), ...pulse(0.24, 0.64) }} />

      {/* product to QR */}
      <path d={`M${CHIP_X(4) + CHIP_W / 2} ${CHIP_Y + CHIP_H}V296H102V318`} pathLength={1} className='dg-accent dg-dash' style={draw(0.6, 0.7)} />
      <text x={QR_X} y={310} className='dg-dim dg-small' style={fade(0.62, 0.68)}>qr</text>

      {/* the QR code */}
      <g>
        {FINDERS.map(([r, c]) => {
          const x = QR_X + c * CELL
          const y = QR_Y + r * CELL
          return (
            <g key={`${r}-${c}`}>
              <path d={`M${x + CELL / 2} ${y + CELL / 2}h${6 * CELL}v${6 * CELL}h${-6 * CELL}z`} pathLength={1} fill='none' stroke='currentColor' strokeWidth={CELL} style={draw(0.62, 0.7)} />
              <rect x={x + 2 * CELL} y={y + 2 * CELL} width={3 * CELL} height={3 * CELL} className='dg-ink' style={fade(0.68, 0.72)} />
            </g>
          )
        })}
        {BANDS_D.map((d, i) => (
          <path key={i} d={d} className='dg-ink' style={fade(0.68 + i * 0.015, 0.72 + i * 0.015)} />
        ))}
        <rect x={QR_X - 6} y={QR_Y + 2} width={N * CELL + 12} height={2.4} rx={1.2} className='dg-solid' style={{ ...travel(0.8, 0.92, 0, N * CELL - 6), ...pulse(0.8, 0.93) }} />
      </g>

      {/* the public trace page it opens */}
      <path d='M176 382H256M248 376L256 382L248 388' pathLength={1} className='dg-accent dg-dash' style={draw(0.78, 0.86)} />
      <g style={rise(0.8, 0.9, 0, 14)}>
        <rect x={270} y={308} width={346} height={140} rx={6} className='dg-fill' />
        <text x={286} y={326} className='dg-dim dg-small'>product · public trace page</text>
        <path d='M286 338H600' className='dg-edge' />
      </g>
      {TRACE.map((label, i) => {
        const y = 358 + i * 22
        const a = 0.86 + i * 0.025
        return (
          <g key={label}>
            <circle cx={292} cy={y} r={6} className='dg-fill dg-accent' style={fade(a, a + 0.03)} />
            <path d={`M289 ${y}L291.2 ${y + 2.2}L295 ${y - 2.4}`} pathLength={1} className='dg-accent' style={draw(a, a + 0.04)} />
            <text x={308} y={y} style={fade(a, a + 0.03)}>{label}</text>
            <path d={`M420 ${y}H${580 - i * 34}`} pathLength={1} className='dg-edge' style={{ ...draw(a, a + 0.05), strokeWidth: 5 }} />
          </g>
        )
      })}
    </svg>
  )
}
