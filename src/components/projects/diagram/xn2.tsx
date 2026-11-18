import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import { AXIS, BASE_FRONT, PACKET, PLATES, cableFan, crosshairs, dimH, dimV } from '@/components/projects/diagram/xn2-parts'

// XN2 admin console, as a spec sheet. Four phases over `--p` (see anim.ts):
//   0.00-0.30  the product: a cable-stayed bridge in side elevation with its dimension lines, a ferry crossing under it
//   0.26-0.62  the console: the records table and the template editor; the frontend stack rises and explodes into
//              its real layers (ui, routes, state, forms, api) with balloons
//   0.52-0.78  the action: the `between` filter is picked, a request packet walks down the stack and leaves for the
//              external REST API, which answers 200
//   0.78-1.00  the result: the matching rows light up, a pen stroke lands in the template, the terminal line types
// Facts only: layers from figures/xn2/config.ts; the API is another team's and is drawn as an external box.

const DOTO: CSSProperties = { fontFamily: 'var(--font-doto)', fontWeight: 800 }
const HAIR: CSSProperties = { strokeWidth: 0.8 }

// --- the bridge -------------------------------------------------------------------------------------------------------
const DECK = 118
const DECK_LOW = 125
const WATER = 166
const TOWERS = [200, 430]
const TOWER_TOP = 46
const REACH = [30, 58, 86, 114]
const RAIL = Array.from({ length: 24 }, (_, i) => `M${40 + i * 24} ${DECK}v-4`).join('') + `M40 ${DECK - 4}H592`
const WAVES = Array.from({ length: 35 }, (_, i) => `M${40 + i * 16} 180q4-3 8 0t8 0`).join('')
const tower = (x: number) => `M${x - 6} ${DECK_LOW}L${x - 3} ${TOWER_TOP}H${x + 3}L${x + 6} ${DECK_LOW}M${x - 5} 62H${x + 5}M${x - 4} ${TOWER_TOP - 4}H${x + 4}`
const pier = (x: number) => `M${x - 8} ${DECK_LOW}V${WATER - 6}M${x + 8} ${DECK_LOW}V${WATER - 6}M${x - 14} ${WATER - 6}H${x + 14}V${WATER}H${x - 14}Z`
const FERRY_HULL = 'M294 158L300 174H360L366 158Z'
const FERRY_TOP = 'M314 158V146H346V158M322 146V138H338V146M341 146V140M300 164H360M326 128l4 10'
// The ferry is drawn at x 294..366, shown 64 further left (under the main span, clear of its dimension label) and
// starts this far to the left again, by the abutment.
const FERRY_AT = -64
const FERRY_DX = 172

// --- the records table ------------------------------------------------------------------------------------------------
const ROWS = [
  { code: 'R-101', signed: '03/2024', match: true, w: 72 },
  { code: 'R-102', signed: '11/2023', match: false, w: 54 },
  { code: 'R-103', signed: '07/2024', match: true, w: 80 },
  { code: 'R-104', signed: '01/2023', match: false, w: 62 },
  { code: 'R-105', signed: '10/2024', match: true, w: 48 },
]
const ROW_Y = (i: number) => 282 + i * 12
const MATCHED = ROWS.filter((r) => r.match).length

// --- the editor ---------------------------------------------------------------------------------------------------------
const TOOLS = ['B', 'I', '≡', '✎', 'Σ']
const STROKE = 'M150 422C162 402 170 430 186 416S206 400 222 418S246 430 260 410S276 402 284 408'

// --- the terminal -------------------------------------------------------------------------------------------------------
const CMD = '$ records --filter signed between 01/2024 12/2024'
const CMD_W = CMD.length * 6.2
const TYPE: [number, number] = [0.82, 0.95]

// A numbered balloon on a hairline leader from `from` to the circle at (x, y).
function Balloon ({ n, from, x, y, style }: { n: number, from: [number, number], x: number, y: number, style?: CSSProperties }) {
  return (
    <g style={style}>
      <path d={`M${from[0]} ${from[1]}L${x - 7} ${y}`} className='dg-line' style={HAIR} />
      <circle cx={from[0]} cy={from[1]} r={1.3} className='dg-ink' />
      <circle cx={x} cy={y} r={7} className='dg-fill' style={{ stroke: 'currentColor', strokeWidth: 0.8 }} />
      <text x={x} y={y} textAnchor='middle' className='dg-small' style={{ fontWeight: 700 }}>{n}</text>
    </g>
  )
}

export function Xn2Diagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='XN2 admin console spec sheet: a cable-stayed bridge in side elevation with a ferry and dimension lines, a records table filtered with the between operator, the form-template editor, and the frontend stack exploded into its ui, routes, state, forms and api layers with numbered balloons; a request walks down the stack to the external REST API and the terminal line types the filter command' className='dg'>
      <defs>
        <clipPath id='xn2-type'>
          <rect x={20} y={462} width={CMD_W} height={18} style={{ width: `calc(${seg(...TYPE)} * ${CMD_W}px)` }} />
        </clipPath>
      </defs>

      {/* 01 · the bridge, side elevation */}
      <path d={crosshairs(18, 18, 604, 182)} className='dg-line' style={{ ...HAIR, ...fade(0, 0.06) }} />
      <text x={24} y={28} className='dg-dim dg-small' style={fade(0.02, 0.08)}>01 · BRIDGE · ELEVATION</text>
      <text x={616} y={30} textAnchor='end' fontSize={16} style={{ ...DOTO, ...fade(0.04, 0.12) }}>XN2</text>
      <path d={`M28 ${DECK}H612M28 ${DECK_LOW}H612`} pathLength={1} className='dg-line' style={draw(0, 0.1)} />
      <path d={RAIL} className='dg-edge' style={{ ...HAIR, ...fade(0.08, 0.14) }} />
      <path d={`M28 ${DECK_LOW}V${WATER}H44V${DECK_LOW}M596 ${DECK_LOW}V${WATER}H612V${DECK_LOW}`} pathLength={1} className='dg-line' style={draw(0.04, 0.12)} />
      {TOWERS.map((x, i) => (
        <g key={x}>
          <path d={pier(x)} pathLength={1} className='dg-line' style={draw(0.04 + i * 0.02, 0.12 + i * 0.02)} />
          <path d={tower(x)} pathLength={1} className='dg-line' style={draw(0.06 + i * 0.03, 0.16 + i * 0.03)} />
          <path d={cableFan(x, TOWER_TOP + 2, DECK, REACH)} pathLength={1} className='dg-edge' style={{ ...HAIR, ...draw(0.12 + i * 0.03, 0.22 + i * 0.03) }} />
        </g>
      ))}
      <path d={`M28 ${WATER}H612`} pathLength={1} className='dg-accent' style={draw(0.08, 0.18)} />
      <path d={WAVES} className='dg-edge' style={{ ...HAIR, ...fade(0.14, 0.2) }} />
      {/* the ferry crosses under the main span */}
      <g transform={`translate(${FERRY_AT - FERRY_DX} 0)`}>
        <g style={travel(0.14, 0.32, FERRY_DX)}>
          <path d={FERRY_HULL} className='dg-fill' style={fade(0.12, 0.16)} />
          <path d={FERRY_HULL} pathLength={1} className='dg-line' style={draw(0.12, 0.18)} />
          <path d={FERRY_TOP} pathLength={1} className='dg-line' style={draw(0.14, 0.22)} />
          <path d='M286 170h-14M288 166h-10' className='dg-accent' style={{ ...HAIR, ...pulse(0.16, 0.34) }} />
        </g>
      </g>
      <text x={310} y={160} className='dg-dim dg-small' style={fade(0.3, 0.36)}>ferry</text>
      {/* dimension lines */}
      <path d={`M200 ${DECK_LOW + 4}V146M430 ${DECK_LOW + 4}V146`} className='dg-edge dg-dash' style={{ ...HAIR, ...fade(0.18, 0.24) }} />
      <path d={dimH(200, 430, 142)} pathLength={1} className='dg-accent' style={{ ...HAIR, ...draw(0.2, 0.28) }} />
      <text x={315} y={134} textAnchor='middle' className='dg-small' style={fade(0.26, 0.32)}>main span</text>
      <path d={`M156 ${TOWER_TOP}h38M156 ${DECK}h20`} className='dg-edge dg-dash' style={{ ...HAIR, ...fade(0.18, 0.24) }} />
      <path d={dimV(150, TOWER_TOP, DECK)} pathLength={1} className='dg-accent' style={{ ...HAIR, ...draw(0.2, 0.28) }} />
      <text x={144} y={82} textAnchor='end' className='dg-small' style={fade(0.26, 0.32)}>tower</text>
      <path d={dimV(560, DECK_LOW, WATER)} pathLength={1} className='dg-accent' style={{ ...HAIR, ...draw(0.24, 0.3) }} />
      <text x={554} y={146} textAnchor='end' className='dg-small' style={fade(0.28, 0.34)}>clearance</text>
      <path d={dimH(28, 296, 192) + dimH(344, 612, 192)} pathLength={1} className='dg-accent' style={{ ...HAIR, ...draw(0.22, 0.3) }} />
      <text x={320} y={192} textAnchor='middle' className='dg-small' style={fade(0.28, 0.34)}>length</text>

      {/* 02 · the records table with the between filter */}
      <g style={rise(0.26, 0.34, 0, 12)}>
        <rect x={12} y={214} width={294} height={132} className='dg-fill' />
        <path d={crosshairs(18, 220, 282, 120)} className='dg-line' style={HAIR} />
        <text x={24} y={229} className='dg-dim dg-small'>02 · RECORDS</text>
        <text x={298} y={229} textAnchor='end' className='dg-dim dg-small'>filter operators</text>
        <path d='M22 274H296' className='dg-edge' />
        <text x={24} y={266} className='dg-dim dg-small'>code</text>
        <text x={70} y={266} className='dg-dim dg-small'>bridge</text>
        <text x={168} y={266} className='dg-dim dg-small'>signed</text>
        <text x={236} y={266} className='dg-dim dg-small'>status</text>
      </g>
      {ROWS.map((row, i) => {
        const y = ROW_Y(i)
        const a = 0.32 + i * 0.02
        const dim = row.match ? seg(a, a + 0.04) : `calc(${seg(a, a + 0.04)} * (1 - 0.7 * ${seg(0.78, 0.84)}))`
        return (
          <g key={row.code}>
            {row.match && <rect x={20} y={y - 5.5} width={274} height={11} className='dg-wash' style={fade(0.78 + i * 0.01, 0.84 + i * 0.01)} />}
            <g style={{ opacity: dim }}>
              <text x={24} y={y} className='dg-small'>{row.code}</text>
              <path d={`M70 ${y}h${row.w}M236 ${y}h24`} className='dg-edge' style={{ strokeWidth: 4 }} />
              <text x={168} y={y} className='dg-small'>{row.signed}</text>
            </g>
          </g>
        )
      })}
      {/* filter chips: field, operator, range */}
      <g style={rise(0.34, 0.42, -8, 0)}>
        <rect x={22} y={236} width={46} height={16} className='dg-fill' />
        <text x={45} y={244} textAnchor='middle' className='dg-small'>signed</text>
        <rect x={74} y={236} width={58} height={16} className='dg-fill' />
        <text x={103} y={244} textAnchor='middle' className='dg-small'>between</text>
        <rect x={138} y={236} width={104} height={16} className='dg-fill' />
        <text x={190} y={244} textAnchor='middle' className='dg-small'>01/2024 — 12/2024</text>
      </g>
      <rect x={74} y={236} width={58} height={16} className='dg-wash dg-accent' style={fade(0.52, 0.56)} />
      <circle cx={103} cy={244} r={11} className='dg-accent' style={{ ...pulse(0.52, 0.6), strokeDasharray: '2 2' }} />
      <Balloon n={6} from={[244, 244]} x={290} y={244} style={fade(0.6, 0.66)} />
      <text x={290} y={258} textAnchor='middle' className='dg-dim dg-small' style={fade(0.62, 0.68)}>tables</text>

      {/* 03 · the form-template editor */}
      <g style={rise(0.32, 0.4, 0, 12)}>
        <rect x={12} y={358} width={294} height={82} className='dg-fill' />
        <path d={crosshairs(18, 364, 282, 70)} className='dg-line' style={HAIR} />
        <text x={24} y={373} className='dg-dim dg-small'>03 · TEMPLATE · Tiptap</text>
        {TOOLS.map((tool, i) => (
          <g key={tool}>
            <rect x={150 + i * 22} y={365} width={18} height={16} className={i === 3 ? 'dg-wash dg-accent' : 'dg-fill'} />
            <text x={159 + i * 22} y={373} textAnchor='middle' className='dg-small'>{tool}</text>
          </g>
        ))}
        <rect x={22} y={392} width={272} height={42} className='dg-edge dg-dash' style={{ fill: 'none', ...HAIR }} />
        <path d='M32 402h96M32 412h72M32 422h88' className='dg-edge' style={{ strokeWidth: 3 }} />
      </g>
      <Balloon n={7} from={[260, 373]} x={290} y={373} style={fade(0.62, 0.68)} />
      <text x={290} y={386} textAnchor='middle' className='dg-dim dg-small' style={fade(0.64, 0.7)}>editor</text>
      <path d={STROKE} pathLength={1} className='dg-accent' style={{ ...draw(0.8, 0.92), strokeWidth: 1.8 }} />
      <circle cx={150} cy={422} r={3} className='dg-solid' style={{ ...travel(0.8, 0.92, 134, -14), ...pulse(0.78, 0.94) }} />

      {/* 04 · the stack, exploded along its centerline */}
      <text x={320} y={229} className='dg-dim dg-small' style={fade(0.28, 0.34)}>04 · STACK · frontend</text>
      <path d={`M${AXIS.x} ${AXIS.y0}V${AXIS.y1}`} pathLength={1} className='dg-line dg-dash' style={{ ...HAIR, ...draw(0.38, 0.5) }} />
      {PLATES.map((plate) => {
        const hit = 0.57 + (PLATES.length - 1 - plate.index) * 0.028
        return (
          <g key={plate.id} style={{ ...travel(0.38, 0.52, 0, -plate.lift), opacity: seg(0.28 + plate.index * 0.015, 0.34 + plate.index * 0.015) }}>
            <path d={plate.paths.fill} style={{ fill: 'var(--anatomy-paper)' }} />
            {plate.paths.shades.map((d, shade) => d && <path key={shade} d={d} style={{ fill: `var(--anatomy-shade-${shade})` }} />)}
            <path d={plate.paths.top} style={{ fill: 'var(--anatomy-top)' }} />
            <path d={plate.paths.top} className='dg-wash' style={pulse(hit - 0.012, hit + 0.05)} />
            <path d={plate.paths.crease} style={{ fill: 'none', stroke: 'var(--anatomy-faint)', strokeWidth: 0.6 }} />
            <path d={plate.glyph} className='dg-line' style={{ ...HAIR, opacity: seg(0.4, 0.5) }} />
            <path d={plate.paths.outline} style={{ fill: 'none', stroke: 'var(--anatomy-hi)', strokeWidth: 0.7, strokeLinejoin: 'miter' }} />
            <Balloon n={plate.n} from={plate.anchor} x={524} y={plate.anchor[1]} style={fade(0.5 + plate.index * 0.02, 0.56 + plate.index * 0.02)} />
            <g style={fade(0.52 + plate.index * 0.02, 0.58 + plate.index * 0.02)}>
              <text x={536} y={plate.anchor[1] - 5} style={{ fontSize: 10 }}>{plate.label}</text>
              <text x={536} y={plate.anchor[1] + 6} className='dg-dim dg-small'>{plate.tech}</text>
            </g>
          </g>
        )
      })}
      {/* the request packet walks down the stack, then leaves for the external API */}
      <path d={`M${AXIS.x} ${PACKET.to}V${BASE_FRONT[1] + 6}H468V438`} pathLength={1} className='dg-accent dg-dash' style={{ ...HAIR, ...draw(0.66, 0.72) }} />
      <g style={travel(0.57, 0.68, 0, PACKET.to - PACKET.from)}>
        <g style={travel(0.68, 0.71, 0, BASE_FRONT[1] + 6 - PACKET.to)}>
          <g style={travel(0.71, 0.74, 468 - AXIS.x, 0)}>
            <circle cx={AXIS.x} cy={PACKET.from} r={3.5} className='dg-solid' style={pulse(0.55, 0.76)} />
          </g>
        </g>
      </g>
      <g style={fade(0.64, 0.7)}>
        <rect x={420} y={438} width={208} height={18} className='dg-fill dg-dash' />
        <text x={430} y={447} className='dg-dim dg-small'>REST API · external</text>
      </g>
      <g style={rise(0.74, 0.78, 6, 0)}>
        <rect x={590} y={440} width={34} height={14} className='dg-wash dg-accent' />
        <text x={607} y={447} textAnchor='middle' fontSize={10} style={DOTO}>200</text>
      </g>

      {/* the terminal line, typed with a clip that grows with the scroll */}
      <path d='M12 458H628' className='dg-edge' style={{ ...HAIR, ...fade(0.76, 0.82) }} />
      <text x={20} y={471} fontSize={10} textLength={CMD_W} lengthAdjust='spacingAndGlyphs' clipPath='url(#xn2-type)' style={fade(0.8, 0.82)}>{CMD}</text>
      <rect x={20} y={465} width={6} height={12} className='dg-solid' style={{ ...travel(...TYPE, CMD_W), ...pulse(0.8, 0.97) }} />
      <text x={20 + CMD_W + 10} y={471} className='dg-dim dg-small' style={fade(0.95, 1)}>→ 200 · {MATCHED} rows</text>

      {/* title block */}
      <g style={fade(0.9, 0.98)}>
        <path d='M12 486H628' className='dg-edge' style={HAIR} />
        <text x={20} y={499} className='dg-dim dg-small'>XN2 · SHEET 07 · BRIDGE &amp; FERRY CONSOLE</text>
        <text x={400} y={499} textAnchor='middle' className='dg-dim dg-small'>SCALE 1:1</text>
        <text x={620} y={499} textAnchor='end' className='dg-dim dg-small'>REV A · 5 LAYERS · 2 SIDE</text>
      </g>
    </svg>
  )
}
