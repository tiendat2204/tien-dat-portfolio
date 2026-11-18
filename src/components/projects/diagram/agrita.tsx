import { draw, fade, pulse, seg, travel } from '@/components/projects/diagram/anim'
import {
  ACTIVE_LOT,
  BLOCK,
  CELL,
  CHAIN,
  LOT_LABEL,
  LOT_THUMB,
  LOT_VERTICES,
  LOTS,
  MAP,
  PAGE,
  QR_BANDS,
  QR_CELL,
  QR_FINDERS,
  QR_FIXED,
  QR_FRAME,
  QR_SIZE,
  QR_X,
  QR_Y,
  STACK,
  TRACE,
  blockX,
  cellX,
  rowY,
} from '@/components/projects/diagram/agrita-parts'

/*
  AgriTA in one frame: the TA Farm map with its land lots (top), the data chain land lot -> season -> harvest -> stock
  -> product (middle), the product's QR printed and scanned (right) and the public trace page on TA Market walking the
  chain back to the lot (left). Below, one cell per layer of the frontend stack lights up as the action touches it.
  Beats of `--p`: 0-0.18 the ghosted wireframe comes to full strength; 0.18-0.58 a lot is picked and its record runs
  down the chain; 0.58-0.78 the QR prints and a beam scans it; 0.78-0.97 the trace page ticks its rows back to the lot.
*/

const RUN: [number, number] = [0.42, 0.58]
const passAt = (i: number) => RUN[0] + ((RUN[1] - RUN[0]) * i) / (CHAIN.length - 1)
const tickAt = (i: number) => 0.8 + i * 0.025

const CMD = '$ npx playwright test'
const CMD_W = CMD.length * 6.6
const CMD_Y = 476
const TYPE: [number, number] = [0.86, 0.96]

export function AgritaDiagram () {
  return (
    <svg
      viewBox='0 0 640 520'
      role='img'
      aria-label='AgriTA: land lots on the TA Farm map, the data chain from land lot to product, a product QR code scanned to open the public trace page, and the frontend stack below'
      className='dg'
    >
      <defs>
        <clipPath id='agrita-type'>
          <rect x={24} y={CMD_Y - 10} width={CMD_W} height={20} style={{ width: `calc(${seg(...TYPE)} * ${CMD_W}px)` }} />
        </clipPath>
      </defs>
      <g style={{ opacity: `calc(0.3 + 0.7 * ${seg(0, 0.18)})` }}>
        {/* ---- TA Farm: the map with its land lots, one picked for editing ---- */}
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} className='dg-fill' />
        <path d={`M${MAP.x} ${MAP.y + 24}H${MAP.x + MAP.w}`} className='dg-edge' />
        <text x={MAP.x + 12} y={MAP.y + 12}>TA Farm</text>
        <text x={MAP.x + MAP.w - 12} y={MAP.y + 12} textAnchor='end' className='dg-dim'>land lots · crop seasons · work tasks</text>
        <path d={`M${MAP.x} 104C120 98 200 112 320 102S520 92 ${MAP.x + MAP.w} 98`} className='dg-edge dg-dash' />
        {LOTS.map((d, i) => (
          <path key={d} d={d} className={i === ACTIVE_LOT ? 'dg-accent' : 'dg-line'} />
        ))}
        <path d={LOTS[ACTIVE_LOT]} className='dg-wash' style={fade(0.2, 0.26)} />
        {LOT_VERTICES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width={8} height={8} className='dg-solid' style={fade(0.24, 0.3)} />
        ))}
        <text x={LOT_LABEL[0]} y={LOT_LABEL[1]} textAnchor='middle' style={fade(0.26, 0.32)}>land lot</text>
        <path d={`M${blockX(0) + BLOCK.w / 2} ${MAP.y + MAP.h}V${BLOCK.y}`} pathLength={1} className='dg-accent dg-dash' style={draw(0.32, 0.36)} />

        {/* ---- The data chain: five blocks, a record running down them ---- */}
        {CHAIN.map((label, i) => {
          const x = blockX(i)
          const cy = BLOCK.y + BLOCK.h / 2
          return (
            <g key={label}>
              <rect x={x} y={BLOCK.y} width={BLOCK.w} height={BLOCK.h} className='dg-fill' />
              <text x={x + BLOCK.w / 2} y={cy} textAnchor='middle'>{label}</text>
              {i < CHAIN.length - 1 ? <path d={`M${x + BLOCK.w} ${cy}H${x + BLOCK.step}`} className='dg-edge' /> : null}
              <rect x={x} y={BLOCK.y} width={BLOCK.w} height={BLOCK.h} className='dg-wash' style={pulse(passAt(i) - 0.03, passAt(i) + 0.07, 0.02)} />
            </g>
          )
        })}
        <rect x={blockX(0) + BLOCK.w / 2 - 4} y={BLOCK.y + BLOCK.h - 10} width={8} height={8} className='dg-solid' style={{ ...travel(RUN[0], RUN[1], 4 * BLOCK.step), ...pulse(RUN[0] - 0.06, RUN[1] + 0.03) }} />
        <path d={`M${blockX(4) + BLOCK.w / 2} ${BLOCK.y + BLOCK.h}V${QR_FRAME.y}`} pathLength={1} className='dg-accent dg-dash' style={draw(0.56, 0.6)} />

        {/* ---- The product's QR code, printed then scanned ---- */}
        <rect x={QR_FRAME.x} y={QR_FRAME.y} width={QR_FRAME.w} height={QR_FRAME.h} className='dg-fill' />
        {QR_FINDERS.map(([r, c]) => {
          const x = QR_X + c * QR_CELL
          const y = QR_Y + r * QR_CELL
          return (
            <g key={`${r}-${c}`}>
              <path d={`M${x + QR_CELL / 2} ${y + QR_CELL / 2}h${6 * QR_CELL}v${6 * QR_CELL}h${-6 * QR_CELL}z`} pathLength={1} fill='none' stroke='currentColor' strokeWidth={QR_CELL} style={draw(0.58, 0.64)} />
              <rect x={x + 2 * QR_CELL} y={y + 2 * QR_CELL} width={3 * QR_CELL} height={3 * QR_CELL} className='dg-ink' style={fade(0.62, 0.65)} />
            </g>
          )
        })}
        <path d={QR_FIXED} className='dg-ink' style={fade(0.63, 0.66)} />
        {QR_BANDS.map((d, i) => (
          <path key={i} d={d} className='dg-ink' style={fade(0.64 + i * 0.012, 0.67 + i * 0.012)} />
        ))}
        <rect x={QR_X - 4} y={QR_Y} width={QR_SIZE + 8} height={3} className='dg-solid' style={{ ...travel(0.7, 0.78, 0, QR_SIZE - 3), ...pulse(0.69, 0.8) }} />
        <path d={`M${QR_FRAME.x - 4} ${QR_Y + QR_SIZE / 2}H${PAGE.x + PAGE.w + 4}`} pathLength={1} className='dg-accent dg-dash' style={draw(0.78, 0.81)} />

        {/* ---- The public trace page on TA Market, walking the chain back to the land lot ---- */}
        <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} className='dg-fill' />
        <path d={`M${PAGE.x} ${PAGE.y + 22}H${PAGE.x + PAGE.w}`} className='dg-edge' />
        <text x={PAGE.x + 12} y={PAGE.y + 11}>trace</text>
        <text x={PAGE.x + PAGE.w - 12} y={PAGE.y + 11} textAnchor='end' className='dg-dim'>TA Market</text>
        {TRACE.map((label, i) => {
          const y = rowY(i)
          const bar = `M${PAGE.x + 116} ${y}H${PAGE.x + 300 - i * 24}`
          return (
            <g key={label}>
              <rect x={PAGE.x + 12} y={y - 4} width={8} height={8} className='dg-fill' />
              <path d={bar} className='dg-edge' style={{ strokeWidth: 5 }} />
              <text x={PAGE.x + 30} y={y} className='dg-dim' style={{ fontSize: 10 }}>{label}</text>
              <rect x={PAGE.x + 12} y={y - 4} width={8} height={8} className='dg-solid' style={fade(tickAt(i), tickAt(i) + 0.02)} />
              <path d={bar} pathLength={1} className='dg-line' style={{ ...draw(tickAt(i), tickAt(i) + 0.04), strokeWidth: 5 }} />
            </g>
          )
        })}
        <path d={LOT_THUMB} className='dg-accent' style={fade(0.92, 0.96)} />
        <path d={LOT_THUMB} className='dg-wash' style={fade(0.92, 0.96)} />

        {/* ---- The stack strip: one cell per layer, lit when the action touches it ---- */}
        {STACK.map(({ label, tech, lit }, i) => {
          const x = cellX(i)
          return (
            <g key={label}>
              <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-fill' />
              <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-wash' style={pulse(lit[0], lit[1])} />
              <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-accent' style={pulse(lit[0], lit[1])} />
              <text x={x + 10} y={CELL.y + 18} className='dg-dim' style={{ fontSize: 10 }}>{label}</text>
              <text x={x + 10} y={CELL.y + CELL.h - 18} style={{ fontSize: 10 }}>{tech}</text>
            </g>
          )
        })}

        {/* ---- The signature line, typed with a clip that grows with the scroll ---- */}
        <text x={24} y={CMD_Y} textLength={CMD_W} lengthAdjust='spacingAndGlyphs' clipPath='url(#agrita-type)' style={fade(0.84, 0.86)}>{CMD}</text>
        <rect x={24} y={CMD_Y - 7} width={7} height={14} className='dg-solid' style={{ ...travel(...TYPE, CMD_W), ...pulse(0.84, 0.99) }} />
      </g>
    </svg>
  )
}
