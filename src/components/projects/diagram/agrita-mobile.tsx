import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// AgriTA Mobile, wireframed: the field worker's phone (home with weather, today's tasks, the camera journal), the sync
// center with its offline outbox, and the AgriTA API as an external box. Over scroll: the ghosted frame comes to full
// strength and the tasks get ticked (0-0.25); a journal entry is captured, the signal drops and the entry waits in the
// outbox with two more (0.25-0.75); the signal returns and the outbox flushes to the API (0.75-0.95). The stack strip
// below lights the layer each beat touches. Progress 0..1 is `--p` (see anim.ts).

// Ghosted (0.3) at p=0, full strength from `b`.
const ghost = (a: number, b: number) => ({ opacity: `calc(0.3 + 0.7 * ${seg(a, b)})` })
// Dips to `low` between a and b (the signal bars while offline).
const dimDuring = (a: number, b: number, low: number) => ({
  opacity: `calc(1 - ${1 - low} * min(${seg(a, a + 0.03)}, 1 - ${seg(b - 0.03, b)}))`,
})

const COMMAND = 'flutter run'.split('')
const TYPE_STEP = 0.1 / COMMAND.length
const CHAR_W = 6.6

const TASKS = ['Watering', 'Fertilizing', 'Scouting']
const TASK_Y = [116, 140, 164]
const TABS = [66, 104, 142, 180]
// Where the entry is born (the viewfinder), the outbox rows it lands in, and the API box.
const BORN: [number, number] = [131, 236]
const ROWS = [226, 252, 278]
const OUTBOX_X = 272
const API: [number, number] = [470, 36]

// The stack from the app's config (src/components/iso/figures/agrita-mobile/config.ts), lit in the order the action
// touches it: ui while the phone comes up, routes when the journal opens, forms on capture, state as the entry is held,
// sync while it queues offline, client when dio flushes to the API.
const STACK = [
  { label: 'ui', tech: 'Flutter', lit: [0.04, 0.26] },
  { label: 'routes', tech: 'go_router', lit: [0.26, 0.33] },
  { label: 'state', tech: 'Riverpod', lit: [0.42, 0.55] },
  { label: 'forms', tech: 'reactive_forms', lit: [0.33, 0.42] },
  { label: 'client', tech: 'dio', lit: [0.8, 0.96] },
  { label: 'sync', tech: 'workmanager', lit: [0.55, 0.8] },
]
const CELL_W = 92
const CELL_Y = 372
const cellX = (i: number) => 24 + i * (CELL_W + 8)

// One outbox row: a photo thumbnail and a text bar, the size of its slot in the sync center.
function Entry () {
  return (
    <g>
      <rect x={-70} y={-10} width={140} height={20} className='dg-fill' style={{ stroke: 'currentColor' }} />
      <rect x={-64} y={-6} width={12} height={12} className='dg-wash' />
      <path d='M-46 0h58' className='dg-edge' strokeWidth={4} />
    </g>
  )
}

export function AgritaMobileDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='AgriTA Mobile: a phone with weather, tasks and a camera journal; a journal entry captured offline waits in the sync center outbox and syncs to the AgriTA API when the signal returns; below, the Flutter stack' className='dg'>
      <g style={ghost(0, 0.12)}>
        {/* ---- the phone -------------------------------------------------------------------------------------- */}
        <rect x={36} y={28} width={190} height={310} className='dg-fill' />
        <rect x={46} y={38} width={170} height={290} className='dg-edge' />
        <text x={54} y={50}>AgriTA</text>
        <path d='M190 56v-4M195 56v-7M200 56v-10M205 56v-13' className='dg-line' strokeWidth={3} style={dimDuring(0.36, 0.8, 0.25)} />

        {/* home: weather card */}
        <rect x={54} y={62} width={154} height={44} className='dg-fill' />
        <circle cx={70} cy={84} r={8} className='dg-line' />
        <text x={88} y={78} className='dg-dim'>weather</text>
        <path d='M88 94h62' className='dg-edge' strokeWidth={4} />

        {/* today's tasks */}
        {TASKS.map((name, i) => (
          <g key={name}>
            <rect x={54} y={TASK_Y[i]} width={154} height={20} className='dg-fill' />
            <rect x={61} y={TASK_Y[i] + 5} width={10} height={10} className='dg-edge' />
            <text x={78} y={TASK_Y[i] + 10}>{name}</text>
          </g>
        ))}

        {/* the camera journal: viewfinder and shutter */}
        <rect x={54} y={194} width={154} height={84} className='dg-edge' />
        <path d='M64 214v-10h10M198 214v-10h-10M64 258v10h10M198 258v10h-10' className='dg-accent' strokeWidth={1.4} />
        <text x={80} y={210} className='dg-dim'>journal</text>
        <circle cx={131} cy={300} r={8} className='dg-line' />

        {/* tab bar */}
        <path d='M46 314H216' className='dg-edge' />
        {TABS.map((x, i) => <rect key={x} x={x} y={319} width={20} height={4} className={i === 0 ? 'dg-ink' : 'dg-edge'} />)}

        {/* ---- the sync center and its outbox ----------------------------------------------------------------- */}
        <path d='M226 236H262' className='dg-edge dg-dash' />
        <rect x={262} y={190} width={160} height={120} className='dg-fill' />
        <text x={OUTBOX_X} y={204}>Sync center</text>
        {ROWS.map((y) => <rect key={y} x={OUTBOX_X} y={y - 10} width={140} height={20} className='dg-edge dg-dash' />)}

        {/* ---- the AgriTA API, outside the owner's work --------------------------------------------------------- */}
        <path d={`M422 250H543V${API[1] + 100}`} className='dg-edge dg-dash' />
        <rect x={API[0]} y={API[1]} width={146} height={100} className='dg-edge' />
        <text x={API[0] + 10} y={API[1] + 14} className='dg-dim'>AgriTA API</text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={API[0] + 10} y={API[1] + 28 + i * 22} width={126} height={16} className='dg-edge' />
            <circle cx={API[0] + 20} cy={API[1] + 36 + i * 22} r={2.5} className='dg-edge' />
          </g>
        ))}

        {/* ---- the stack strip -------------------------------------------------------------------------------- */}
        {STACK.map(({ label, tech }, i) => (
          <g key={label}>
            <rect x={cellX(i)} y={CELL_Y} width={CELL_W} height={64} className='dg-fill' />
            <text x={cellX(i) + 6} y={CELL_Y + 16} className='dg-dim' style={{ fontSize: 10 }}>{label}</text>
            <text x={cellX(i) + 6} y={CELL_Y + 42} style={tech.length > 12 ? { fontSize: 10 } : undefined}>{tech}</text>
          </g>
        ))}
      </g>

      {/* ---- the action ----------------------------------------------------------------------------------------- */}
      {/* beat 1: the first two tasks get ticked */}
      {[0, 1].map((i) => (
        <path key={i} d={`M63 ${TASK_Y[i] + 10}l2.5 2.5l5 -5.5`} pathLength={1} className='dg-accent' strokeWidth={1.6} style={draw(0.14 + i * 0.04, 0.2 + i * 0.04)} />
      ))}

      {/* beat 2: the shutter fires, the signal is struck, the entry parks in the outbox with two more */}
      <rect x={54} y={194} width={154} height={84} className='dg-wash' style={pulse(0.33, 0.38, 0.01)} />
      <circle cx={131} cy={300} r={5} className='dg-solid' style={pulse(0.33, 0.4, 0.015)} />
      <path d='M186 60L210 40' className='dg-accent' strokeWidth={1.6} style={pulse(0.36, 0.8)} />
      <text x={262} y={174} className='dg-dim' style={pulse(0.38, 0.8)}>offline</text>
      <g transform={`translate(${BORN[0]} ${BORN[1]})`}>
        <g style={travel(0.44, 0.54, OUTBOX_X + 70 - BORN[0], ROWS[0] - BORN[1])}>
          <g style={fade(0.35, 0.4)}><Entry /></g>
        </g>
      </g>
      {ROWS.slice(1).map((y, i) => (
        <g key={y} transform={`translate(${OUTBOX_X + 70} ${y})`}><g style={rise(0.58 + i * 0.08, 0.64 + i * 0.08, 0, 8)}><Entry /></g></g>
      ))}
      <text x={OUTBOX_X} y={298} className='dg-dim' style={pulse(0.72, 0.9)}>3 queued</text>

      {/* beat 3: the signal returns, the outbox flushes to the API, the last slot lights up */}
      <path d={`M422 250H543V${API[1] + 100}`} pathLength={1} className='dg-accent' style={draw(0.8, 0.9)} />
      {ROWS.map((y, i) => (
        <rect key={y} x={OUTBOX_X + 6} y={y - 6} width={12} height={12} className='dg-solid' style={fade(0.84 + i * 0.03, 0.88 + i * 0.03)} />
      ))}
      <rect x={API[0] + 10} y={API[1] + 72} width={126} height={16} className='dg-solid' style={fade(0.9, 0.94)} />
      <text x={OUTBOX_X} y={298} style={{ ...fade(0.92, 0.96), fill: 'hsl(var(--primary))' }}>3 synced</text>

      {/* the stack cell of the layer each beat touches */}
      {STACK.map(({ label, lit: [a, b] }, i) => (
        <g key={label} style={pulse(a, b)}>
          <rect x={cellX(i)} y={CELL_Y} width={CELL_W} height={64} className='dg-wash' />
          <rect x={cellX(i)} y={CELL_Y} width={CELL_W} height={64} className='dg-accent' />
        </g>
      ))}

      {/* ---- terminal line ---------------------------------------------------------------------------------------- */}
      <text x={24} y={478}>$</text>
      <text x={36} y={478}>
        {COMMAND.map((ch, i) => <tspan key={i} style={fade(0.02 + i * TYPE_STEP, 0.02 + (i + 1) * TYPE_STEP)}>{ch}</tspan>)}
      </text>
      <rect x={36} y={472} width={CHAR_W} height={12} className='dg-solid' style={travel(0.02, 0.12, CHAR_W * COMMAND.length)} />
    </svg>
  )
}
