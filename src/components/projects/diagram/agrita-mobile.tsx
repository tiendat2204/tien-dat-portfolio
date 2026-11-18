import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// AgriTA Mobile, wireframed: the field worker's phone (status bar, weather, today's tasks, the camera journal, the tab
// bar), a queue of journal cards and the server. Over scroll: the wireframe draws itself (0-0.25); a journal entry is
// captured, the signal drops and the entry waits in the offline queue with two more (0.25-0.75); the signal returns
// and the queue flushes to the server (0.75-0.95). Progress 0..1 is `--p` (see anim.ts).

// `--p`-driven opacity that dips to `low` between a and b (the signal bars while offline).
const dimDuring = (a: number, b: number, low: number) => ({
  opacity: `calc(1 - ${1 - low} * min(${seg(a, a + 0.03)}, 1 - ${seg(b - 0.03, b)}))`,
})

const COMMAND = 'flutter run'.split('')
const TYPE_STEP = 0.1 / COMMAND.length
const CHAR_W = 6.6

const TASKS = [164, 190, 216]
const TABS = [82, 118, 154, 190]
// The entry card is born in the viewfinder, parks in the queue, then flies to the server and dissolves into it.
const BORN: [number, number] = [148, 300]
const QUEUE: [number, number] = [388, 304]
const SERVER: [number, number] = [548, 128]

function Card () {
  return (
    <g>
      <rect x={-30} y={-17} width={60} height={34} className='dg-fill' style={{ stroke: 'currentColor' }} />
      <rect x={-23} y={-9} width={18} height={18} className='dg-wash' />
      <path d='M4 -6h18M4 4h12' className='dg-edge' strokeWidth={4} />
    </g>
  )
}

export function AgritaMobileDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='AgriTA Mobile: a phone with tasks and a camera journal; a journal entry captured offline waits in a queue and syncs to the server when the signal returns' className='dg'>
      {/* ---- the phone ---------------------------------------------------------------------------------------- */}
      <rect x={48} y={44} width={200} height={420} pathLength={1} className='dg-fill' style={draw(0, 0.1)} />
      <rect x={60} y={56} width={176} height={396} className='dg-edge' style={fade(0.08, 0.12)} />

      {/* status bar: app name bar and the signal, struck while offline */}
      <g style={fade(0.1, 0.14)}>
        <rect x={72} y={68} width={28} height={5} className='dg-ink' />
        <path d='M208 76v-4M213 76v-7M218 76v-10M223 76v-13' className='dg-line' strokeWidth={3} style={dimDuring(0.36, 0.8, 0.25)} />
      </g>
      <path d='M203 79L228 60' className='dg-accent' strokeWidth={1.6} style={pulse(0.36, 0.8)} />

      {/* weather card */}
      <g style={rise(0.12, 0.17, 0, 6)}>
        <rect x={72} y={92} width={152} height={56} className='dg-fill' />
        <circle cx={94} cy={120} r={9} className='dg-line' />
        <rect x={114} y={110} width={70} height={5} className='dg-ink' />
        <path d='M114 128h46' className='dg-edge' strokeWidth={5} />
      </g>

      {/* today's tasks: rows with check squares */}
      {TASKS.map((y, i) => (
        <g key={y}>
          <g style={rise(0.15 + i * 0.02, 0.19 + i * 0.02, 0, 6)}>
            <rect x={72} y={y} width={152} height={20} className='dg-fill' />
            <rect x={79} y={y + 5} width={10} height={10} className='dg-edge' />
            <path d={`M98 ${y + 10}h${i === 1 ? 54 : 78}`} className='dg-edge' strokeWidth={5} />
          </g>
          {i < 2 && <path d={`M81 ${y + 10}l2.5 2.5l5 -5.5`} pathLength={1} className='dg-accent' strokeWidth={1.6} style={draw(0.2 + i * 0.02, 0.24 + i * 0.02)} />}
        </g>
      ))}

      {/* the camera journal: viewfinder and shutter */}
      <g style={fade(0.2, 0.25)}>
        <rect x={72} y={250} width={152} height={100} className='dg-edge' />
        <path d='M84 274v-12h12M212 274v-12h-12M84 326v12h12M212 326v12h-12' className='dg-accent' strokeWidth={1.4} />
        <circle cx={148} cy={372} r={9} className='dg-line' />
      </g>
      <rect x={72} y={250} width={152} height={100} className='dg-wash' style={pulse(0.27, 0.31, 0.01)} />
      <circle cx={148} cy={372} r={5} className='dg-solid' style={pulse(0.27, 0.33, 0.015)} />

      {/* tab bar */}
      <g style={fade(0.1, 0.14)}>
        <path d='M60 426H236' className='dg-edge' />
        {TABS.map((x, i) => <rect key={x} x={x} y={436} width={20} height={4} className={i === 0 ? 'dg-ink' : 'dg-edge'} />)}
      </g>

      {/* ---- the route: phone to queue to server ----------------------------------------------------------------- */}
      <path d={`M248 ${BORN[1]}H${QUEUE[0] - 44}M${QUEUE[0] + 44} ${QUEUE[1]}H${SERVER[0]}V${SERVER[1] + 56}`} className='dg-edge dg-dash' style={fade(0.18, 0.26)} />
      <rect x={QUEUE[0] - 44} y={QUEUE[1] - 30} width={88} height={60} className='dg-edge dg-dash' style={fade(0.18, 0.26)} />
      <path d={`M${QUEUE[0] + 40} ${QUEUE[1]}H${SERVER[0]}V${SERVER[1] + 56}`} pathLength={1} className='dg-accent' style={draw(0.8, 0.9)} />

      {/* the server block: three slots, the last lights up once the queue has arrived */}
      <g style={rise(0.2, 0.26, 0, -6)}>
        <rect x={SERVER[0] - 52} y={SERVER[1] - 52} width={104} height={104} className='dg-fill' />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={SERVER[0] - 38} y={SERVER[1] - 38 + i * 28} width={76} height={20} className='dg-edge' />
            <circle cx={SERVER[0] - 26} cy={SERVER[1] - 28 + i * 28} r={3} className='dg-edge' />
          </g>
        ))}
      </g>
      <rect x={SERVER[0] - 38} y={SERVER[1] + 18} width={76} height={20} className='dg-solid' style={fade(0.9, 0.94)} />

      {/* the journal entry and the two that follow it into the queue */}
      <g transform={`translate(${BORN[0]} ${BORN[1]})`}>
        <g style={travel(0.4, 0.5, QUEUE[0] - BORN[0], QUEUE[1] - BORN[1])}>
          <g style={travel(0.8, 0.9, SERVER[0] - QUEUE[0], SERVER[1] + 28 - QUEUE[1])}>
            <g transform='translate(12 -12)' style={pulse(0.62, 0.93, 0.04)}><Card /></g>
            <g transform='translate(6 -6)' style={pulse(0.55, 0.93, 0.04)}><Card /></g>
            <g style={pulse(0.29, 0.93, 0.04)}><g style={rise(0.29, 0.35, 0, 8)}><Card /></g></g>
          </g>
        </g>
      </g>

      {/* the only two words */}
      <text x={QUEUE[0]} y={QUEUE[1] + 44} textAnchor='middle' className='dg-dim' style={pulse(0.42, 0.78)}>offline</text>
      <text x={SERVER[0] + 10} y={SERVER[1] + 72} style={{ ...fade(0.93, 0.97), fill: 'hsl(var(--primary))' }}>synced</text>

      {/* ---- terminal line ------------------------------------------------------------------------------------ */}
      <text x={48} y={490}>$</text>
      <text x={60} y={490}>
        {COMMAND.map((ch, i) => <tspan key={i} style={fade(0.02 + i * TYPE_STEP, 0.02 + (i + 1) * TYPE_STEP)}>{ch}</tspan>)}
      </text>
      <rect x={60} y={484} width={CHAR_W} height={12} className='dg-solid' style={travel(0.02, 0.12, CHAR_W * COMMAND.length)} />
    </svg>
  )
}
