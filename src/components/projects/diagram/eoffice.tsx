import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// E-Office: a document page with a status pill, the draft -> review -> active track, a role guard on the route,
// a file upload and the toast that confirms it. Progress 0..1 (see anim.ts).

const STAGES = ['draft', 'review', 'active']
const SX = (i: number) => 410 + i * 90

export function EofficeDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='E-Office: a document page with a status pill that moves from draft through review to active, a role guard lock on the route, a file upload and a toast' className='dg'>
      {/* document page */}
      <rect x={24} y={40} width={308} height={400} rx={6} pathLength={1} className='dg-fill' style={draw(0, 0.14)} />
      <text x={40} y={60} className='dg-dim dg-small' style={fade(0.06, 0.12)}>document · preview</text>
      <path d='M40 86H210' pathLength={1} className='dg-line' style={{ ...draw(0.08, 0.16), strokeWidth: 6 }} />
      <path d='M40 112H300M40 126H292M40 140H270M40 154H296M40 168H240' pathLength={1} className='dg-edge' style={{ ...draw(0.12, 0.22), strokeWidth: 4 }} />
      <g style={fade(0.18, 0.28)}>
        <rect x={40} y={196} width={276} height={100} rx={4} className='dg-fill' />
        <path d='M40 222H316M40 248H316M40 272H316M132 196V296M224 196V296' className='dg-edge' />
        <rect x={40} y={196} width={276} height={26} rx={4} className='dg-wash' />
        <text x={86} y={209} textAnchor='middle' className='dg-small'>item</text>
        <text x={178} y={209} textAnchor='middle' className='dg-small'>detail</text>
        <text x={270} y={209} textAnchor='middle' className='dg-small'>note</text>
      </g>
      <path d='M40 324H280M40 338H250M40 352H270' pathLength={1} className='dg-edge' style={{ ...draw(0.22, 0.3), strokeWidth: 4 }} />

      {/* status pill: two texts cross-fade */}
      <g style={fade(0.1, 0.16)}>
        <rect x={236} y={72} width={80} height={22} rx={11} className='dg-fill' />
      </g>
      <rect x={236} y={72} width={80} height={22} rx={11} className='dg-wash dg-accent' style={fade(0.62, 0.7)} />
      <text x={276} y={83} textAnchor='middle' style={{ opacity: `calc(min(${seg(0.1, 0.16)}, 1 - ${seg(0.62, 0.68)}))` }}>draft</text>
      <text x={276} y={83} textAnchor='middle' style={{ opacity: seg(0.64, 0.7) }}>active</text>

      {/* stage track */}
      <text x={380} y={60} className='dg-dim dg-small' style={fade(0.28, 0.34)}>status flow</text>
      {STAGES.map((label, i) => (
        <g key={label}>
          {i < 2 && <path d={`M${SX(i) + 14} 120H${SX(i + 1) - 14}`} pathLength={1} className='dg-accent' style={draw(0.34 + i * 0.12, 0.42 + i * 0.12)} />}
          <g style={fade(0.3 + i * 0.1, 0.36 + i * 0.1)}>
            <circle cx={SX(i)} cy={120} r={14} className='dg-fill' />
            <text x={SX(i)} y={150} textAnchor='middle' className='dg-small'>{label}</text>
          </g>
          <circle cx={SX(i)} cy={120} r={14} className='dg-wash dg-accent' style={fade(0.4 + i * 0.12, 0.46 + i * 0.12)} />
        </g>
      ))}
      <circle cx={SX(0)} cy={120} r={4} className='dg-solid' style={{ ...travel(0.36, 0.66, 180), ...pulse(0.34, 0.68) }} />

      {/* role guard on the review step */}
      <path d={`M${SX(1)} 160V190`} pathLength={1} className='dg-accent dg-dash' style={draw(0.46, 0.52)} />
      <g style={rise(0.48, 0.56, 0, 8)}>
        <rect x={380} y={192} width={220} height={44} rx={5} className='dg-fill' />
        <rect x={394} y={208} width={16} height={12} rx={2} className='dg-ink' />
        <path d='M397 208V204A5 5 0 0 1 407 204V208' className='dg-line' />
        <text x={424} y={206} className='dg-small'>role guard</text>
        <text x={424} y={222} className='dg-dim dg-small'>route · permission</text>
      </g>

      {/* approval check at active */}
      <g style={fade(0.62, 0.7)}>
        <circle cx={SX(2)} cy={120} r={14} className='dg-fill dg-accent' />
        <path d={`M${SX(2) - 6} 120L${SX(2) - 1.5} 125L${SX(2) + 7} 115`} pathLength={1} className='dg-accent' style={{ ...draw(0.62, 0.7), strokeWidth: 2 }} />
      </g>

      {/* file upload */}
      <g style={rise(0.7, 0.8, 0, 10)}>
        <rect x={380} y={272} width={220} height={48} rx={5} className='dg-fill dg-dash' />
        <path d='M396 282H410L416 288V308H396Z' className='dg-line' />
        <path d='M410 282V288H416' className='dg-line' />
        <text x={428} y={290} className='dg-small'>file upload</text>
        <path d='M428 306H580' pathLength={1} className='dg-edge' style={{ ...draw(0.74, 0.84), strokeWidth: 5 }} />
      </g>
      <path d='M376 296H336' pathLength={1} className='dg-accent dg-dash' style={draw(0.78, 0.86)} />

      {/* toast */}
      <g style={rise(0.88, 0.95, 0, 14)}>
        <rect x={380} y={380} width={220} height={40} rx={6} className='dg-fill dg-accent' />
        <circle cx={402} cy={400} r={8} className='dg-solid' />
        <path d='M398 400L401 403L407 397' className='dg-line' style={{ stroke: 'hsl(var(--primary-foreground))' }} />
        <text x={422} y={400} className='dg-small'>status updated</text>
      </g>
    </svg>
  )
}
