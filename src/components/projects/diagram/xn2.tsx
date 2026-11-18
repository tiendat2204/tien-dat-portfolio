import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// XN2 admin console: a bridge in side elevation with dimension lines, then a records table filtered with the
// `between` operator, then the form-template editor (toolbar and a freehand stroke). Progress 0..1 (see anim.ts).

const PYLONS = [200, 440]
const CABLES: [number, number][] = [[200, 100], [200, 140], [200, 170], [200, 240], [200, 270], [200, 300], [440, 340], [440, 370], [440, 400], [440, 470], [440, 500], [440, 540]]
const ROWS = [0, 1, 2, 3, 4]
const MATCH = [true, false, true, false, true]
const arrow = (x1: number, x2: number, y: number) => `M${x1 + 6} ${y - 3}L${x1} ${y}L${x1 + 6} ${y + 3}M${x1} ${y}H${x2}M${x2 - 6} ${y - 3}L${x2} ${y}L${x2 - 6} ${y + 3}`

export function Xn2Diagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='XN2 admin console: a bridge drawn with span and clearance dimension lines, a records table filtered with the between operator, and a form template editor with a toolbar and a freehand pen stroke' className='dg'>
      {/* bridge, side elevation */}
      <path d='M24 132H616M24 139H616' pathLength={1} className='dg-line' style={draw(0, 0.1)} />
      {PYLONS.map((x, i) => (
        <g key={x}>
          <path d={`M${x - 6} 139V196M${x + 6} 139V196`} pathLength={1} className='dg-line' style={draw(0.04 + i * 0.03, 0.14 + i * 0.03)} />
          <path d={`M${x} 132V46`} pathLength={1} className='dg-line' style={draw(0.08 + i * 0.03, 0.18 + i * 0.03)} />
        </g>
      ))}
      {CABLES.map(([px, dx], i) => (
        <path key={dx} d={`M${px} 52L${dx} 132`} pathLength={1} className='dg-edge' style={draw(0.14 + i * 0.006, 0.22 + i * 0.006)} />
      ))}
      <path d='M24 196H616' className='dg-accent' pathLength={1} style={draw(0, 0.1)} />
      <path d='M60 206q10-5 20 0t20 0M300 206q10-5 20 0t20 0M520 206q10-5 20 0t20 0' pathLength={1} className='dg-edge' style={draw(0.08, 0.16)} />
      <text x={24} y={34} className='dg-dim dg-small' style={fade(0.1, 0.16)}>bridge · elevation</text>

      {/* dimension lines */}
      <g style={fade(0.2, 0.26)}>
        <path d='M200 142V176M440 142V176' className='dg-edge dg-dash' />
        <path d='M556 140H566M556 196H566' className='dg-edge dg-dash' />
      </g>
      <path d={arrow(200, 440, 172)} pathLength={1} className='dg-accent' style={draw(0.22, 0.3)} />
      <text x={320} y={160} textAnchor='middle' className='dg-small' style={fade(0.28, 0.34)}>span</text>
      <path d='M561 140V196M558 146L561 140L564 146M558 190L561 196L564 190' pathLength={1} className='dg-accent' style={draw(0.26, 0.34)} />
      <text x={570} y={168} className='dg-small' style={fade(0.32, 0.38)}>clearance</text>

      {/* records table with the between filter */}
      <g style={rise(0.36, 0.46, 0, 16)}>
        <rect x={24} y={224} width={592} height={134} rx={6} className='dg-fill' />
        <text x={38} y={238} className='dg-dim dg-small'>records</text>
        <rect x={380} y={228} width={104} height={20} rx={10} className='dg-fill' />
        <text x={432} y={238} textAnchor='middle' className='dg-small'>date</text>
        <path d='M24 254H616' className='dg-edge' />
      </g>
      <g style={rise(0.46, 0.54, 0, 8)}>
        <rect x={492} y={228} width={112} height={20} rx={10} className='dg-wash dg-accent' />
        <text x={548} y={238} textAnchor='middle' className='dg-small'>between</text>
      </g>
      {ROWS.map((r) => {
        const y = 266 + r * 18
        const a = 0.4 + r * 0.025
        return (
          <g key={r}>
            <g style={{ opacity: MATCH[r] ? seg(a, a + 0.05) : `calc(${seg(a, a + 0.05)} * (1 - 0.75 * ${seg(0.58, 0.68)}))` }}>
              <path d={`M38 ${y}h30M96 ${y}h${110 + r * 14}M380 ${y}h${50 + (r % 2) * 20}M520 ${y}h60`} className='dg-line' />
            </g>
            {MATCH[r] && <rect x={30} y={y - 8} width={572} height={16} rx={3} className='dg-wash' style={fade(0.6, 0.68)} />}
          </g>
        )
      })}
      <path d='M30 301H602M30 337H602' pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.58, 0.68), ...pulse(0.58, 0.7) }} />
      <circle cx={590} cy={284} r={3.5} className='dg-solid' style={{ ...travel(0.58, 0.68, 0, 36), ...pulse(0.56, 0.7) }} />

      {/* form template editor */}
      <g style={rise(0.7, 0.78, 0, 16)}>
        <rect x={24} y={372} width={592} height={90} rx={6} className='dg-fill' />
        <text x={540} y={384} className='dg-dim dg-small'>template</text>
        <rect x={36} y={378} width={22} height={20} rx={3} className='dg-wash dg-accent' />
        <text x={47} y={388} textAnchor='middle'>B</text>
        <rect x={64} y={378} width={22} height={20} rx={3} className='dg-fill' />
        <text x={75} y={388} textAnchor='middle' fontStyle='italic'>I</text>
        <rect x={92} y={378} width={22} height={20} rx={3} className='dg-fill' />
        <path d='M98 384h10M98 388h10M98 392h10' className='dg-line' />
        <rect x={36} y={404} width={568} height={50} rx={4} className='dg-fill dg-dash' />
      </g>
      <path d='M52 440C72 414 92 462 122 436S172 418 202 440S262 418 292 438S372 458 412 432S492 418 590 438' pathLength={1} className='dg-accent' style={{ ...draw(0.8, 0.96), strokeWidth: 2 }} />
      <circle r={3.5} cx={52} cy={440} className='dg-solid' style={{ ...travel(0.8, 0.96, 538, -2), ...pulse(0.8, 0.98) }} />
    </svg>
  )
}
