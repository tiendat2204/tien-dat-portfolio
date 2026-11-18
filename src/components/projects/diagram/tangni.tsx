import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

/*
  TangNi Web, one wireframe over a stack strip. Scene: three gates (member, secretary, admin) and one profile card
  (rank, congregation, monastery, an identity document) crossing them: the secretary ticks it (level 1), the admin
  stamps it (level 2); below, the public lookup with its URL search state (q, status, page) finds the approved
  profile. Then one row of the frontend's layers (config.ts); each lights while the scene touches it.
  Beats of `--p`: 0-0.2 the ghosted frames come to strength (ui); 0.2-0.34 the member drafts the card (forms);
  0.34-0.82 submit, tick, resubmit, stamp (api, data); 0.82-0.96 the lookup finds the approved row (routes).
*/

const GATES = ['member', 'secretary', 'admin'] as const
const COL = { y: 20, w: 160, h: 250, gap: 40 }
const colX = (i: number) => 40 + i * (COL.w + COL.gap)
const HOP = COL.w + COL.gap
const CARD = { x: colX(0) + 16, y: 64, w: 128, h: 174 }
const FIELDS = [
  { label: 'rank', w: 64 },
  { label: 'congregation', w: 96 },
  { label: 'monastery', w: 80 },
] as const
const FOOT = COL.y + COL.h - 16
const LOOKUP = { x: 40, y: 290, w: 560, h: 32 }
const CHIP = '?q=&status=approved&page=1'
const ROW = { x: 40, y: 332, w: 560, h: 36 }

// The frontend's layers (config.ts), each lit while the scene touches it; the api cell carries the client only.
const LAYERS = [
  { label: 'ui', tech: 'React 19', lit: [[0.06, 0.2]] },
  { label: 'routes', tech: 'TanStack Router', lit: [[0.82, 0.96]] },
  { label: 'data', tech: 'TanStack Query', lit: [[0.46, 0.58], [0.7, 0.82]] },
  { label: 'forms', tech: 'React Hook Form', lit: [[0.2, 0.34]] },
  { label: 'api', tech: 'Axios', lit: [[0.34, 0.46], [0.58, 0.7]] },
] as const
const CELL = { y: 392, w: 108, h: 64, gap: 5 }
const cellX = (i: number) => 40 + i * (CELL.w + CELL.gap)

const CMD = '$ npx vitest run'
const CMD_W = CMD.length * 6.6
const TYPE: [number, number] = [0.9, 0.97]

// Ghosted at p=0 (hairlines at 0.3), full strength from `b`.
const ghost = (a: number, b: number): CSSProperties => ({ opacity: `calc(0.3 + 0.7 * ${seg(a, b)})` })

// A solid bar standing in for a line of text.
function Bar ({ x, y, w, strong, style }: { x: number, y: number, w: number, strong?: boolean, style?: CSSProperties }) {
  return <path d={`M${x} ${y}H${x + w}`} className={strong ? 'dg-line' : 'dg-edge'} style={{ strokeWidth: strong ? 6 : 4, ...style }} />
}

export function TangniDiagram () {
  return (
    <svg
      viewBox='0 0 640 520'
      role='img'
      aria-label='TangNi wireframe: a profile card with rank, congregation, monastery and an identity document crosses the member, secretary and admin gates, gets the level 1 tick and the level 2 stamp, then shows up as an approved row in the public lookup; below, the frontend layers ui, routes, data, forms and api light up in turn'
      className='dg'
    >
      {/* ---- the three gates ----------------------------------------------------------------------------------- */}
      {GATES.map((who, i) => {
        const x = colX(i)
        return (
          <g key={who} style={ghost(0.02 + i * 0.03, 0.12 + i * 0.03)}>
            <rect x={x} y={COL.y} width={COL.w} height={COL.h} className='dg-fill' />
            <path d={`M${x} ${COL.y + 34}H${x + COL.w}`} className='dg-edge' />
            <text x={x + 14} y={COL.y + 17}>{who}</text>
          </g>
        )
      })}

      {/* ---- the profile card, drafted by the member, then carried gate to gate ---------------------------------- */}
      <g style={travel(0.34, 0.46, HOP)}>
        <g style={travel(0.58, 0.7, HOP)}>
          <g style={ghost(0.14, 0.24)}>
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} className='dg-fill' />
            <rect x={CARD.x + 12} y={CARD.y + 12} width={32} height={32} className='dg-ink' />
            <Bar x={CARD.x + 54} y={CARD.y + 20} w={56} strong />
            <Bar x={CARD.x + 54} y={CARD.y + 34} w={40} />
            <path d={`M${CARD.x} ${CARD.y + 56}H${CARD.x + CARD.w}`} className='dg-edge' />
          </g>
          {FIELDS.map(({ label, w }, i) => {
            const y = CARD.y + 70 + i * 28
            const a = 0.2 + i * 0.03
            return (
              <g key={label} style={rise(a, a + 0.06, 0, 6)}>
                <text x={CARD.x + 12} y={y} className='dg-dim'>{label}</text>
                <Bar x={CARD.x + 12} y={y + 14} w={w} />
              </g>
            )
          })}
          {/* the attached identity document */}
          <g style={rise(0.29, 0.35, 0, 6)}>
            <rect x={CARD.x + 12} y={CARD.y + 152} width={22} height={16} className='dg-wash dg-accent' />
            <text x={CARD.x + 42} y={CARD.y + 160} className='dg-dim'>identity</text>
          </g>
          {/* the admin's approval washes the card */}
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} className='dg-wash' style={fade(0.74, 0.8)} />
        </g>
      </g>

      {/* ---- level 1: the secretary's tick; level 2: the admin's stamp ------------------------------------------- */}
      <text x={colX(1) + 14} y={FOOT} className='dg-dim' style={fade(0.46, 0.5)}>level 1</text>
      <path d={`M${colX(1) + COL.w - 36} ${FOOT}l6 6l14 -14`} pathLength={1} className='dg-accent' style={{ ...draw(0.48, 0.54), strokeWidth: 2.5 }} />
      <text x={colX(2) + 14} y={FOOT} className='dg-dim' style={fade(0.7, 0.74)}>level 2</text>
      <g style={rise(0.72, 0.8, 0, -10)}>
        <rect x={colX(2) + COL.w - 36} y={FOOT - 10} width={20} height={20} className='dg-accent' style={{ strokeWidth: 2 }} />
        <rect x={colX(2) + COL.w - 31} y={FOOT - 5} width={10} height={10} className='dg-solid' />
      </g>

      {/* ---- the public lookup: URL search state, then the approved profile as one row ---------------------------- */}
      <g style={ghost(0.08, 0.2)}>
        <rect x={LOOKUP.x} y={LOOKUP.y} width={LOOKUP.w} height={LOOKUP.h} className='dg-fill' />
        <rect x={LOOKUP.x + LOOKUP.w - 48} y={LOOKUP.y + 5} width={42} height={22} className='dg-solid' />
      </g>
      <g style={rise(0.84, 0.9, -8, 0)}>
        <rect x={LOOKUP.x + 8} y={LOOKUP.y + 6} width={CHIP.length * 6.6 + 16} height={20} className='dg-wash dg-accent' />
        <text x={LOOKUP.x + 16} y={LOOKUP.y + 16}>{CHIP}</text>
      </g>
      <rect x={ROW.x} y={ROW.y} width={ROW.w} height={ROW.h} className='dg-fill' style={ghost(0.1, 0.22)} />
      <g style={rise(0.88, 0.94, 0, 6)}>
        <rect x={ROW.x + 12} y={ROW.y + 7} width={22} height={22} className='dg-ink' />
        <Bar x={ROW.x + 46} y={ROW.y + 12} w={120} strong />
        <Bar x={ROW.x + 46} y={ROW.y + 26} w={72} />
        <rect x={ROW.x + ROW.w - 76} y={ROW.y + 8} width={64} height={20} className='dg-solid' />
        <text x={ROW.x + ROW.w - 44} y={ROW.y + 18} textAnchor='middle' className='dg-on'>approved</text>
      </g>

      {/* ---- the stack strip: one cell per layer, lit while the scene touches it ------------------------------- */}
      {LAYERS.map(({ label, tech, lit }, i) => {
        const x = cellX(i)
        return (
          <g key={label}>
            <g style={ghost(0.04 + i * 0.02, 0.16 + i * 0.02)}>
              <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-fill' />
              <text x={x + CELL.w / 2} y={CELL.y + 20} textAnchor='middle' className='dg-dim' style={{ fontSize: 10 }}>{label}</text>
              <text x={x + CELL.w / 2} y={CELL.y + 44} textAnchor='middle'>{tech}</text>
            </g>
            {lit.map(([a, b]) => (
              <g key={a}>
                <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-wash dg-accent' style={{ ...pulse(a, b), strokeWidth: 1.6 }} />
                <rect x={x + 4} y={CELL.y + CELL.h - 8} width={CELL.w - 8} height={4} className='dg-solid' style={fade(b - 0.02, b)} />
              </g>
            ))}
          </g>
        )
      })}

      {/* ---- the signature line, typed with the scroll ---------------------------------------------------------- */}
      <text x={40} y={486} textLength={CMD_W} lengthAdjust='spacingAndGlyphs' clipPath='url(#tn-type)' style={fade(0.88, 0.9)}>{CMD}</text>
      <rect x={40} y={479} width={7} height={14} className='dg-solid' style={{ ...travel(...TYPE, CMD_W), ...pulse(0.88, 1.02) }} />
      <defs>
        <clipPath id='tn-type'>
          <rect x={40} y={474} width={CMD_W} height={24} style={{ transformOrigin: '40px 0', transform: `scaleX(${seg(...TYPE)})` }} />
        </clipPath>
      </defs>
    </svg>
  )
}
