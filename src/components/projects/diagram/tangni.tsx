import type { CSSProperties } from 'react'

import { Solid } from '@/components/iso/kit/react/draw'
import { insetPlan, iso, planOutline, slabOf, type Plan, type Projection } from '@/components/iso/kit/iso-kit'
import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// TangNi Web, Fig 6 "review": the two-level profile review as a spec sheet. Left, the product: a member drafts a
// profile with identity documents, a congregation secretary reviews it, an admin gives the final approval, and the
// public lookup finds the approved profile. Right, the anatomy: the frontend stack (figures/tangni/config.ts) exploded
// along its axis with balloons 1-5; the same numbers on the scene mark which layer draws each part. Below, the
// terminal line and the title block. Everything is a calc() of `--p` (anim.ts). Facts only, generic labels.

// --- Scene: the three stations ---------------------------------------------------------------------------------------
const ST_X = [24, 146, 268]
const ST_W = 100
const ST_Y = 30
const ST_H = 190
const STATIONS = [
  { n: '01', who: 'member', step: 'draft · submit' },
  { n: '02', who: 'secretary', step: 'review' },
  { n: '03', who: 'admin', step: 'final approval' },
]
const HOP = ST_X[1] - ST_X[0]

// The profile card, built in station 01 and carried on twice.
const CARD = { x: 32, y: 66, w: 84, h: 106 }
const SECTIONS = ['personal', 'identity', 'contact', 'monastic']
// The status badge's three readings and when each one shows (the last one holds).
const BADGES: { text: string, from: number, to: number, on?: boolean }[] = [
  { text: 'draft', from: 0.1, to: 0.4 },
  { text: 'pending', from: 0.4, to: 0.68 },
  { text: 'approved', from: 0.68, to: 1.2, on: true },
]

// --- Anatomy: the exploded stack ------------------------------------------------------------------------------------
const P: Projection = { origin: [482, 195], scale: 0.95 }
const PLAN: Plan = { x: -42, y: -28, w: 84, d: 56, r: 3 }
const BASE: Plan = { x: -56, y: -39, w: 112, d: 78, r: 5 }
const T = 4
const REST = 7
const OPEN = 30
const LAYERS = [
  { label: 'ui', tech: 'React 19 · shadcn/ui · Tailwind' },
  { label: 'routes', tech: 'Vite · TanStack Router · zod search' },
  { label: 'data', tech: 'TanStack Query · Table · Zustand' },
  { label: 'forms', tech: 'React Hook Form · Zod' },
  { label: 'api', tech: 'Axios client · token refresh' },
]
const N = LAYERS.length
// Plate i (0 = bottom) is the config's layer N - 1 - i; balloon n = N - i.
const plateZ = (i: number, open: number) => i * (open ? OPEN : REST)
const dy = (i: number) => iso([0, 0, plateZ(i, 1)], P)[1] - iso([0, 0, plateZ(i, 0)], P)[1]
const PLATES = Array.from({ length: N }, (_, i) => {
  const z = plateZ(i, 0)
  const chip: Plan = { x: -16, y: -8, w: 20, d: 12, r: 1 }
  return {
    body: slabOf(PLAN, z, T, P),
    inset: planOutline(insetPlan(PLAN, 5), z + T, P),
    chip: slabOf(chip, z + T, 1.6, P),
    traces: [12, 18, 24].map(y => `M${iso([-32, y, z + T], P).join(' ')}L${iso([8, y, z + T], P).join(' ')}`).join(''),
    root: iso([PLAN.x + PLAN.w, PLAN.y + 6, plateZ(i, 1) + T / 2], P),
    dy: dy(i),
  }
})
const BASE_SOLID = slabOf(BASE, -3, 3, P)
const AXIS_FROM = iso([0, 0, 0], P)
const AXIS_TO = iso([0, 0, plateZ(N - 1, 1) + T + 16], P)
const BALLOON_DX = 34
const BALLOON_DY = -11

// The separate backend, under the base where the centerline ends; the bill of materials under that.
const BASE_BOTTOM = iso([BASE.x + BASE.w, BASE.y + BASE.d, -3], P)[1]
const EXT = { x: 444, y: Math.round(BASE_BOTTOM) + 6, w: 76, h: 18 }
const BOM_Y = EXT.y + EXT.h + 18

// --- Sheet furniture --------------------------------------------------------------------------------------------------
const TERM = { x: 24, y: 360, w: 592, h: 84 }
const CMD = 'cat decision.api.ts'
const CH = 6.6
const TITLE = { x: 24, y: 462, w: 592, h: 36 }

const doto: CSSProperties = { fontFamily: 'var(--font-doto)' }

// A stamp slams down: fades in while shrinking onto the card.
const stamp = (a: number, b: number, deg: number): CSSProperties => ({
  opacity: seg(a, b),
  transform: `rotate(${deg}deg) scale(calc(1.6 - 0.6 * ${seg(a, b)}))`,
  transformBox: 'fill-box',
  transformOrigin: 'center',
})

// `+` crosshairs on a sub-panel's corners.
function Corners ({ x, y, w, h, style }: { x: number, y: number, w: number, h: number, style?: CSSProperties }) {
  const d = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy]) => `M${cx - 4} ${cy}h8M${cx} ${cy - 4}v8`).join('')
  return <path d={d} className='dg-line' style={style} />
}

function Mark ({ n, x, y, style }: { n: number, x: number, y: number, style?: CSSProperties }) {
  return (
    <g style={style}>
      <circle cx={x} cy={y} r={6.5} className='dg-fill dg-accent' />
      <text x={x} y={y} textAnchor='middle' className='dg-small'>{n}</text>
    </g>
  )
}

export function TangniDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='TangNi: a member drafts a profile with identity documents, a congregation secretary reviews it, an admin gives final approval and a public lookup finds it; beside it the frontend stack exploded into ui, routes, data, forms and api layers' className='dg'>
      <defs>
        <clipPath id='tg-cmd'>
          <rect x={TERM.x + 24} y={TERM.y + 8} height={20} style={{ width: `calc(${seg(0.84, 0.92)} * ${CMD.length * CH + 2}px)` }} />
        </clipPath>
        <clipPath id='tg-query'>
          <rect x={60} y={262} height={26} style={{ width: `calc(${seg(0.8, 0.86)} * 130px)` }} />
        </clipPath>
      </defs>

      {/* stations: three sub-panels with corner marks and a header rule */}
      {STATIONS.map((s, i) => {
        const x = ST_X[i]
        const a = 0.02 + i * 0.03
        return (
          <g key={s.who}>
            <rect x={x} y={ST_Y} width={ST_W} height={ST_H} pathLength={1} className='dg-edge' style={draw(a, a + 0.1)} />
            <Corners x={x} y={ST_Y} w={ST_W} h={ST_H} style={fade(a + 0.06, a + 0.1)} />
            <path d={`M${x} ${ST_Y + 24}H${x + ST_W}`} className='dg-edge' style={fade(a + 0.06, a + 0.1)} />
            <text x={x + 8} y={ST_Y + 12} className='dg-dim dg-small' style={{ ...fade(a + 0.06, a + 0.1), ...doto, fontSize: 11 }}>{s.n}</text>
            <text x={x + ST_W / 2 + 8} y={ST_Y + 12} textAnchor='middle' style={{ ...fade(a + 0.06, a + 0.1), fontSize: 10 }}>{s.who}</text>
            <g style={fade(i === 0 ? 0.12 : i === 1 ? 0.38 : 0.64, i === 0 ? 0.18 : i === 1 ? 0.44 : 0.7)}>
              <rect x={x + 10} y={ST_Y + ST_H - 32} width={ST_W - 20} height={20} rx={4} className={i === 2 ? 'dg-wash dg-accent' : 'dg-fill'} />
              <text x={x + ST_W / 2} y={ST_Y + ST_H - 22} textAnchor='middle' className='dg-small'>{s.step}</text>
            </g>
          </g>
        )
      })}

      {/* hand-offs between stations, with the review-level dimension under them */}
      {[0, 1].map(i => {
        const x = ST_X[i] + ST_W
        const a = i === 0 ? 0.24 : 0.5
        return <path key={i} d={`M${x + 2} 118H${x + HOP - ST_W - 2}M${x + HOP - ST_W - 8} 113L${x + HOP - ST_W - 2} 118L${x + HOP - ST_W - 8} 123`} pathLength={1} className='dg-accent' style={draw(a, a + 0.08)} />
      })}
      <g style={fade(0.7, 0.76)}>
        <path d={`M${ST_X[0]} 232H${ST_X[2] + ST_W}M${ST_X[0]} 228v8M${ST_X[1] + ST_W / 2} 228v8M${ST_X[2] + ST_W} 228v8`} className='dg-line' />
        <text x={ST_X[0] + HOP / 2 + 25} y={232} textAnchor='middle' className='dg-dim dg-small'>level 1</text>
        <text x={ST_X[1] + ST_W / 2 + HOP / 2 + 25} y={232} textAnchor='middle' className='dg-dim dg-small'>level 2</text>
      </g>

      {/* where the card was: dashed ghosts left behind in 01 and 02 */}
      <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={4} className='dg-edge dg-dash' style={fade(0.28, 0.34)} />
      <rect x={CARD.x + HOP} y={CARD.y} width={CARD.w} height={CARD.h} rx={4} className='dg-edge dg-dash' style={fade(0.54, 0.6)} />

      {/* the profile card: drafted in 01, carried to 02 and 03, stamped twice */}
      <g style={travel(0.26, 0.36, HOP)}>
        <g style={travel(0.52, 0.62, HOP)}>
          <g style={rise(0.08, 0.16, 0, 10)}>
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={4} className='dg-fill' />
            <text x={CARD.x + 8} y={CARD.y + 10} className='dg-dim dg-small'>profile</text>
            <circle cx={CARD.x + 70} cy={CARD.y + 42} r={9} className='dg-line' />
            <path d={`M${CARD.x + 8} ${CARD.y + 40}H${CARD.x + 52}M${CARD.x + 8} ${CARD.y + 48}H${CARD.x + 40}`} className='dg-edge' />
            <path d={`M${CARD.x + 8} ${CARD.y + 56}H${CARD.x + 76}`} className='dg-edge' />
          </g>
          {/* the badge: draft, pending, approved */}
          <g style={fade(0.1, 0.16)}>
            <rect x={CARD.x + 8} y={CARD.y + 18} width={52} height={13} rx={3} className='dg-fill' />
          </g>
          {BADGES.map(b => (
            <g key={b.text} style={pulse(b.from, b.to)}>
              {b.on && <rect x={CARD.x + 8} y={CARD.y + 18} width={52} height={13} rx={3} className='dg-wash dg-accent' />}
              <text x={CARD.x + 34} y={CARD.y + 24.5} textAnchor='middle' className='dg-small'>{b.text}</text>
            </g>
          ))}
          {/* the form sections fill in while drafting */}
          {SECTIONS.map((s, i) => {
            const y = CARD.y + 65 + i * 11
            const a = 0.14 + i * 0.02
            return (
              <g key={s}>
                <circle cx={CARD.x + 11} cy={y} r={3} className='dg-edge' style={fade(0.1, 0.16)} />
                <path d={`M${CARD.x + 9.5} ${y}l1.2 1.3 2.3 -2.6`} pathLength={1} className='dg-accent' style={draw(a, a + 0.03)} />
                <text x={CARD.x + 19} y={y} className='dg-small' style={fade(a, a + 0.03)}>{s}</text>
              </g>
            )
          })}
          {/* the attached identity document, paper-clipped over the card's top corner */}
          <g style={rise(0.2, 0.26, 6, -6)}>
            <path d={`M${CARD.x + 62} ${CARD.y - 10}h16l6 6v22h-22zM${CARD.x + 78} ${CARD.y - 10}v6h6`} className='dg-fill' />
            <circle cx={CARD.x + 70} cy={CARD.y - 1} r={2.4} className='dg-line' />
            <path d={`M${CARD.x + 67} ${CARD.y + 6}h12M${CARD.x + 67} ${CARD.y + 11}h8`} className='dg-edge' />
            <path d={`M${CARD.x + 60} ${CARD.y + 8}v-9a3 3 0 0 1 6 0v12a4.5 4.5 0 0 1 -9 0v-8`} className='dg-line' />
          </g>
          {/* stamps: the secretary's over the name, the admin's across the bottom rows */}
          <g style={stamp(0.38, 0.44, -8)}>
            <rect x={CARD.x + 14} y={CARD.y + 34} width={54} height={16} rx={3} className='dg-fill' style={{ stroke: 'currentColor' }} />
            <text x={CARD.x + 41} y={CARD.y + 42} textAnchor='middle' style={{ ...doto, fontSize: 10, fontWeight: 800 }}>REVIEWED</text>
          </g>
          <g style={stamp(0.64, 0.7, -6)}>
            <rect x={CARD.x + 8} y={CARD.y + 82} width={68} height={20} rx={3} className='dg-fill' />
            <rect x={CARD.x + 8} y={CARD.y + 82} width={68} height={20} rx={3} className='dg-wash dg-accent' style={{ strokeWidth: 1.6 }} />
            <text x={CARD.x + 42} y={CARD.y + 92} textAnchor='middle' style={{ ...doto, fontSize: 12, fontWeight: 800 }}>APPROVED</text>
          </g>
        </g>
      </g>
      <text x={CARD.x} y={181} className='dg-dim dg-small' style={fade(0.22, 0.28)}>+ identity docs</text>

      {/* public lookup: the approved profile is findable */}
      <text x={24} y={250} className='dg-dim dg-small' style={fade(0.74, 0.8)}>public · lookup</text>
      <g style={rise(0.76, 0.82, 0, 8)}>
        <rect x={214} y={243} width={154} height={14} rx={3} className='dg-wash' />
        <text x={291} y={250} textAnchor='middle' className='dg-small'>?q=…&amp;status=approved&amp;page=1</text>
      </g>
      <g style={rise(0.74, 0.82, 0, 10)}>
        <rect x={24} y={262} width={344} height={26} rx={13} className='dg-fill' />
        <circle cx={44} cy={274} r={5} className='dg-line' />
        <path d='M48 278L53 283' className='dg-line' />
      </g>
      <text x={60} y={275} clipPath='url(#tg-query)' style={{ fontSize: 10 }}>monastery · profile</text>
      <g style={rise(0.86, 0.92, 0, 10)}>
        <rect x={24} y={298} width={344} height={30} rx={4} className='dg-fill' />
        <circle cx={44} cy={313} r={7} className='dg-edge' />
        <text x={60} y={313} style={{ fontSize: 10 }}>profile</text>
        <text x={116} y={313} className='dg-dim dg-small'>· monastery · congregation</text>
        <rect x={300} y={306} width={56} height={14} rx={3} className='dg-wash dg-accent' />
        <text x={328} y={313} textAnchor='middle' className='dg-small'>approved</text>
      </g>

      {/* scene marks: which layer draws what (numbers match the balloons); 4 and 5 sit where the card was */}
      <path d={`M${CARD.x + HOP * 2 + 60} ${CARD.y + 24.5}H372`} className='dg-line' style={{ ...fade(0.9, 0.94), strokeDasharray: '1 2' }} />
      <Mark n={1} x={380} y={CARD.y + 24.5} style={fade(0.9, 0.94)} />
      <Mark n={2} x={380} y={250} style={fade(0.9, 0.94)} />
      <Mark n={3} x={380} y={313} style={fade(0.9, 0.94)} />
      {[[4, ST_X[0], 'forms'], [5, ST_X[1], 'api']].map(([n, x, label]) => (
        <g key={n} style={fade(0.9, 0.94)}>
          <Mark n={Number(n)} x={Number(x) + ST_W / 2} y={CARD.y + 44} />
          <text x={Number(x) + ST_W / 2} y={CARD.y + 60} textAnchor='middle' className='dg-dim dg-small'>{label}</text>
        </g>
      ))}

      {/* anatomy: base, boards exploded along a dashed centerline, balloons */}
      <g style={fade(0.02, 0.1)}>
        <Solid paths={BASE_SOLID} tone='mid' />
      </g>
      <path d={`M${AXIS_FROM.join(' ')}L${AXIS_TO.join(' ')}`} pathLength={1} className='dg-line' style={{ ...draw(0.26, 0.46), strokeDasharray: '0.06 0.015 0.01 0.015', opacity: 0.7 }} />
      {PLATES.map((pl, i) => (
        <g key={i} style={{ ...fade(0.06 + i * 0.03, 0.12 + i * 0.03), ...travel(0.24, 0.44, 0, pl.dy) }}>
          <Solid paths={pl.body} tone='hi' crease='faint'>
            <path d={pl.inset} className='iso-line' data-tone='faint' />
            <path d={pl.traces} className='iso-line' data-tone='lo' />
          </Solid>
          <Solid paths={pl.chip} tone='mid' crease='none' />
        </g>
      ))}
      <g style={fade(0.02, 0.1)}>
        <rect x={EXT.x} y={EXT.y} width={EXT.w} height={EXT.h} rx={3} className='dg-edge dg-dash' />
        <text x={EXT.x + EXT.w / 2} y={EXT.y + EXT.h / 2} textAnchor='middle' className='dg-dim dg-small'>external api</text>
      </g>
      {PLATES.map((pl, i) => {
        const n = N - i
        const a = 0.46 + (n - 1) * 0.02
        const bx = pl.root[0] + BALLOON_DX
        const by = pl.root[1] + BALLOON_DY
        return (
          <g key={n}>
            <path d={`M${pl.root.join(' ')}L${bx - 6} ${by}`} pathLength={1} className='dg-line' style={{ ...draw(a, a + 0.05), strokeWidth: 0.8 }} />
            <circle cx={pl.root[0]} cy={pl.root[1]} r={1.3} className='dg-ink' style={fade(a, a + 0.02)} />
            <g style={fade(a + 0.03, a + 0.06)}>
              <circle cx={bx} cy={by} r={6.5} className='dg-fill' />
              <text x={bx} y={by} textAnchor='middle' className='dg-small'>{n}</text>
              <text x={bx + 11} y={by} style={{ fontSize: 10 }}>{LAYERS[n - 1].label}</text>
            </g>
          </g>
        )
      })}
      {/* the decision travels down the stack and out to the backend */}
      <circle cx={AXIS_FROM[0]} cy={AXIS_TO[1] + 8} r={3} className='dg-solid' style={{ ...travel(0.66, 0.78, 0, EXT.y + EXT.h / 2 - AXIS_TO[1] - 8), ...pulse(0.65, 0.79) }} />

      {/* bill of materials */}
      {LAYERS.map((l, k) => {
        const y = BOM_Y + 8 + k * 14
        return (
          <g key={l.label} style={fade(0.48 + k * 0.02, 0.54 + k * 0.02)}>
            <text x={392} y={y} className='dg-small'>{k + 1}</text>
            <text x={404} y={y} style={{ fontSize: 10 }}>{l.label}</text>
            <text x={448} y={y} className='dg-dim dg-small'>{l.tech}</text>
          </g>
        )
      })}
      <path d={`M392 ${BOM_Y}H616`} className='dg-edge' style={fade(0.48, 0.54)} />

      {/* terminal: the api step */}
      <rect x={TERM.x} y={TERM.y} width={TERM.w} height={TERM.h} pathLength={1} className='dg-edge' style={draw(0.78, 0.86)} />
      <Corners x={TERM.x} y={TERM.y} w={TERM.w} h={TERM.h} style={fade(0.82, 0.86)} />
      <text x={TERM.x + 12} y={TERM.y + 18} className='dg-accent' style={{ ...fade(0.82, 0.86), fill: 'hsl(var(--primary))' }}>$</text>
      <text x={TERM.x + 24} y={TERM.y + 18} clipPath='url(#tg-cmd)'>{CMD}</text>
      <rect x={TERM.x + 24} y={TERM.y + 11} width={6.6} height={14} className='dg-ink' style={{ ...travel(0.84, 0.92, CMD.length * CH), ...fade(0.82, 0.86) }} />
      <g className='dg-dim' style={fade(0.92, 0.96)}>
        <text x={TERM.x + 24} y={TERM.y + 38} className='dg-dim'>client.post(decisionPath(id),</text>
        <text x={TERM.x + 24} y={TERM.y + 52} className='dg-dim'>{'  { version, decision: \'approve\' })'}</text>
      </g>
      <g style={fade(0.96, 1)}>
        <path d={`M${TERM.x + 12} ${TERM.y + 70}h6`} className='dg-accent' />
        <text x={TERM.x + 24} y={TERM.y + 70} className='dg-small'>200 · next level</text>
        <text x={TERM.x + TERM.w - 12} y={TERM.y + 70} textAnchor='end' className='dg-dim dg-small'>optimistic concurrency · version</text>
      </g>

      {/* title block */}
      <g style={fade(0.9, 0.96)}>
        <rect x={TITLE.x} y={TITLE.y} width={TITLE.w} height={TITLE.h} className='dg-edge' />
        <path d={`M${TITLE.x + 200} ${TITLE.y}v${TITLE.h}M${TITLE.x + 340} ${TITLE.y}v${TITLE.h}M${TITLE.x + 440} ${TITLE.y}v${TITLE.h}M${TITLE.x + 520} ${TITLE.y}v${TITLE.h}`} className='dg-edge' />
        <text x={TITLE.x + 12} y={TITLE.y + 18} style={{ ...doto, fontSize: 16, fontWeight: 800 }}>TANGNI WEB</text>
        <text x={TITLE.x + 212} y={TITLE.y + 11} className='dg-dim dg-small'>sheet</text>
        <text x={TITLE.x + 212} y={TITLE.y + 26} style={{ fontSize: 10 }}>profile review</text>
        <text x={TITLE.x + 352} y={TITLE.y + 11} className='dg-dim dg-small'>scale</text>
        <text x={TITLE.x + 352} y={TITLE.y + 26} style={{ fontSize: 10 }}>1:1</text>
        <text x={TITLE.x + 452} y={TITLE.y + 11} className='dg-dim dg-small'>fig</text>
        <text x={TITLE.x + 452} y={TITLE.y + 26} style={{ fontSize: 10 }}>6 / 8</text>
        <text x={TITLE.x + 532} y={TITLE.y + 11} className='dg-dim dg-small'>rev</text>
        <text x={TITLE.x + 532} y={TITLE.y + 26} style={{ fontSize: 10 }}>frontend</text>
      </g>
    </svg>
  )
}
