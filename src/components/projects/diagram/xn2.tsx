import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// XN2 admin console, wireframed. Three beats over `--p` (see anim.ts):
//   0.00-0.25  the product: a cable-stayed bridge in side elevation, a ferry crossing under the main span
//   0.25-0.75  the console: a records table and the template editor; the `between` chip lands and dims the rows
//              outside its range while a pen stroke draws in the editor
//   0.75-0.95  the result: the matching rows light up and the signature line types
// Facts only: bridges, ferries, records; a data table with the between operator; a form-template editor with drawing.

const DECK = 150
const WATER = 204
const TOWERS = [196, 444]
const TOP = 58
const REACH = [32, 64, 96, 128]
const tower = (x: number) => `M${x - 5} ${DECK + 8}L${x - 3} ${TOP}H${x + 3}L${x + 5} ${DECK + 8}M${x - 9} ${DECK + 8}V${WATER}M${x + 9} ${DECK + 8}V${WATER}`
const cables = (x: number) => REACH.map((r) => `M${x} ${TOP + 2}L${x - r} ${DECK}M${x} ${TOP + 2}L${x + r} ${DECK}`).join('')
const WAVES = Array.from({ length: 28 }, (_, i) => `M${40 + i * 20} ${WATER + 12}q5-3 10 0t10 0`).join('')
// The ferry is drawn by the west abutment and sails to the middle of the main span.
const FERRY = 'M64 196L70 180H118L124 196M78 180V166H108V180M92 166V158H98V166'
const SAIL = 176

const ROWS = [true, false, true, true, false, true]
const WIDTHS = [120, 84, 108, 96, 72, 112]
const ROW_Y = (i: number) => 304 + i * 18
const ROW_IN = (i: number) => fade(0.34 + i * 0.02, 0.4 + i * 0.02)

const STROKE = 'M438 382C452 356 462 392 478 376S502 352 520 372S548 388 560 362S570 352 576 354'
const CMD = '$ records --filter between'
const CMD_W = CMD.length * 6.6
const TYPE: [number, number] = [0.84, 0.95]

export function Xn2Diagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='XN2 admin console: a cable-stayed bridge in side elevation with a ferry under its main span, a records table whose between filter dims the rows outside the range, and a form-template editor with a drawn stroke' className='dg'>
      <defs>
        <clipPath id='xn2-type'>
          <rect x={40} y={448} width={CMD_W} height={20} style={{ width: `calc(${seg(...TYPE)} * ${CMD_W}px)` }} />
        </clipPath>
      </defs>

      {/* beat 1: the bridge, side elevation */}
      <path d={`M40 ${DECK}H600M40 ${DECK + 8}H600`} pathLength={1} className='dg-line' style={draw(0, 0.1)} />
      <path d={`M40 ${DECK + 8}V${WATER}M600 ${DECK + 8}V${WATER}`} pathLength={1} className='dg-line' style={draw(0.02, 0.08)} />
      {TOWERS.map((x, i) => (
        <g key={x}>
          <path d={tower(x)} pathLength={1} className='dg-line' style={draw(0.04 + i * 0.03, 0.14 + i * 0.03)} />
          <path d={cables(x)} pathLength={1} className='dg-line' style={{ ...draw(0.1 + i * 0.04, 0.22 + i * 0.04), strokeWidth: 0.7 }} />
        </g>
      ))}
      <path d={`M40 ${WATER}H600`} pathLength={1} className='dg-accent' style={{ ...draw(0.06, 0.14), strokeWidth: 1.6 }} />
      <path d={WAVES} className='dg-edge' style={fade(0.12, 0.18)} />
      <g style={travel(0.14, 0.34, SAIL)}>
        <path d={FERRY} className='dg-fill' style={fade(0.12, 0.16)} />
        <path d={FERRY} pathLength={1} className='dg-line' style={draw(0.12, 0.2)} />
      </g>

      {/* beat 2: the records table (left) and the template editor (right); the frames are faint from the start */}
      <rect x={40} y={252} width={340} height={168} className='dg-fill' style={{ opacity: `calc(0.35 + 0.65 * ${seg(0.25, 0.33)})` }} />
      <rect x={412} y={252} width={188} height={168} className='dg-fill' style={{ opacity: `calc(0.35 + 0.65 * ${seg(0.28, 0.36)})` }} />
      <path d='M40 288H380' className='dg-edge' style={fade(0.3, 0.36)} />
      <path d='M56 270h44' className='dg-edge' style={{ strokeWidth: 5, ...fade(0.3, 0.36) }} />
      {ROWS.map((match, i) => {
        const y = ROW_Y(i)
        const dim = match ? 1 : `calc(1 - 0.72 * ${seg(0.58, 0.68)})`
        return (
          <g key={y} style={ROW_IN(i)}>
            {match && <rect x={44} y={y - 8} width={332} height={16} className='dg-wash' style={fade(0.76 + i * 0.015, 0.82 + i * 0.015)} />}
            <g style={{ opacity: dim }}>
              <path d={`M56 ${y}h36`} className='dg-line' style={{ strokeWidth: 5 }} />
              <path d={`M108 ${y}h${WIDTHS[i]}M256 ${y}h56`} className='dg-edge' style={{ strokeWidth: 5 }} />
              <circle cx={352} cy={y} r={3.5} className={match ? 'dg-solid' : 'dg-ink'} />
            </g>
          </g>
        )
      })}
      {/* the filter chip: operator, then the range as a bar */}
      <g style={rise(0.48, 0.56, -10, 0)}>
        <rect x={110} y={261} width={70} height={18} className='dg-wash dg-accent' />
        <text x={145} y={270} textAnchor='middle'>between</text>
        <path d='M188 270h76' className='dg-edge' style={{ strokeWidth: 5 }} />
      </g>
      <rect x={110} y={261} width={70} height={18} className='dg-accent' style={{ ...pulse(0.56, 0.7), strokeWidth: 2 }} />

      <g style={fade(0.34, 0.42)}>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={428 + i * 20} y={264} width={14} height={14} className={i === 3 ? 'dg-wash dg-accent' : 'dg-fill'} />)}
        <path d='M428 298h128M428 312h92M428 326h112' className='dg-edge' style={{ strokeWidth: 4 }} />
        <rect x={428} y={344} width={156} height={60} className='dg-edge dg-dash' style={{ fill: 'none' }} />
      </g>
      <path d={STROKE} pathLength={1} className='dg-accent' style={{ ...draw(0.6, 0.76), strokeWidth: 2 }} />
      <circle cx={438} cy={382} r={3} className='dg-solid' style={{ ...travel(0.6, 0.76, 138, -28), ...pulse(0.58, 0.78) }} />

      {/* beat 3: the signature line, typed with a clip that grows with the scroll */}
      <text x={40} y={458} textLength={CMD_W} lengthAdjust='spacingAndGlyphs' clipPath='url(#xn2-type)' style={fade(0.82, 0.84)}>{CMD}</text>
      <rect x={40} y={451} width={7} height={14} className='dg-solid' style={{ ...travel(...TYPE, CMD_W), ...pulse(0.82, 0.98) }} />
    </svg>
  )
}
