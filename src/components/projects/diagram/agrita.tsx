import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import {
  ACTIVE_LOT,
  AXIS_BOTTOM,
  AXIS_TOP,
  AXIS_X,
  BOARDS,
  LOT_MIDPOINTS,
  LOT_THUMB,
  LOT_VERTICES,
  LOTS,
  QR_BANDS,
  QR_CELL,
  QR_FINDERS,
  QR_SIZE,
  QR_X,
  QR_Y,
} from '@/components/projects/diagram/agrita-parts'

/*
  AgriTA, one sheet: a land lot drawn on the TA Farm map and the apps' frontend stack opened into its layers (top),
  the data chain land lot -> crop season -> harvest lot -> stock lot -> product -> QR trace (middle), then the product
  label with its QR code, the phone that scans it and the public trace page on TA Market walking the chain back
  (bottom). Scroll phases of `--p`: 0-0.22 draw the map and the stack, 0.22-0.45 open the stack and lay the chain,
  0.45-0.72 run a record down the chain while the label prints and the command types, 0.72-0.9 scan the QR,
  0.86-1 the trace page fills and the publish result lands. Facts only: labels are the product's domain terms and the
  real libraries; nothing here is the client's code, names or routes.
*/

const DOTO: CSSProperties = { fontFamily: 'var(--font-doto)', fontWeight: 800 }
const ACCENT_TEXT: CSSProperties = { fill: 'hsl(var(--primary))' }

const CHAIN = ['land lot', 'crop season', 'harvest lot', 'stock lot', 'product', 'QR trace']
const CHIP_W = 90
const CHIP_H = 34
const CHIP_GAP = 104
const CHIP_X = (i: number) => 15 + i * CHIP_GAP
const CHIP_Y = 262
// Which board a chain step lives on (balloon number), where that is one screen: the land lot form, the guarded
// harvest-lot route, the stock table's query, the trace-code publish call.
const CHIP_TAG: Record<number, number> = { 0: 4, 2: 2, 3: 3, 5: 5 }

// The record runs down the chain over this window; each chip passes at its share of it.
const RUN: [number, number] = [0.5, 0.72]
const passAt = (i: number) => RUN[0] + ((RUN[1] - RUN[0]) * i) / (CHAIN.length - 1)

const CMD = '$ publish trace-code --harvest-lot'
const CMD_W = CMD.length * 6.6
const TYPE: [number, number] = [0.52, 0.68]

// `+` crosshair corner marks on a drawn sub-panel.
function Crosshairs ({ x, y, w, h, a, b }: { x: number, y: number, w: number, h: number, a: number, b: number }) {
  const d = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([cx, cy]) => `M${cx! - 4} ${cy}H${cx! + 4}M${cx} ${cy! - 4}V${cy! + 4}`)
    .join('')
  return <path d={d} className='dg-line' style={{ ...fade(a, b), strokeWidth: 0.8 }} />
}

// A numbered balloon: the circle with its numeral, drawn in with a fade.
function Balloon ({ x, y, n, a, b, accent = false }: { x: number, y: number, n: number, a: number, b: number, accent?: boolean }) {
  return (
    <g style={fade(a, b)}>
      <circle cx={x} cy={y} r={6.5} className={accent ? 'dg-fill dg-accent' : 'dg-fill'} />
      <text x={x} y={y + 0.5} textAnchor='middle' className='dg-small'>{n}</text>
    </g>
  )
}

export function AgritaDiagram () {
  const typed = seg(TYPE[0], TYPE[1])
  return (
    <svg
      viewBox='0 0 640 520'
      role='img'
      aria-label='AgriTA: a land lot on the TA Farm map and the frontend stack opened into its layers; the chain land lot, crop season, harvest lot, stock lot, product and QR trace; a product label whose QR code a phone scans to open the public trace page on TA Market'
      className='dg'
    >
      <defs>
        <mask id='agrita-cmd' maskUnits='userSpaceOnUse' x={14} y={484} width={260} height={24}>
          <rect x={14} y={484} height={24} fill='#fff' style={{ width: `calc(${typed} * ${CMD_W + 6}px)` }} />
        </mask>
      </defs>

      {/* ---- TA Farm: the map panel, land lots as polygons, lot B in Geoman edit mode ---- */}
      <g>
        <rect x={20} y={20} width={310} height={180} rx={4} pathLength={1} className='dg-fill' style={draw(0, 0.08)} />
        <Crosshairs x={26} y={26} w={298} h={168} a={0.06} b={0.12} />
        <text x={36} y={36} style={{ ...fade(0.04, 0.1), fontSize: 10 }}>TA Farm · land lots</text>
        <text x={306} y={36} textAnchor='end' className='dg-dim dg-small' style={fade(0.04, 0.1)}>map</text>
        {/* basemap: a road, a canal and a graticule, faint */}
        <path d='M20 96C80 92 120 104 180 100S280 86 330 94' pathLength={1} className='dg-edge' style={draw(0.04, 0.14)} />
        <path d='M150 20C140 70 170 120 160 200' pathLength={1} className='dg-edge dg-dash' style={draw(0.06, 0.16)} />
        <path d='M26 130H324M130 26V194' className='dg-edge' style={{ ...fade(0.06, 0.12), strokeWidth: 0.5 }} />
        {/* Geoman toolbar: draw polygon, edit vertices, cut; zoom control */}
        <g style={fade(0.08, 0.14)}>
          <rect x={30} y={48} width={16} height={46} rx={3} className='dg-fill' />
          <path d='M34 58L42 55L43 61L36 63Z' className='dg-line' style={{ strokeWidth: 0.9 }} />
          <path d='M34 72H42V78H34Z' className='dg-line' style={{ strokeWidth: 0.9 }} />
          <path d='M34 88L42 90M42 88L34 90' className='dg-line' style={{ strokeWidth: 0.9 }} />
          <rect x={302} y={48} width={14} height={28} rx={3} className='dg-fill' />
          <path d='M306 55H312M309 52V58M306 69H312' className='dg-line' style={{ strokeWidth: 0.9 }} />
        </g>
        {LOTS.map((d, i) => (
          <path key={d} d={d} pathLength={1} className={i === ACTIVE_LOT ? 'dg-accent' : 'dg-line'} style={draw(0.08 + i * 0.02, 0.18 + i * 0.02)} />
        ))}
        <path d={LOTS[ACTIVE_LOT]} className='dg-wash' style={fade(0.2, 0.26)} />
        {LOT_MIDPOINTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2} className='dg-fill dg-accent' style={fade(0.24, 0.3)} />
        ))}
        {LOT_VERTICES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width={6} height={6} className='dg-fill dg-accent' style={fade(0.22, 0.28)} />
        ))}
        <text x={236} y={96} textAnchor='middle' style={{ ...fade(0.24, 0.3), fontSize: 10 }}>land lot</text>
        <text x={236} y={108} textAnchor='middle' className='dg-dim dg-small' style={fade(0.24, 0.3)}>polygon · edit vertices</text>
        {/* dimension ticks along the lot's top edge */}
        <path d='M176 52V58M278 44V50M176 55L278 47' className='dg-line' style={{ ...fade(0.26, 0.32), strokeWidth: 0.6 }} />
        {/* scale bar */}
        <path d='M254 184H314M254 181V187M284 182V187M314 181V187' className='dg-line' style={{ ...fade(0.1, 0.16), strokeWidth: 0.8 }} />
        <text x={36} y={212} className='dg-dim dg-small' style={fade(0.12, 0.18)}>MapLibre GL basemap · Leaflet + Geoman draw / edit</text>
      </g>

      {/* ---- The frontend stack, opened into its layers with numbered balloons ---- */}
      <g>
        <path d={`M${AXIS_X} ${AXIS_BOTTOM}V${AXIS_TOP}`} pathLength={1} className='dg-line dg-dash' style={{ ...draw(0.22, 0.4), strokeWidth: 0.7 }} />
        {[...BOARDS].reverse().map((board, k) => {
          const open = seg(0.22, 0.4)
          const chip = Object.entries(CHIP_TAG).find(([, n]) => n === board.n)
          const at = chip ? passAt(Number(chip[0])) : -1
          return (
            <g key={board.layer.id} style={{ transform: `translate(0, calc(-1 * ${open} * ${board.lift}px))` }}>
              <g style={fade(0.08 + k * 0.025, 0.14 + k * 0.025)}>
                <g className='iso-solid'>
                  <path className='iso-fill' d={board.solid.fill} />
                  {board.solid.shades.map((d, s) => (d ? <path key={s} className='iso-shade' data-shade={s} d={d} /> : null))}
                  <path className='iso-top' d={board.solid.top} />
                  {board.solid.crease ? <path className='iso-line' data-tone='faint' d={board.solid.crease} /> : null}
                  <path className='iso-line' data-tone='mid' d={board.solid.outline} />
                </g>
                <path d={board.inset} className='iso-line' data-tone='faint' />
                <text x={board.label[0]} y={board.label[1]} textAnchor='middle' style={{ fontSize: 10 }}>{board.layer.label}</text>
              </g>
              {at >= 0 ? <path d={board.solid.top} className='dg-wash' style={pulse(at - 0.02, at + 0.06, 0.02)} /> : null}
              <path d={`M${board.root[0]} ${board.root[1]}L${board.balloon[0] - 6} ${board.balloon[1] + 2}`} pathLength={1} className='dg-line' style={{ ...draw(0.3 + k * 0.03, 0.38 + k * 0.03), strokeWidth: 0.7 }} />
              <circle cx={board.root[0]} cy={board.root[1]} r={1.2} className='dg-ink' style={fade(0.3 + k * 0.03, 0.34 + k * 0.03)} />
              <Balloon x={board.balloon[0]} y={board.balloon[1]} n={board.n} a={0.36 + k * 0.03} b={0.42 + k * 0.03} />
              <text x={board.balloon[0] + 11} y={board.balloon[1] - 5} style={{ ...fade(0.38 + k * 0.03, 0.44 + k * 0.03), fontSize: 10 }}>{board.layer.label}</text>
              <text x={board.balloon[0] + 11} y={board.balloon[1] + 6} className='dg-dim dg-small' style={fade(0.38 + k * 0.03, 0.44 + k * 0.03)}>{board.layer.tech}</text>
            </g>
          )
        })}
        <text x={AXIS_X} y={232} textAnchor='middle' className='dg-dim dg-small' style={fade(0.4, 0.46)}>rest api · openapi 3 · backend team (external)</text>
      </g>

      {/* ---- The data chain, one chip per step, bracketed by the app that owns it ---- */}
      <g>
        <path d={`M${CHIP_X(0)} 257V254H${CHIP_X(3) + CHIP_W}V257`} pathLength={1} className='dg-edge' style={draw(0.24, 0.3)} />
        <text x={(CHIP_X(0) + CHIP_X(3) + CHIP_W) / 2} y={246} textAnchor='middle' className='dg-dim dg-small' style={fade(0.24, 0.3)}>TA Farm · Vite SPA</text>
        <path d={`M${CHIP_X(4)} 257V254H${CHIP_X(5) + CHIP_W}V257`} pathLength={1} className='dg-edge' style={draw(0.42, 0.48)} />
        <text x={(CHIP_X(4) + CHIP_X(5) + CHIP_W) / 2} y={246} textAnchor='middle' className='dg-dim dg-small' style={fade(0.42, 0.48)}>TA Market · Next.js 16</text>
        {CHAIN.map((label, i) => {
          const x = CHIP_X(i)
          const a = 0.24 + i * 0.045
          const tag = CHIP_TAG[i]
          return (
            <g key={label}>
              <g style={rise(a, a + 0.05, 0, 6)}>
                <rect x={x} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={4} className='dg-fill' />
                <text x={x + CHIP_W / 2} y={CHIP_Y + CHIP_H / 2} textAnchor='middle'>{label}</text>
              </g>
              <rect x={x} y={CHIP_Y} width={CHIP_W} height={CHIP_H} rx={4} className='dg-wash dg-accent' style={pulse(passAt(i) - 0.03, passAt(i) + 0.06, 0.02)} />
              {i < CHAIN.length - 1
                ? <path d={`M${x + CHIP_W} ${CHIP_Y + CHIP_H / 2}H${x + CHIP_GAP}M${x + CHIP_GAP - 4} ${CHIP_Y + CHIP_H / 2 - 3}L${x + CHIP_GAP} ${CHIP_Y + CHIP_H / 2}L${x + CHIP_GAP - 4} ${CHIP_Y + CHIP_H / 2 + 3}`} pathLength={1} className='dg-accent' style={draw(a + 0.03, a + 0.08)} />
                : null}
              {tag ? <Balloon x={x + CHIP_W - 2} y={CHIP_Y - 2} n={tag} a={0.44 + i * 0.01} b={0.5 + i * 0.01} accent /> : null}
            </g>
          )
        })}
        <circle cx={CHIP_X(0) + CHIP_W / 2} cy={CHIP_Y + CHIP_H + 7} r={3.2} className='dg-solid' style={{ ...travel(RUN[0], RUN[1], 5 * CHIP_GAP), ...pulse(RUN[0] - 0.02, RUN[1] + 0.03) }} />
        <text x={CHIP_X(0) + CHIP_W / 2 + 8} y={CHIP_Y + CHIP_H + 8} className='dg-dim dg-small' style={{ ...travel(RUN[0], RUN[1], 5 * CHIP_GAP), ...pulse(RUN[0] - 0.02, RUN[1] + 0.03) }}>record</text>
      </g>

      {/* ---- The product label with its QR code ---- */}
      <g>
        <rect x={20} y={310} width={180} height={166} rx={3} className='dg-edge dg-dash' style={fade(0.56, 0.62)} fill='none' />
        <rect x={25} y={315} width={170} height={156} rx={2} pathLength={1} className='dg-fill' style={draw(0.56, 0.64)} />
        <text x={34} y={326} style={{ ...fade(0.6, 0.66), fontSize: 10 }}>product label</text>
        <text x={186} y={326} textAnchor='end' className='dg-dim dg-small' style={fade(0.6, 0.66)}>lot</text>
        {/* label fields: name, lot, origin as hatched bars (no real data) */}
        {['name', 'lot', 'origin'].map((f, i) => (
          <g key={f} style={fade(0.62 + i * 0.02, 0.68 + i * 0.02)}>
            <text x={136} y={344 + i * 26} className='dg-dim dg-small'>{f}</text>
            <rect x={136} y={349 + i * 26} width={52 - i * 10} height={5} rx={1.5} className='dg-edge' fill='hsl(var(--border))' />
          </g>
        ))}
        <text x={136} y={430} className='dg-dim dg-small' style={fade(0.68, 0.74)}>scan to</text>
        <text x={136} y={441} className='dg-dim dg-small' style={fade(0.68, 0.74)}>trace</text>
        {QR_FINDERS.map(([r, c]) => {
          const x = QR_X + c * QR_CELL
          const y = QR_Y + r * QR_CELL
          return (
            <g key={`${r}-${c}`}>
              <path d={`M${x + QR_CELL / 2} ${y + QR_CELL / 2}h${6 * QR_CELL}v${6 * QR_CELL}h${-6 * QR_CELL}z`} pathLength={1} fill='none' stroke='currentColor' strokeWidth={QR_CELL} style={draw(0.6, 0.68)} />
              <rect x={x + 2 * QR_CELL} y={y + 2 * QR_CELL} width={3 * QR_CELL} height={3 * QR_CELL} className='dg-ink' style={fade(0.66, 0.7)} />
            </g>
          )
        })}
        {QR_BANDS.map((d, i) => (
          <path key={i} d={d} className='dg-ink' style={fade(0.66 + i * 0.012, 0.7 + i * 0.012)} />
        ))}
        <text x={QR_X} y={448} className='dg-dim dg-small' style={fade(0.7, 0.76)}>qr · trace code</text>
        <text x={QR_X} y={460} className='dg-dim dg-small' style={fade(0.7, 0.76)}>from the harvest lot</text>
        {/* the scan: a beam sweeps the matrix while the phone looks at it */}
        <rect x={QR_X - 4} y={QR_Y} width={QR_SIZE + 8} height={2} rx={1} className='dg-solid' style={{ ...travel(0.76, 0.86, 0, QR_SIZE - 2), ...pulse(0.76, 0.88) }} />
      </g>

      {/* ---- The phone that scans the label ---- */}
      <g>
        <path d={`M224 393L${QR_X + QR_SIZE + 4} ${QR_Y}L${QR_X + QR_SIZE + 4} ${QR_Y + QR_SIZE}Z`} className='dg-wash' style={pulse(0.74, 0.88)} />
        <path d={`M224 393L${QR_X + QR_SIZE + 4} ${QR_Y}M224 393L${QR_X + QR_SIZE + 4} ${QR_Y + QR_SIZE}`} className='dg-accent dg-dash' style={{ ...pulse(0.74, 0.88), strokeWidth: 0.8 }} />
        <text x={176} y={386} textAnchor='middle' className='dg-small' style={{ ...pulse(0.76, 0.88), ...ACCENT_TEXT }}>scan</text>
        <rect x={218} y={310} width={80} height={166} rx={10} pathLength={1} className='dg-fill' style={draw(0.7, 0.78)} />
        <rect x={224} y={322} width={68} height={142} rx={3} className='dg-edge' fill='none' style={fade(0.74, 0.8)} />
        <path d='M250 316H266' className='dg-line' style={{ ...fade(0.74, 0.8), strokeWidth: 1.4 }} />
        <text x={258} y={474} textAnchor='middle' className='dg-dim dg-small' style={fade(0.74, 0.8)}>phone</text>
        {/* viewfinder brackets during the scan */}
        <path d='M240 376V370H246M276 370H282V376M282 410V416H276M246 416H240V410' className='dg-accent' style={pulse(0.74, 0.88)} />
        <path d='M242 393H280' className='dg-accent' style={pulse(0.76, 0.88)} />
        {/* the trace page on the phone, then blown up into the panel on the right */}
        <g style={fade(0.86, 0.92)}>
          <rect x={229} y={328} width={58} height={6} rx={1.5} className='dg-solid' />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <circle cx={234} cy={348 + i * 18} r={2.2} className='dg-fill dg-accent' />
              <rect x={241} y={345 + i * 18} width={38 - i * 5} height={5} rx={1.5} fill='hsl(var(--border))' />
            </g>
          ))}
        </g>
        <path d='M292 322L316 310M292 464L316 476' pathLength={1} className='dg-line dg-dash' style={{ ...draw(0.86, 0.92), strokeWidth: 0.7 }} />
      </g>

      {/* ---- The public trace page on TA Market, walking the chain back to the land lot ---- */}
      <g>
        <g style={rise(0.84, 0.9, 0, 10)}>
          <rect x={316} y={310} width={312} height={166} rx={4} className='dg-fill' />
          <path d='M316 328H628' className='dg-edge' />
          {[328, 338, 348].map((cx) => <circle key={cx} cx={cx} cy={319} r={2.4} className='dg-edge' fill='none' />)}
          <rect x={360} y={313} width={256} height={12} rx={6} className='dg-fill' />
          <text x={488} y={319.5} textAnchor='middle' className='dg-dim dg-small'>ta market · public trace page · no sign-in</text>
        </g>
        <Crosshairs x={322} y={334} w={300} h={136} a={0.88} b={0.94} />
        <text x={334} y={347} style={{ ...fade(0.88, 0.94), ...DOTO, fontSize: 14 }}>TRACE</text>
        <text x={382} y={347} className='dg-dim dg-small' style={fade(0.88, 0.94)}>walk the chain back</text>
        <Balloon x={534} y={346} n={1} a={0.9} b={0.96} accent />
        <g style={fade(0.9, 0.96)}>
          <rect x={548} y={338} width={68} height={50} rx={2} className='dg-fill' />
          <path d={LOT_THUMB} className='dg-accent' />
          <path d={LOT_THUMB} className='dg-wash' />
          <text x={582} y={395} textAnchor='middle' className='dg-dim dg-small'>land lot</text>
        </g>
        <path d='M338 366V446' pathLength={1} className='dg-edge' style={draw(0.9, 1)} />
        {[...CHAIN.slice(0, 5)].reverse().map((label, i) => {
          const y = 366 + i * 20
          const a = 0.9 + i * 0.018
          return (
            <g key={label}>
              <circle cx={338} cy={y} r={5.5} className='dg-fill dg-accent' style={fade(a, a + 0.03)} />
              <path d={`M335.3 ${y}L337.4 ${y + 2.1}L341 ${y - 2.3}`} pathLength={1} className='dg-accent' style={draw(a, a + 0.04)} />
              <text x={352} y={y} style={{ ...fade(a, a + 0.03), fontSize: 10 }}>{label}</text>
              <path d={`M440 ${y}H${540 - i * 16}`} pathLength={1} className='dg-edge' style={{ ...draw(a, a + 0.05), strokeWidth: 5 }} />
            </g>
          )
        })}
        <text x={608} y={458} textAnchor='end' className='dg-small' style={{ ...fade(0.96, 1), ...ACCENT_TEXT }}>verified ✓</text>
      </g>

      {/* ---- The terminal line and the title block ---- */}
      <g>
        <text x={20} y={496} mask='url(#agrita-cmd)' style={fade(TYPE[0], TYPE[0] + 0.02)}>{CMD}</text>
        <rect x={20} y={490} width={6} height={12} className='dg-solid' style={{ transform: `translate(calc(${typed} * ${CMD_W + 2}px), 0)`, ...fade(TYPE[0], TYPE[0] + 0.02) }} />
        <text x={CMD_W + 34} y={496} className='dg-dim' style={fade(0.94, 0.98)}>→</text>
        <text x={CMD_W + 46} y={496} style={{ ...fade(0.94, 0.98), ...ACCENT_TEXT }}>201 published</text>
        <g style={fade(0.96, 1)}>
          <rect x={404} y={486} width={224} height={20} className='dg-fill' />
          <path d='M466 486V506M528 486V506M590 486V506' className='dg-edge' />
          <text x={410} y={496} style={{ ...DOTO, fontSize: 11 }}>AGRITA</text>
          <text x={472} y={496} className='dg-dim dg-small'>sheet 2/8</text>
          <text x={534} y={496} className='dg-dim dg-small'>scale 1:1</text>
          <text x={596} y={496} className='dg-dim dg-small'>rev 2</text>
        </g>
      </g>
    </svg>
  )
}
