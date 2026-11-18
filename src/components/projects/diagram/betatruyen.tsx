import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

/*
  BetaTruyen, one wireframe over a stack strip. Scene: the discussion thread (thảo luận) on the left with a small
  module linked with truyenyy under it, the wallet (nạp, lục bảo, uy khí) and the item collection (sưu tầm: củ hành,
  vật bảo) on the right. Below, one row of the frontend's layers; each lights up while the scene touches it.
  Beats of `--p`: 0-0.25 the ghosted frames come to strength (ui); 0.25-0.75 nạp is pressed, the wallet fills (auth,
  api) and is spent into the collection slots (data); 0.75-0.95 the reader's reply lands (hooks) and truyenyy links up.
*/

const THREAD = { x: 24, y: 24, w: 296, h: 256 }
const MODULE = { x: 24, y: 296, w: 140, h: 40 }
const WALLET = { x: 352, y: 24, w: 264, h: 136 }
const ITEMS = { x: 352, y: 184, w: 264, h: 152 }
const NAP = { x: 548, y: 42, w: 48, h: 24 }

const REPLIES = [152, 112, 176, 96]
const SLOT = 44
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ x: 374 + (i % 4) * (SLOT + 12), y: 222 + Math.floor(i / 4) * (SLOT + 12) }))
// The items collected while scrolling (slot, kind, when).
const FILLS = [
  { slot: 0, kind: 'củ hành', a: 0.54 },
  { slot: 1, kind: 'vật bảo', a: 0.6 },
  { slot: 2, kind: 'củ hành', a: 0.66 },
  { slot: 4, kind: 'củ hành', a: 0.72 },
]

// The frontend's layers (config.ts), each lit while the scene touches it; the api cell carries the client only.
const LAYERS = [
  { label: 'ui', tech: 'Next.js SSR', lit: [0.1, 0.26] },
  { label: 'hooks', tech: 'custom hooks', lit: [0.76, 0.9] },
  { label: 'data', tech: 'TanStack Query', lit: [0.5, 0.76] },
  { label: 'auth', tech: 'JWT', lit: [0.26, 0.38] },
  { label: 'api', tech: 'Axios', lit: [0.36, 0.52] },
] as const
const CELL = { y: 366, w: 104, h: 92, gap: 18 }
const cellX = (i: number) => 24 + i * (CELL.w + CELL.gap)

const CMD = '$ pnpm dev'
const CMD_W = CMD.length * 6.6
const TYPE: [number, number] = [0.9, 0.97]

// Ghosted at p=0 (hairlines at 0.3), full strength from `b`.
const ghost = (a: number, b: number): CSSProperties => ({ opacity: `calc(0.3 + 0.7 * ${seg(a, b)})` })

// A solid bar standing in for a line of text.
function Bar ({ x, y, w, strong, style }: { x: number, y: number, w: number, strong?: boolean, style?: CSSProperties }) {
  return <path d={`M${x} ${y}H${x + w}`} className={strong ? 'dg-line' : 'dg-edge'} style={{ strokeWidth: strong ? 6 : 4, ...style }} />
}

// The two item glyphs: củ hành a solid dot with a stem, vật bảo a solid diamond.
function Item ({ x, y, kind, r = 9 }: { x: number, y: number, kind: string, r?: number }) {
  return kind === 'củ hành'
    ? <path d={`M${x} ${y + 2}m${-r} 0a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0M${x} ${y - r + 2}V${y - r - 5}`} className='dg-solid' style={{ stroke: 'hsl(var(--primary))', strokeWidth: 2.4 }} />
    : <path d={`M${x} ${y - r - 2}L${x + r + 2} ${y}L${x} ${y + r + 2}L${x - r - 2} ${y}Z`} className='dg-ink' />
}

// A wallet gauge: the label, the empty track, then the fill scaled by progress (rest → full on nạp, then part spent).
function Gauge ({ y, label, a, spend }: { y: number, label: string, a: number, spend: number }) {
  const x = WALLET.x + 16
  const w = WALLET.w - 32
  return (
    <g style={ghost(0.08, 0.2)}>
      <text x={x} y={y - 14}>{label}</text>
      <rect x={x} y={y} width={w} height={10} className='dg-fill' />
      <rect x={x} y={y} width={w} height={10} className='dg-solid' style={{ transformOrigin: `${x}px ${y}px`, transform: `scaleX(calc(0.12 + 0.88 * ${seg(a, a + 0.14)} - ${spend} * ${seg(0.52, 0.74)}))` }} />
    </g>
  )
}

export function BetatruyenDiagram () {
  return (
    <svg
      viewBox='0 0 640 520'
      role='img'
      aria-label='BetaTruyen wireframe: a discussion thread, a wallet with lục bảo and uy khí filled by nạp and spent into a collection of củ hành and vật bảo, a module linked with truyenyy, and the frontend layers ui, hooks, data, auth and api lighting up in turn'
      className='dg'
    >
      {/* ---- thảo luận: the thread ---------------------------------------------------------------------------- */}
      <g style={ghost(0, 0.12)}>
        <rect x={THREAD.x} y={THREAD.y} width={THREAD.w} height={THREAD.h} className='dg-fill' />
        <text x={40} y={46}>thảo luận</text>
        <Bar x={128} y={46} w={120} strong />
        <path d={`M${THREAD.x} 62H${THREAD.x + THREAD.w}`} className='dg-edge' />
      </g>
      {REPLIES.map((w, i) => {
        const y = 84 + i * 42
        return (
          <g key={y} style={ghost(0.1 + i * 0.02, 0.18 + i * 0.02)}>
            <circle cx={50} cy={y + 7} r={8} className='dg-ink' style={{ opacity: 0.35 }} />
            <Bar x={70} y={y} w={w} strong />
            <Bar x={70} y={y + 14} w={Math.round(w * 0.6)} />
          </g>
        )
      })}
      {/* the reader's own reply, in the project colour */}
      <g style={rise(0.78, 0.86, 0, 8)}>
        <circle cx={50} cy={259} r={8} className='dg-solid' />
        <path d='M70 252H212M70 266H158' className='dg-accent' style={{ strokeWidth: 6 }} />
      </g>

      {/* ---- the module linked with truyenyy ------------------------------------------------------------------ */}
      <g style={ghost(0.14, 0.24)}>
        <rect x={MODULE.x} y={MODULE.y} width={MODULE.w} height={MODULE.h} className='dg-fill' />
        <text x={MODULE.x + MODULE.w / 2} y={MODULE.y + MODULE.h / 2} textAnchor='middle'>truyenyy</text>
      </g>
      <path d={`M${MODULE.x + MODULE.w / 2} ${THREAD.y + THREAD.h}V${MODULE.y}`} pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.86, 0.92), strokeWidth: 1.6 }} />
      <rect x={MODULE.x} y={MODULE.y} width={MODULE.w} height={MODULE.h} className='dg-wash' style={fade(0.9, 0.95)} />

      {/* ---- the wallet and nạp ------------------------------------------------------------------------------ */}
      <g style={ghost(0.02, 0.14)}>
        <rect x={WALLET.x} y={WALLET.y} width={WALLET.w} height={WALLET.h} className='dg-fill' />
        <Bar x={368} y={54} w={96} strong />
        <rect x={NAP.x} y={NAP.y} width={NAP.w} height={NAP.h} className='dg-solid' />
        <text x={NAP.x + NAP.w / 2} y={NAP.y + NAP.h / 2} textAnchor='middle' className='dg-on'>nạp</text>
      </g>
      <rect x={NAP.x - 6} y={NAP.y - 6} width={NAP.w + 12} height={NAP.h + 12} className='dg-accent' style={{ ...pulse(0.26, 0.4), strokeWidth: 2 }} />
      <Gauge y={96} label='lục bảo' a={0.3} spend={0.5} />
      <Gauge y={136} label='uy khí' a={0.36} spend={0.3} />

      {/* ---- sưu tầm: the collection ------------------------------------------------------------------------- */}
      <g style={ghost(0.06, 0.18)}>
        <rect x={ITEMS.x} y={ITEMS.y} width={ITEMS.w} height={ITEMS.h} className='dg-fill' />
        <text x={368} y={204}>sưu tầm</text>
        <Item x={476} y={204} kind='củ hành' r={5} />
        <text x={490} y={204}>củ hành</text>
        <Item x={552} y={204} kind='vật bảo' r={5} />
        <text x={566} y={204}>vật bảo</text>
      </g>
      {SLOTS.map(({ x, y }, i) => (
        <rect key={i} x={x} y={y} width={SLOT} height={SLOT} className='dg-edge dg-dash' style={ghost(0.14 + i * 0.01, 0.22 + i * 0.01)} />
      ))}
      {FILLS.map(({ slot, kind, a }) => {
        const { x, y } = SLOTS[slot]
        return (
          <g key={slot} style={rise(a, a + 0.06, 0, -8)}>
            <rect x={x} y={y} width={SLOT} height={SLOT} className='dg-wash dg-accent' />
            <Item x={x + SLOT / 2} y={y + SLOT / 2} kind={kind} />
          </g>
        )
      })}

      {/* ---- the stack strip: one cell per layer, lit while the scene touches it ------------------------------- */}
      {LAYERS.map(({ label, tech, lit }, i) => {
        const x = cellX(i)
        return (
          <g key={label}>
            <g style={ghost(0.04 + i * 0.02, 0.16 + i * 0.02)}>
              <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-fill' />
              <text x={x + CELL.w / 2} y={CELL.y + 24} textAnchor='middle' className='dg-dim' style={{ fontSize: 10 }}>{label}</text>
              <text x={x + CELL.w / 2} y={CELL.y + 58} textAnchor='middle'>{tech}</text>
            </g>
            <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-wash dg-accent' style={{ ...pulse(lit[0], lit[1]), strokeWidth: 1.6 }} />
            <rect x={x + 4} y={CELL.y + CELL.h - 8} width={CELL.w - 8} height={4} className='dg-solid' style={fade(lit[1] - 0.02, lit[1])} />
          </g>
        )
      })}

      {/* ---- the signature line, typed with the scroll ---------------------------------------------------------- */}
      <text x={24} y={490} textLength={CMD_W} lengthAdjust='spacingAndGlyphs' clipPath='url(#bt-type)' style={fade(0.88, 0.9)}>{CMD}</text>
      <rect x={24} y={483} width={7} height={14} className='dg-solid' style={{ ...travel(...TYPE, CMD_W), ...pulse(0.88, 1.02) }} />
      <defs>
        <clipPath id='bt-type'>
          <rect x={24} y={478} width={CMD_W} height={24} style={{ transformOrigin: '24px 0', transform: `scaleX(${seg(...TYPE)})` }} />
        </clipPath>
      </defs>
    </svg>
  )
}
