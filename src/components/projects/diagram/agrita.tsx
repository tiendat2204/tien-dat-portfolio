import { draw, fade, pulse, rise, travel } from '@/components/projects/diagram/anim'
import {
  ACTIVE_LOT,
  LOT_THUMB,
  LOT_VERTICES,
  LOTS,
  QR_BANDS,
  QR_CELL,
  QR_FINDERS,
  QR_FIXED,
  QR_SIZE,
  QR_X,
  QR_Y,
} from '@/components/projects/diagram/agrita-parts'

/*
  AgriTA, one wireframe: the TA Farm map with its land lots (top), the data chain land lot -> crop season -> harvest lot
  -> stock lot -> product as five blocks (middle), then the product's QR code that gets scanned and the public trace page
  on TA Market walking the chain back (bottom). Beats of `--p`: 0-0.25 the empty frames; 0.25-0.75 a lot is picked,
  a record runs down the chain, the QR prints and a beam scans it; 0.75-0.95 the trace page ticks its rows.
*/

const CHAIN = 5
const BLOCK_W = 96
const BLOCK_H = 48
const BLOCK_Y = 226
const BLOCK_X = (i: number) => 24 + i * 124
const RUN: [number, number] = [0.34, 0.56]
const passAt = (i: number) => RUN[0] + ((RUN[1] - RUN[0]) * i) / (CHAIN - 1)

const PAGE = { x: 244, y: QR_Y, w: 372, h: QR_SIZE }
const ROW_Y = (i: number) => 358 + i * 26
const tickAt = (i: number) => 0.78 + i * 0.03

export function AgritaDiagram () {
  return (
    <svg
      viewBox='0 0 640 520'
      role='img'
      aria-label='AgriTA: land lots on the TA Farm map, the data chain from land lot to product, and a product QR code scanned to open the public trace page'
      className='dg'
    >
      {/* ---- TA Farm: the map with its land lots, one picked for editing ---- */}
      <rect x={24} y={24} width={592} height={176} pathLength={1} className='dg-fill' style={draw(0, 0.08)} />
      <path d='M24 118C120 108 200 128 320 112S520 92 616 104' pathLength={1} className='dg-edge' style={draw(0.04, 0.14)} />
      {LOTS.map((d, i) => (
        <path key={d} d={d} pathLength={1} className={i === ACTIVE_LOT ? 'dg-accent' : 'dg-line'} style={draw(0.06 + i * 0.02, 0.14 + i * 0.02)} />
      ))}
      <path d={LOTS[ACTIVE_LOT]} className='dg-wash' style={fade(0.25, 0.31)} />
      {LOT_VERTICES.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width={8} height={8} className='dg-solid' style={fade(0.28, 0.34)} />
      ))}
      <text x={254} y={88} textAnchor='middle' style={fade(0.3, 0.36)}>land lot</text>

      {/* ---- The data chain: five blocks, a record running down them ---- */}
      {Array.from({ length: CHAIN }, (_, i) => {
        const x = BLOCK_X(i)
        const a = 0.1 + i * 0.025
        const cy = BLOCK_Y + BLOCK_H / 2
        return (
          <g key={i}>
            <g style={rise(a, a + 0.06, 0, 8)}>
              <rect x={x} y={BLOCK_Y} width={BLOCK_W} height={BLOCK_H} className='dg-fill' />
              <path d={`M${x + 24} ${cy}H${x + 72}`} className='dg-edge' style={{ strokeWidth: 6 }} />
            </g>
            {i < CHAIN - 1 ? <path d={`M${x + BLOCK_W} ${cy}H${x + 124}`} pathLength={1} className='dg-edge' style={draw(a + 0.04, a + 0.08)} /> : null}
            <rect x={x} y={BLOCK_Y} width={BLOCK_W} height={BLOCK_H} className='dg-wash' style={pulse(passAt(i) - 0.03, passAt(i) + 0.08, 0.02)} />
          </g>
        )
      })}
      <rect x={BLOCK_X(0) + BLOCK_W / 2 - 6} y={BLOCK_Y + BLOCK_H / 2 - 6} width={12} height={12} className='dg-solid' style={{ ...travel(RUN[0], RUN[1], 4 * 124), ...pulse(RUN[0] - 0.03, RUN[1] + 0.04) }} />

      {/* ---- The product's QR code, printed then scanned ---- */}
      <rect x={QR_X - 8} y={QR_Y - 8} width={QR_SIZE + 16} height={QR_SIZE + 16} pathLength={1} className='dg-fill' style={draw(0.14, 0.22)} />
      {QR_FINDERS.map(([r, c]) => {
        const x = QR_X + c * QR_CELL
        const y = QR_Y + r * QR_CELL
        return (
          <g key={`${r}-${c}`}>
            <path d={`M${x + QR_CELL / 2} ${y + QR_CELL / 2}h${6 * QR_CELL}v${6 * QR_CELL}h${-6 * QR_CELL}z`} pathLength={1} fill='none' stroke='currentColor' strokeWidth={QR_CELL} style={draw(0.48, 0.56)} />
            <rect x={x + 2 * QR_CELL} y={y + 2 * QR_CELL} width={3 * QR_CELL} height={3 * QR_CELL} className='dg-ink' style={fade(0.54, 0.58)} />
          </g>
        )
      })}
      <path d={QR_FIXED} className='dg-ink' style={fade(0.56, 0.6)} />
      {QR_BANDS.map((d, i) => (
        <path key={i} d={d} className='dg-ink' style={fade(0.56 + i * 0.015, 0.6 + i * 0.015)} />
      ))}
      <text x={QR_X + QR_SIZE / 2} y={QR_Y + QR_SIZE + 20} textAnchor='middle' className='dg-dim' style={fade(0.6, 0.66)}>qr</text>
      <rect x={QR_X - 8} y={QR_Y} width={QR_SIZE + 16} height={3} className='dg-solid' style={{ ...travel(0.66, 0.76, 0, QR_SIZE - 3), ...pulse(0.66, 0.78) }} />
      <path d={`M${QR_X + QR_SIZE + 12} ${QR_Y + QR_SIZE / 2}H${PAGE.x - 4}`} pathLength={1} className='dg-accent dg-dash' style={draw(0.75, 0.8)} />

      {/* ---- The public trace page on TA Market, walking the chain back to the land lot ---- */}
      <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} pathLength={1} className='dg-fill' style={draw(0.16, 0.24)} />
      <path d={`M${PAGE.x} ${PAGE.y + 30}H${PAGE.x + PAGE.w}`} pathLength={1} className='dg-edge' style={draw(0.2, 0.26)} />
      <text x={PAGE.x + 14} y={PAGE.y + 15} style={fade(0.76, 0.8)}>trace</text>
      {Array.from({ length: CHAIN }, (_, i) => {
        const y = ROW_Y(i)
        const bar = `M${PAGE.x + 44} ${y}H${PAGE.x + 190 - i * 18}`
        return (
          <g key={i}>
            <rect x={PAGE.x + 16} y={y - 5} width={10} height={10} className='dg-fill' style={fade(0.22 + i * 0.01, 0.26 + i * 0.01)} />
            <path d={bar} className='dg-edge' style={{ ...fade(0.22 + i * 0.01, 0.26 + i * 0.01), strokeWidth: 6 }} />
            <rect x={PAGE.x + 16} y={y - 5} width={10} height={10} className='dg-solid' style={fade(tickAt(i), tickAt(i) + 0.03)} />
            <path d={bar} pathLength={1} className='dg-line' style={{ ...draw(tickAt(i), tickAt(i) + 0.05), strokeWidth: 6 }} />
          </g>
        )
      })}
      <path d={LOT_THUMB} className='dg-accent' style={fade(0.9, 0.95)} />
      <path d={LOT_THUMB} className='dg-wash' style={fade(0.9, 0.95)} />
    </svg>
  )
}
