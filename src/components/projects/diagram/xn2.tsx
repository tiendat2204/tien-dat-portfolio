import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// XN2 admin console. Everything is visible but ghosted at p=0; the scroll solidifies it and runs three beats:
//   0.00-0.25  the product: a cable-stayed bridge in side elevation, a ferry sailing under the main span (`ui` lit)
//   0.25-0.75  the console: the records table takes the `between` filter and dims the rows outside the range
//              (`routes`, then `state`), a pen stroke draws in the template editor (`forms`)
//   0.75-0.95  the result: the matching rows light up and the signature line types (`api`)
// The stack strip holds the real layers of the frontend config; the lit cell follows the action. Facts only: bridges,
// ferries, records; a data table with the between operator; a form-template editor with drawing; Vite.

const DECK = 112
const WATER = 156
const TOWERS = [200, 440]
const TOP = 40
const REACH = [30, 60, 90, 120]
const tower = (x: number) => `M${x - 5} ${DECK + 8}L${x - 3} ${TOP}H${x + 3}L${x + 5} ${DECK + 8}M${x - 9} ${DECK + 8}V${WATER}M${x + 9} ${DECK + 8}V${WATER}`
const cables = (x: number) => REACH.map((r) => `M${x} ${TOP + 2}L${x - r} ${DECK}M${x} ${TOP + 2}L${x + r} ${DECK}`).join('')
const WAVES = Array.from({ length: 28 }, (_, i) => `M${40 + i * 20} ${WATER + 10}q5-3 10 0t10 0`).join('')
// The ferry waits by the west abutment and sails to the middle of the main span.
const FERRY = 'M60 152L66 136H114L120 152M74 136V124H104V136M86 124V118H92V124'
const SAIL = 230

const HEADERS = ['code', 'bridge', 'signed', 'status']
const COLS = [36, 116, 216, 316]
const ROWS: { match: boolean, bridge: number, status: string }[] = [
  { match: true, bridge: 72, status: 'active' },
  { match: false, bridge: 56, status: 'expired' },
  { match: true, bridge: 80, status: 'active' },
  { match: true, bridge: 64, status: 'active' },
  { match: false, bridge: 48, status: 'expired' },
]
const ROW_Y = (i: number) => 240 + i * 18

const STROKE = 'M426 306C438 284 448 314 462 300S486 280 502 298S528 312 544 290S566 284 594 296'

// One cell per layer of the frontend config, lit while the action touches it.
const STACK: { label: string, tech: string, on: [number, number] }[] = [
  { label: 'ui', tech: 'React 19', on: [0.06, 0.26] },
  { label: 'routes', tech: 'React Router 7', on: [0.26, 0.42] },
  { label: 'state', tech: 'Redux Toolkit', on: [0.42, 0.6] },
  { label: 'forms', tech: 'React Hook Form', on: [0.6, 0.76] },
  { label: 'api', tech: 'Axios', on: [0.76, 0.94] },
]
const CELL_X = (i: number) => 24 + i * 119.5
const CELL_W = 114
const CELL_Y = 358
const CELL_H = 80

const CMD = '$ npx vite build'
const CMD_W = CMD.length * 6.6
const TYPE: [number, number] = [0.84, 0.95]

export function Xn2Diagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='XN2 admin console: a cable-stayed bridge in side elevation with a ferry under its main span, a records table whose between filter dims the rows outside the range, a form-template editor with a drawn stroke, and the frontend stack strip lit layer by layer' className='dg'>
      <defs>
        <clipPath id='xn2-type'>
          <rect x={24} y={468} width={CMD_W} height={20} style={{ width: `calc(${seg(...TYPE)} * ${CMD_W}px)` }} />
        </clipPath>
      </defs>

      <g style={{ opacity: `calc(0.3 + 0.7 * ${seg(0, 0.18)})` }}>
        {/* beat 1: the bridge, side elevation */}
        <path d={`M40 ${DECK}H600M40 ${DECK + 8}H600`} className='dg-line' />
        {TOWERS.map((x) => (
          <g key={x}>
            <path d={tower(x)} className='dg-line' />
            <path d={cables(x)} className='dg-line' style={{ strokeWidth: 0.7 }} />
          </g>
        ))}
        <path d={`M40 ${WATER}H600`} className='dg-accent' style={{ strokeWidth: 1.6 }} />
        <path d={WAVES} className='dg-edge' />
        <g style={travel(0.08, 0.36, SAIL)}>
          <path d={FERRY} className='dg-fill' />
        </g>
        <g className='dg-dim' style={fade(0.14, 0.22)}>
          <text x={320} y={96} textAnchor='middle'>span</text>
          <path d='M584 122V154M580 122h8M580 154h8' className='dg-edge' />
          <text x={572} y={138} textAnchor='end'>clearance</text>
        </g>

        {/* beat 2: the records table (left) and the template editor (right) */}
        <rect x={24} y={176} width={364} height={160} className='dg-fill' />
        <rect x={404} y={176} width={212} height={160} className='dg-fill' />
        <path d='M24 176H388' className='dg-accent' style={{ ...pulse(0.26, 0.42), strokeWidth: 2 }} />
        <path d='M24 226H388' className='dg-edge' />
        <g className='dg-dim'>
          {HEADERS.map((h, i) => <text key={h} x={COLS[i]} y={214}>{h}</text>)}
        </g>
        {ROWS.map(({ match, bridge, status }, i) => {
          const y = ROW_Y(i)
          return (
            <g key={y}>
              {match && <rect x={28} y={y - 8} width={356} height={16} className='dg-wash' style={fade(0.78 + i * 0.015, 0.84 + i * 0.015)} />}
              <g style={{ opacity: match ? 1 : `calc(1 - 0.72 * ${seg(0.52, 0.62)})` }}>
                <path d={`M${COLS[0]} ${y}h48`} className='dg-line' style={{ strokeWidth: 5 }} />
                <path d={`M${COLS[1]} ${y}h${bridge}M${COLS[2]} ${y}h56`} className='dg-edge' style={{ strokeWidth: 5 }} />
                <text x={COLS[3]} y={y}>{status}</text>
              </g>
            </g>
          )
        })}
        {/* the filter chip: the operator, then its range as a bar */}
        <g style={rise(0.42, 0.5, -10, 0)}>
          <rect x={36} y={182} width={58} height={16} className='dg-wash dg-accent' />
          <text x={65} y={190} textAnchor='middle'>between</text>
          <path d='M102 190h68' className='dg-edge' style={{ strokeWidth: 5 }} />
        </g>
        <rect x={36} y={182} width={58} height={16} className='dg-accent' style={{ ...pulse(0.5, 0.62), strokeWidth: 2 }} />

        <text x={416} y={192} className='dg-dim'>template</text>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={416 + i * 20} y={204} width={14} height={14} className={i === 3 ? 'dg-wash dg-accent' : 'dg-fill'} />)}
        <path d='M416 234h140M416 248h104M416 262h124' className='dg-edge' style={{ strokeWidth: 4 }} />
        <rect x={416} y={276} width={188} height={48} className='dg-edge dg-dash' style={{ fill: 'none' }} />
        <path d={STROKE} pathLength={1} className='dg-accent' style={{ ...draw(0.6, 0.76), strokeWidth: 2 }} />
        <circle cx={426} cy={306} r={3} className='dg-solid' style={{ ...travel(0.6, 0.76, 168, -10), ...pulse(0.58, 0.78) }} />

        {/* the stack strip: one cell per layer, lit in turn; a packet slides along the top edge */}
        {STACK.map(({ label, tech, on }, i) => {
          const x = CELL_X(i)
          return (
            <g key={label}>
              <rect x={x} y={CELL_Y} width={CELL_W} height={CELL_H} className='dg-fill' />
              <rect x={x} y={CELL_Y} width={CELL_W} height={CELL_H} className='dg-wash' style={pulse(...on)} />
              <rect x={x} y={CELL_Y} width={CELL_W} height={CELL_H} className='dg-accent' style={{ ...pulse(...on), strokeWidth: 2 }} />
              <rect x={x + CELL_W - 12} y={CELL_Y + 6} width={6} height={6} className='dg-solid' style={fade(on[1] - 0.02, on[1])} />
              <text x={x + 8} y={CELL_Y + 22} className='dg-dim' style={{ fontSize: 10 }}>{label}</text>
              <text x={x + 8} y={CELL_Y + 52}>{tech}</text>
            </g>
          )
        })}
        <circle cx={CELL_X(0) + CELL_W / 2} cy={CELL_Y} r={4} className='dg-solid' style={{ ...travel(0.16, 0.85, 478), ...pulse(0.06, 0.94) }} />

        {/* beat 3: the signature line, typed with a clip that grows with the scroll */}
        <text x={24} y={478} textLength={CMD_W} lengthAdjust='spacingAndGlyphs' clipPath='url(#xn2-type)' style={fade(0.82, 0.84)}>{CMD}</text>
        <rect x={24} y={471} width={7} height={14} className='dg-solid' style={{ ...travel(...TYPE, CMD_W), ...pulse(0.82, 0.98) }} />
      </g>
    </svg>
  )
}
