import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import {
  between,
  crosshairs,
  dimDuring,
  explode,
  FACE_TEXT,
  FRONT,
  grow,
  LAYERS,
  LEFT,
  lift,
  RIGHT,
  round,
  SLAB,
  SLAB_INSET,
  TOP,
} from '@/components/projects/diagram/agrita-mobile-parts'

// AgriTA Mobile, as a spec sheet. Left: the field worker's phone (home dashboard with the weather, today's tasks,
// the camera journal, the sync center). Right: the app's six layers as an exploded axonometric stack with numbered
// balloons, three of which also point at the part of the screen they draw. Over scroll: `flutter run` and the
// phone (0-0.2), the stack opens (0.2-0.52), a camera journal entry is written while the signal is gone and parks in
// the outbox on the sync layer (0.54-0.8), the signal returns and the queue rides the bus up to the external AgriTA
// API (0.8-1). Progress 0..1 (see anim.ts); geometry in agrita-mobile-parts.ts.

const DOTO = { fontFamily: 'var(--font-doto)' } as const

const TASKS = ['scout pests · area A', 'irrigation check', 'fertiliser log']
const TABS: [string, number][] = [['tasks', 70], ['journal', 110], ['harvest', 154], ['sync', 192]]
const SIDE = 'side · fl_chart · image_picker · speech_to_text · Sentry'
// The terminal line is typed one character at a time (a tspan each, 6.6 px per mono character at 11 px).
const COMMAND = 'flutter run'.split('')
const TYPE_STEP = 0.1 / COMMAND.length

// Balloon k sits in the gutter at the height of its open plate; three also lead to the phone.
const BALLOON_X = 282
const balloonY = (k: number) => round(LEFT[1] - lift(k))
const TO_PHONE: Partial<Record<number, number>> = { 0: 104, 3: 258, 5: 336 }

// The journal entry card: born in the viewfinder, parked on the sync plate, then flown up the bus to the API.
const CARD_W = 40
const CARD_H = 20
const CARD_AT: [number, number] = [126, 280]
const PARK: [number, number] = [round(TOP[0]), round(TOP[1] - 4)]
const BUS_X = 600
const BUS_Y = round(FRONT[1] - 44)
const API_AT: [number, number] = [BUS_X, 58]
// The dashed centerline grows up from under the sync plate.
const AXIS_FOOT = round(FRONT[1] + 12)

const PITCH_LIFT = (k: number) => lift(k)

function Plate ({ k }: { k: number }) {
  const layer = LAYERS[k]
  const a = 0.2 + (LAYERS.length - 1 - k) * 0.012
  return (
    <g style={{ ...explode(k, 0.3, 0.42), opacity: seg(a, a + 0.05) }}>
      <path className='iso-fill' d={SLAB.fill} />
      {SLAB.shades.map((d, shade) => d && <path key={shade} className='iso-shade' data-shade={shade} d={d} />)}
      <path className='iso-top' d={SLAB.top} />
      <path className='iso-line' data-tone='faint' strokeWidth={0.7} d={SLAB.crease} />
      {SLAB.bevel && <path className='iso-line' data-tone='faint' strokeWidth={0.7} d={SLAB.bevel} />}
      <path className='iso-line' data-tone='faint' strokeWidth={0.7} d={SLAB_INSET} />
      <path className='iso-line' data-tone='mid' strokeWidth={0.9} d={SLAB.outline} />
      <text transform={FACE_TEXT} className='dg-dim' style={{ fontSize: 9 }}>{layer.tech}</text>
      {k === 5 && <path d={`M${TOP[0] - 30} ${TOP[1]}l14 7l30 -15l-14 -7z`} className='dg-edge dg-dash' />}
    </g>
  )
}

function Balloon ({ k }: { k: number }) {
  const y = balloonY(k)
  const a = 0.42 + k * 0.016
  const phoneY = TO_PHONE[k]
  return (
    <g>
      <path d={`M${BALLOON_X + 8} ${y}L${round(LEFT[0])} ${y}`} pathLength={1} className='dg-line' strokeWidth={0.8} style={draw(a, a + 0.04)} />
      <circle cx={round(LEFT[0])} cy={y} r={1.4} className='dg-ink' style={fade(a + 0.03, a + 0.05)} />
      {phoneY !== undefined && (
        <path d={`M${BALLOON_X - 8} ${y}L${236} ${phoneY}H216`} pathLength={1} className='dg-accent' strokeWidth={0.8} style={draw(0.5, 0.56)} />
      )}
      <g style={rise(a + 0.02, a + 0.06, 0, 4)}>
        <circle cx={BALLOON_X} cy={y} r={8} className='dg-fill' />
        <text x={BALLOON_X} y={y} textAnchor='middle' style={{ fontSize: 10 }}>{k + 1}</text>
        <text x={546} y={round(RIGHT[1] - PITCH_LIFT(k) - 7)} style={{ fontSize: 10 }}>{LAYERS[k].id}</text>
      </g>
    </g>
  )
}

function EntryCard ({ check = false }: { check?: boolean }) {
  return (
    <g>
      <rect x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H} className='dg-fill' />
      <rect x={-CARD_W / 2 + 3} y={-CARD_H / 2 + 3} width={14} height={14} className='dg-edge' />
      <path d={`M${-CARD_W / 2 + 4.5} ${CARD_H / 2 - 4.5}l4 -5l3 3l2 -2l3 4`} className='dg-line' strokeWidth={0.8} />
      <path d={`M${-CARD_W / 2 + 20} ${-4}h14M${-CARD_W / 2 + 20} ${1}h10`} className='dg-edge' />
      {check && <path d={`M${CARD_W / 2 - 10} 5l2.5 2.5l5 -5.5`} pathLength={1} className='dg-accent' strokeWidth={1.4} style={draw(0.96, 1)} />}
    </g>
  )
}

export function AgritaMobileDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='AgriTA Mobile spec sheet: the field worker phone with the weather, tasks, camera journal and sync center; the app exploded into its ui, routes, state, forms, client and sync layers; a journal entry written offline waits in the outbox and syncs to the AgriTA API when the signal returns' className='dg'>
      {/* ---- the phone ---------------------------------------------------------------------------------------- */}
      <rect x={36} y={36} width={180} height={384} pathLength={1} className='dg-fill' style={draw(0, 0.1)} />
      <path d='M34.5 110v18M34.5 134v26M217.5 124v30' className='dg-line' style={fade(0.08, 0.12)} />
      <rect x={46} y={46} width={160} height={364} className='dg-edge' style={fade(0.06, 0.1)} />
      <circle cx={126} cy={57} r={3} className='dg-edge' style={fade(0.08, 0.12)} />
      <rect x={110} y={412} width={32} height={2.4} className='dg-ink' opacity={0.5} style={fade(0.08, 0.12)} />

      {/* status bar: app name, the signal bars (dimmed with a slash while the signal is gone) */}
      <g style={fade(0.1, 0.14)}>
        <text x={56} y={58} className='dg-dim dg-small'>AgriTA</text>
        <g style={dimDuring(0.6, 0.82, 0.25)}>
          <path d='M182 62v-3M186 62v-5M190 62v-7M194 62v-9' className='dg-line' strokeWidth={2} />
        </g>
      </g>
      <path d='M180 64L198 52' className='dg-accent' strokeWidth={1.4} style={pulse(0.6, 0.82)} />

      {/* home header and the notification bell */}
      <g style={fade(0.12, 0.16)}>
        <text x={56} y={76} style={{ fontSize: 10 }}>home</text>
        <path d='M190 80h8M191 80v-5a3 3 0 0 1 6 0v5M193 82h2' className='dg-line' strokeWidth={0.9} />
        <circle cx={198} cy={73} r={2} className='dg-solid' />
      </g>

      {/* weather card: sun and a small fl_chart sparkline */}
      <g style={rise(0.13, 0.18, 0, 6)}>
        <rect x={54} y={86} width={144} height={38} className='dg-fill' />
        <circle cx={72} cy={105} r={6} className='dg-line' />
        <path d='M72 95v-3M72 115v3M62 105h-3M82 105h3M64.9 97.9l-2.1-2.1M79.1 112.1l2.1 2.1M79.1 97.9l2.1-2.1M64.9 112.1l-2.1 2.1' className='dg-line' strokeWidth={0.9} />
        <text x={90} y={96} className='dg-dim dg-small'>weather · today</text>
        <path d='M90 118h100' className='dg-edge' />
      </g>
      <path d='M90 114C100 104 108 116 118 108S134 100 146 106S162 114 172 104S186 110 190 108' pathLength={1} className='dg-accent' style={draw(0.16, 0.24)} />

      {/* tasks list */}
      <text x={56} y={136} className='dg-dim dg-small' style={fade(0.16, 0.2)}>tasks · today</text>
      {TASKS.map((label, i) => {
        const y = 143 + i * 19
        const a = 0.17 + i * 0.02
        return (
          <g key={label}>
            <g style={fade(a, a + 0.03)}>
              <rect x={54} y={y} width={144} height={16} className='dg-fill' />
              <rect x={59} y={y + 3} width={10} height={10} className='dg-edge' />
              <text x={75} y={y + 8} className='dg-small'>{label}</text>
            </g>
            {i < 2 && <path d={`M61 ${y + 8}l2.5 2.5l5 -5.5`} pathLength={1} className='dg-accent' strokeWidth={1.3} style={draw(a + 0.03, a + 0.06)} />}
          </g>
        )
      })}

      {/* the camera journal: a viewfinder sub-panel with crosshairs, a plant in frame, the shutter */}
      <text x={56} y={210} className='dg-dim dg-small' style={fade(0.19, 0.23)}>journal · camera</text>
      <path d={crosshairs(54, 218, 144, 82)} className='dg-line' strokeWidth={0.8} style={fade(0.2, 0.24)} />
      <rect x={54} y={218} width={144} height={82} className='dg-edge' style={fade(0.2, 0.24)} />
      <rect x={54} y={218} width={144} height={82} className='dg-wash' style={pulse(0.54, 0.575, 0.01)} />
      <g style={fade(0.21, 0.26)}>
        <path d='M62 292C90 282 120 288 150 278S180 282 190 286' className='dg-line' strokeWidth={0.9} />
        <path d='M118 290C118 270 116 256 112 246M118 274c-10-2-16-8-18-18 10 2 16 8 18 18zM118 264c10-2 16-8 18-18-10 2-16 8-18 18zM116 254c-8-4-10-10-10-16 8 4 10 10 10 16z' className='dg-line' strokeWidth={0.9} />
        <path d='M86 230h-12v12M166 230h12v12M86 288h-12v-12M166 288h12v-12' className='dg-accent' strokeWidth={0.9} />
      </g>
      <circle cx={126} cy={310} r={7} className='dg-line' style={fade(0.22, 0.26)} />
      <circle cx={126} cy={310} r={4} className='dg-solid' style={pulse(0.54, 0.6, 0.015)} />

      {/* sync center strip, then its status: outbox count while offline, synced at the end */}
      <g style={fade(0.23, 0.27)}>
        <rect x={54} y={322} width={144} height={28} className='dg-fill' />
        <text x={60} y={331} className='dg-dim dg-small'>sync center</text>
        <path d='M60 343h132' className='dg-edge' />
      </g>
      <text x={192} y={331} textAnchor='end' className='dg-small' style={between(0.23, 0.7)}>idle</text>
      <text x={192} y={331} textAnchor='end' className='dg-small' style={between(0.72, 0.94)}>outbox · 3</text>
      <text x={192} y={331} textAnchor='end' className='dg-small' style={{ ...fade(0.96, 1), fill: 'hsl(var(--primary))' }}>synced</text>
      <path d='M60 343h132' pathLength={1} className='dg-accent' strokeWidth={2} style={{ ...draw(0.88, 0.97), opacity: seg(0.86, 0.88) }} />

      {/* tab bar */}
      <path d='M46 386H206' className='dg-edge' style={fade(0.1, 0.14)} />
      {TABS.map(([t, x]) => (
        <text key={t} x={x} y={398} textAnchor='middle' className='dg-dim dg-small' style={fade(0.1, 0.14)}>{t}</text>
      ))}

      {/* ---- the exploded stack ------------------------------------------------------------------------------ */}
      <path d={`M${TOP[0]} ${AXIS_FOOT}V28`} className='dg-line dg-dash' strokeWidth={0.8} style={grow(0.3, 0.42, AXIS_FOOT)} />
      {LAYERS.map((_, i) => <Plate key={i} k={LAYERS.length - 1 - i} />)}
      {LAYERS.map((_, k) => <Balloon key={k} k={k} />)}

      {/* the journal entry: appears in the viewfinder, flies to the outbox on the sync plate, then rides the bus */}
      <g transform={`translate(${CARD_AT[0]} ${CARD_AT[1]})`}>
        <g style={rise(0.56, 0.6, 0, 8)}>
          <g style={travel(0.64, 0.72, PARK[0] - CARD_AT[0], PARK[1] - CARD_AT[1])}>
            <g style={travel(0.86, 0.9, BUS_X - PARK[0], BUS_Y - PARK[1])}>
              <g style={travel(0.9, 0.96, 0, API_AT[1] - BUS_Y)}>
                <g transform='translate(6 -6)'><g style={fade(0.74, 0.77)}><EntryCard /></g></g>
                <g transform='translate(3 -3)'><g style={fade(0.72, 0.75)}><EntryCard /></g></g>
                <EntryCard check />
              </g>
            </g>
          </g>
        </g>
      </g>

      {/* the bus from the sync plate up to the API, and the status beside it */}
      <path d={`M${round(RIGHT[0])} ${BUS_Y}H${BUS_X}V${API_AT[1] + CARD_H / 2 + 4}`} className='dg-accent dg-dash' strokeWidth={0.9} style={fade(0.8, 0.86)} />
      <text x={BUS_X + 4} y={BUS_Y + 18} textAnchor='end' className='dg-small' style={between(0.62, 0.72)}>offline · queued</text>
      <text x={BUS_X + 4} y={BUS_Y + 18} textAnchor='end' className='dg-small' style={between(0.74, 0.8)}>offline · 3 queued</text>
      <text x={BUS_X + 4} y={BUS_Y + 18} textAnchor='end' className='dg-small' style={between(0.82, 0.94)}>online · flushing</text>
      <text x={BUS_X + 4} y={BUS_Y + 18} textAnchor='end' className='dg-small' style={fade(0.96, 1)}>outbox empty</text>

      {/* the external AgriTA API */}
      <g style={rise(0.44, 0.5, 0, -6)}>
        <rect x={540} y={12} width={88} height={60} className='dg-edge dg-dash' />
        <path d={crosshairs(540, 12, 88, 60)} className='dg-line' strokeWidth={0.8} />
        <text x={548} y={24} style={{ fontSize: 10 }}>AgriTA API</text>
        <text x={548} y={35} className='dg-dim dg-small'>external</text>
      </g>

      {/* side modules */}
      <text x={320} y={436} className='dg-dim dg-small' style={fade(0.5, 0.54)}>{SIDE}</text>

      {/* ---- terminal line ------------------------------------------------------------------------------------ */}
      <text x={36} y={446} style={{ fontSize: 11 }}>$</text>
      <text x={48} y={446} style={{ fontSize: 11 }}>
        {COMMAND.map((ch, i) => <tspan key={i} style={fade(0.02 + i * TYPE_STEP, 0.02 + (i + 1) * TYPE_STEP)}>{ch}</tspan>)}
      </text>
      <rect x={48} y={440} width={6.6} height={12} className='dg-solid' style={travel(0.02, 0.02 + COMMAND.length * TYPE_STEP, 6.6 * COMMAND.length, 0)} />
      <text x={36} y={464} className='dg-dim dg-small' style={fade(0.14, 0.18)}>launching on android · debug</text>

      {/* ---- title block -------------------------------------------------------------------------------------- */}
      <g style={fade(0, 0.04)}>
        <rect x={20} y={478} width={600} height={28} className='dg-edge' />
        <path d='M300 478v28M420 478v28M520 478v28' className='dg-edge' />
        <text x={30} y={492} style={{ ...DOTO, fontSize: 14, fontWeight: 800 }}>AGRITA MOBILE</text>
        <text x={166} y={492} className='dg-dim dg-small'>flutter field app</text>
        <text x={310} y={492} className='dg-small'><tspan className='dg-dim'>sheet </tspan>5 / 8</text>
        <text x={430} y={492} className='dg-small'><tspan className='dg-dim'>scale </tspan>1:1</text>
        <text x={530} y={492} className='dg-small'><tspan className='dg-dim'>view </tspan>exploded</text>
      </g>
    </svg>
  )
}
