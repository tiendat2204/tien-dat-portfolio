import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// AgriTA mobile: a phone with the tasks list ticking, a camera snap into a journal entry, a dropped connection that
// parks the entry in the offline outbox, and the queue flying up to the server once signal returns.
// Progress 0..1 (see anim.ts).

const TASKS = ['water block A', 'check irrigation', 'log fertiliser', 'scout pests']
const TABS = ['tasks', 'journal', 'harvest', 'sync']
const BARS = [10, 16, 22, 28]

export function AgritaMobileDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='AgriTA mobile: season tasks tick off, a camera photo becomes a journal entry, the entry waits in an offline outbox, then the queue syncs to the server when signal returns' className='dg'>
      {/* the phone */}
      <rect x={40} y={28} width={190} height={424} rx={26} pathLength={1} className='dg-fill' style={draw(0, 0.12)} />
      <rect x={108} y={36} width={54} height={8} rx={4} className='dg-edge' style={fade(0.05, 0.1)} />

      {/* screen 1: season tasks */}
      <text x={56} y={66} className='dg-dim dg-small' style={fade(0.06, 0.12)}>season tasks</text>
      {TASKS.map((label, i) => {
        const y = 80 + i * 26
        const a = 0.1 + i * 0.05
        return (
          <g key={label}>
            <rect x={54} y={y} width={162} height={22} rx={4} className='dg-fill' style={fade(a - 0.02, a + 0.03)} />
            <rect x={62} y={y + 5} width={12} height={12} rx={2} className='dg-edge' style={fade(a - 0.02, a + 0.03)} />
            <path d={`M64.5 ${y + 11}L67.5 ${y + 14}L72 ${y + 8}`} pathLength={1} className='dg-accent' style={draw(a + 0.02, a + 0.07)} />
            <text x={82} y={y + 11} className='dg-small' style={fade(a - 0.02, a + 0.03)}>{label}</text>
          </g>
        )
      })}

      {/* screen 2: camera viewfinder snaps a photo */}
      <text x={56} y={196} className='dg-dim dg-small' style={fade(0.3, 0.36)}>journal · camera</text>
      <rect x={54} y={206} width={162} height={104} rx={6} className='dg-wash' style={pulse(0.4, 0.46, 0.015)} />
      {['M54 226V206H74', 'M196 206H216V226', 'M216 290V310H196', 'M74 310H54V290'].map((d) => (
        <path key={d} d={d} pathLength={1} className='dg-accent' style={draw(0.3, 0.38)} />
      ))}
      <g style={fade(0.32, 0.38)}>
        <path d='M96 292L124 252L146 276L160 260L184 292Z' className='dg-line' />
        <circle cx={92} cy={236} r={7} className='dg-line' />
      </g>
      <circle cx={135} cy={322} r={7} className='dg-fill dg-accent' style={fade(0.34, 0.4)} />

      {/* the journal entry that holds the photo, then waits for signal */}
      <rect x={60} y={346} width={104} height={36} rx={4} className='dg-edge dg-dash' style={fade(0.42, 0.48)} />
      <g style={rise(0.42, 0.5, 0, -10)}>
        <g style={{ ...travel(0.56, 0.68, 220, 0), opacity: `calc(1 - ${seg(0.76, 0.8)})` }}>
          <rect x={60} y={346} width={104} height={36} rx={4} className='dg-fill' />
          <rect x={66} y={352} width={24} height={24} rx={3} className='dg-edge' />
          <path d='M69 372L76 362L81 368L84 364L88 372Z' className='dg-line' />
          <text x={96} y={358} className='dg-small'>entry</text>
          <path d='M96 368H156' className='dg-edge' />
        </g>
      </g>

      {/* bottom nav */}
      <path d='M52 404H218' className='dg-edge' style={fade(0.08, 0.14)} />
      {TABS.map((t, i) => (
        <text key={t} x={66 + i * 46} y={424} textAnchor='middle' className={i === 1 ? 'dg-small' : 'dg-dim dg-small'} style={fade(0.08, 0.14)}>{t}</text>
      ))}

      {/* connectivity */}
      <g style={fade(0.46, 0.52)}>
        {BARS.map((h, i) => (
          <path key={h} d={`M${280 + i * 10} 98V${98 - h}`} className='dg-line' strokeWidth={4} />
        ))}
      </g>
      <path d='M270 100L324 62' pathLength={1} className='dg-accent' strokeWidth={2.4} style={{ ...draw(0.5, 0.56), ...pulse(0.5, 0.78) }} />
      <text x={270} y={114} className='dg-small' style={pulse(0.5, 0.78)}>offline</text>
      <text x={270} y={114} className='dg-small' style={fade(0.8, 0.86)}>online</text>

      {/* outbox queue */}
      <text x={276} y={296} className='dg-dim dg-small' style={fade(0.56, 0.62)}>outbox · 3</text>
      <g style={pulse(0.56, 0.93)}>
        <g style={travel(0.78, 0.9, 154, -168)}>
          {[2, 1].map((k) => (
            <g key={k} style={fade(0.6 + (2 - k) * 0.04, 0.66 + (2 - k) * 0.04)}>
              <rect x={280 + k * 7} y={346 - k * 8} width={104} height={36} rx={4} className='dg-fill' />
            </g>
          ))}
          <rect x={280} y={346} width={104} height={36} rx={4} className='dg-edge' style={fade(0.54, 0.6)} />
        </g>
      </g>

      {/* server */}
      <g style={rise(0.7, 0.8, 0, 10)}>
        <rect x={440} y={58} width={176} height={190} rx={8} className='dg-fill' />
        <text x={456} y={76} className='dg-dim dg-small'>server</text>
        <path d='M456 88H600' className='dg-edge' />
      </g>
      <path d='M392 330C420 330 420 262 440 252' pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.74, 0.82), opacity: `calc(1 - ${seg(0.9, 0.95)})` }} />
      {[0, 1, 2].map((i) => {
        const y = 108 + i * 42
        const a = 0.86 + i * 0.035
        return (
          <g key={i}>
            <rect x={456} y={y - 14} width={144} height={30} rx={4} className='dg-edge' style={fade(a - 0.02, a + 0.02)} />
            <path d={`M468 ${y}H540`} className='dg-edge' style={fade(a, a + 0.03)} />
            <circle cx={580} cy={y} r={8} className='dg-fill dg-accent' style={fade(a, a + 0.03)} />
            <path d={`M575.5 ${y}L578.5 ${y + 3}L584 ${y - 3.5}`} pathLength={1} className='dg-accent' style={draw(a, a + 0.05)} />
          </g>
        )
      })}
      <text x={456} y={266} className='dg-small' style={fade(0.92, 0.98)}>synced</text>
    </svg>
  )
}
