import type { CSSProperties } from 'react'

import { draw, fade, rise, travel } from '@/components/projects/diagram/anim'

// TangNi Web, Fig 6 "review": one profile card crossing three gates. The member drafts it (avatar, text bars, an
// attached identity document), the secretary gate ticks it, the admin gate stamps it; then the public lookup bar
// below finds the approved profile as one result row. Wireframe only; everything is a calc() of `--p` (anim.ts).

const GATES = ['member', 'secretary', 'admin'] as const
const COL = { y: 40, w: 160, h: 280, gap: 40 }
const colX = (i: number) => 40 + i * (COL.w + COL.gap)
const HOP = COL.w + COL.gap
const CARD = { x: colX(0) + 24, y: 100, w: 112, h: 150 }
const LOOKUP = { x: 40, y: 356, w: 560, h: 36 }
const ROW = { x: 40, y: 416, w: 560, h: 40 }

// A solid bar standing in for one line of text.
const Bar = ({ x, y, w, strong = false, style }: { x: number, y: number, w: number, strong?: boolean, style?: CSSProperties }) => (
  <path d={`M${x} ${y}h${w}`} className={strong ? 'dg-line' : 'dg-edge'} strokeWidth={strong ? 5 : 4} style={style} />
)

export function TangniDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='TangNi: a profile card with an identity document moves from the member gate through the secretary check to the admin stamp, then shows up in the public lookup' className='dg'>
      {/* beat 1: the three gates */}
      {GATES.map((who, i) => {
        const x = colX(i)
        const a = 0.02 + i * 0.04
        return (
          <g key={who}>
            <rect x={x} y={COL.y} width={COL.w} height={COL.h} pathLength={1} className='dg-edge' style={draw(a, a + 0.12)} />
            <path d={`M${x} ${COL.y + 36}h${COL.w}`} className='dg-edge' style={fade(a + 0.1, a + 0.14)} />
            <text x={x + 14} y={COL.y + 18} className='dg-dim' style={fade(a + 0.1, a + 0.14)}>{who}</text>
          </g>
        )
      })}

      {/* beat 2: the card crosses the gates */}
      <g style={travel(0.32, 0.44, HOP)}>
        <g style={travel(0.56, 0.68, HOP)}>
          <g style={rise(0.18, 0.26)}>
            <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} className='dg-fill' />
            <rect x={CARD.x + 12} y={CARD.y + 12} width={32} height={32} className='dg-ink' />
            <Bar x={CARD.x + 54} y={CARD.y + 20} w={46} strong />
            <Bar x={CARD.x + 54} y={CARD.y + 34} w={32} />
            <path d={`M${CARD.x} ${CARD.y + 58}h${CARD.w}`} className='dg-edge' />
            <Bar x={CARD.x + 12} y={CARD.y + 76} w={88} />
            <Bar x={CARD.x + 12} y={CARD.y + 92} w={64} />
            <Bar x={CARD.x + 12} y={CARD.y + 108} w={76} />
          </g>
          {/* the attached identity document */}
          <g style={rise(0.26, 0.31, 0, 8)}>
            <rect x={CARD.x + 12} y={CARD.y + 122} width={24} height={18} className='dg-wash dg-accent' />
            <Bar x={CARD.x + 44} y={CARD.y + 128} w={56} />
            <Bar x={CARD.x + 44} y={CARD.y + 136} w={36} />
          </g>
          {/* the admin's square stamp lands on the card */}
          <g style={rise(0.72, 0.8, 0, -14)}>
            <rect x={CARD.x + 66} y={CARD.y + 64} width={40} height={40} className='dg-accent' strokeWidth={2.5} />
            <rect x={CARD.x + 76} y={CARD.y + 74} width={20} height={20} className='dg-solid' />
          </g>
        </g>
      </g>
      {/* the secretary's check, at the gate */}
      <path d={`M${colX(1) + COL.w - 38} ${COL.y + 19}l6 6l16 -16`} pathLength={1} className='dg-accent' strokeWidth={2.5} style={draw(0.46, 0.52)} />

      {/* beat 3: the public lookup finds it */}
      <rect x={LOOKUP.x} y={LOOKUP.y} width={LOOKUP.w} height={LOOKUP.h} pathLength={1} className='dg-edge' style={draw(0.8, 0.86)} />
      <Bar x={LOOKUP.x + 16} y={LOOKUP.y + 18} w={128} strong style={fade(0.85, 0.89)} />
      <rect x={LOOKUP.x + LOOKUP.w - 48} y={LOOKUP.y + 6} width={42} height={24} className='dg-solid' style={fade(0.85, 0.89)} />
      <g style={rise(0.89, 0.96)}>
        <rect x={ROW.x} y={ROW.y} width={ROW.w} height={ROW.h} className='dg-fill' />
        <rect x={ROW.x + 12} y={ROW.y + 8} width={24} height={24} className='dg-ink' />
        <Bar x={ROW.x + 48} y={ROW.y + 14} w={112} strong />
        <Bar x={ROW.x + 48} y={ROW.y + 28} w={72} />
        <rect x={ROW.x + ROW.w - 32} y={ROW.y + 10} width={20} height={20} className='dg-accent' strokeWidth={2} />
        <rect x={ROW.x + ROW.w - 27} y={ROW.y + 15} width={10} height={10} className='dg-solid' />
      </g>
    </svg>
  )
}
