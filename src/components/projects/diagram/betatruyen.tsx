import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg } from '@/components/projects/diagram/anim'

// BetaTruyen, as one wireframe: the discussion thread (thảo luận) on the left, the wallet (nạp) and the item
// collection (sưu tầm) on the right, a small module linked with truyenyy under the thread. Over scroll: draw the
// empty frames (0-0.25); press nạp, fill lục bảo and uy khí, then spend them into the collection slots
// (0.25-0.75); the reader's own reply lands and the truyenyy module links up (0.75-0.95). `--p` is the progress.

const THREAD = { x: 24, y: 24, w: 296, h: 380 }
const WALLET = { x: 352, y: 24, w: 264, h: 172 }
const ITEMS = { x: 352, y: 236, w: 264, h: 168 }
const MODULE = { x: 24, y: 436, w: 140, h: 60 }
const NAP = { x: 540, y: 44, w: 52, h: 26 }

const REPLIES = [160, 120, 184, 100, 150]
const SLOT = 52
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ x: 362 + (i % 4) * (SLOT + 12), y: 262 + Math.floor(i / 4) * (SLOT + 12) }))
// The four items collected while scrolling (slot index, kind, when).
const FILLS = [
  { slot: 0, item: 'củ hành', a: 0.54 },
  { slot: 1, item: 'vật bảo', a: 0.6 },
  { slot: 2, item: 'củ hành', a: 0.66 },
  { slot: 4, item: 'củ hành', a: 0.72 },
]

// A solid bar standing in for a line of text.
function Bar ({ x, y, w, strong, style }: { x: number, y: number, w: number, strong?: boolean, style?: CSSProperties }) {
  return <path d={`M${x} ${y}H${x + w}`} className={strong ? 'dg-line' : 'dg-edge'} style={{ strokeWidth: strong ? 6 : 4, ...style }} />
}

// The two item glyphs: củ hành a solid dot with a stem, vật bảo a solid diamond.
function Item ({ x, y, kind }: { x: number, y: number, kind: string }) {
  return kind === 'củ hành'
    ? <path d={`M${x} ${y + 2}m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M${x} ${y - 7}V${y - 14}`} className='dg-solid' style={{ stroke: 'hsl(var(--primary))', strokeWidth: 2.4 }} />
    : <path d={`M${x} ${y - 11}L${x + 11} ${y}L${x} ${y + 11}L${x - 11} ${y}Z`} className='dg-ink' />
}

// A wallet bar: empty track, then the fill scaled by progress (rest → full on nạp, then part spent).
function Gauge ({ y, label, a, spend }: { y: number, label: string, a: number, spend: number }) {
  const x = WALLET.x + 20
  const w = WALLET.w - 40
  return (
    <g>
      <text x={x} y={y - 16} style={fade(0.16, 0.22)}>{label}</text>
      <rect x={x} y={y} width={w} height={10} className='dg-fill' style={fade(0.12, 0.2)} />
      <rect x={x} y={y} width={w} height={10} className='dg-solid' style={{ ...fade(0.12, 0.2), transformOrigin: `${x}px ${y}px`, transform: `scaleX(calc(0.12 + 0.88 * ${seg(a, a + 0.16)} - ${spend} * ${seg(0.52, 0.74)}))` }} />
    </g>
  )
}

export function BetatruyenDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='BetaTruyen wireframe: a discussion thread of replies, a wallet with lục bảo and uy khí filled by nạp, a collection grid that fills with củ hành and vật bảo as they are spent, and a small module linked with truyenyy' className='dg'>
      {/* ---- thảo luận: the thread ---------------------------------------------------------------------------- */}
      <rect x={THREAD.x} y={THREAD.y} width={THREAD.w} height={THREAD.h} pathLength={1} className='dg-fill' style={draw(0, 0.12)} />
      <g style={fade(0.08, 0.16)}>
        <Bar x={44} y={56} w={168} strong />
        <Bar x={44} y={74} w={96} />
        <path d={`M${THREAD.x} 94H${THREAD.x + THREAD.w}`} className='dg-edge' />
      </g>
      {REPLIES.map((w, i) => {
        const y = 118 + i * 46
        return (
          <g key={y} style={rise(0.14 + i * 0.02, 0.22 + i * 0.02, 0, 6)}>
            <circle cx={52} cy={y + 8} r={8} className='dg-ink' style={{ opacity: 0.35 }} />
            <Bar x={72} y={y + 2} w={w} strong />
            <Bar x={72} y={y + 16} w={Math.round(w * 0.6)} />
          </g>
        )
      })}
      {/* the reader's own reply, in the project colour */}
      <g style={rise(0.78, 0.86, 0, 8)}>
        <circle cx={52} cy={356} r={8} className='dg-solid' />
        <path d='M72 350H214M72 364H160' className='dg-accent' style={{ strokeWidth: 6 }} />
      </g>

      {/* ---- the wallet and nạp ------------------------------------------------------------------------------ */}
      <rect x={WALLET.x} y={WALLET.y} width={WALLET.w} height={WALLET.h} pathLength={1} className='dg-fill' style={draw(0.02, 0.14)} />
      <Bar x={372} y={57} w={100} strong style={fade(0.1, 0.16)} />
      <g style={fade(0.12, 0.18)}>
        <rect x={NAP.x} y={NAP.y} width={NAP.w} height={NAP.h} className='dg-solid' />
        <text x={NAP.x + NAP.w / 2} y={NAP.y + NAP.h / 2} textAnchor='middle' className='dg-on'>nạp</text>
      </g>
      <rect x={NAP.x - 6} y={NAP.y - 6} width={NAP.w + 12} height={NAP.h + 12} className='dg-accent' style={{ ...pulse(0.26, 0.4), strokeWidth: 2 }} />
      <Gauge y={110} label='lục bảo' a={0.3} spend={0.5} />
      <Gauge y={158} label='uy khí' a={0.36} spend={0.3} />

      {/* ---- sưu tầm: the collection ------------------------------------------------------------------------- */}
      <rect x={ITEMS.x} y={ITEMS.y} width={ITEMS.w} height={ITEMS.h} pathLength={1} className='dg-fill' style={draw(0.06, 0.18)} />
      {SLOTS.map(({ x, y }, i) => (
        <rect key={i} x={x} y={y} width={SLOT} height={SLOT} className='dg-edge dg-dash' style={fade(0.16 + i * 0.01, 0.24 + i * 0.01)} />
      ))}
      {FILLS.map(({ slot, item, a }) => {
        const { x, y } = SLOTS[slot]
        return (
          <g key={slot} style={rise(a, a + 0.06, 0, -8)}>
            <rect x={x} y={y} width={SLOT} height={SLOT} className='dg-wash dg-accent' />
            <Item x={x + SLOT / 2} y={y + SLOT / 2} kind={item} />
          </g>
        )
      })}
      <g style={fade(0.5, 0.56)}>
        <Item x={374} y={442} kind='củ hành' />
        <text x={392} y={444}>củ hành</text>
        <Item x={494} y={444} kind='vật bảo' />
        <text x={512} y={444}>vật bảo</text>
      </g>

      {/* ---- the module linked with truyenyy ------------------------------------------------------------------ */}
      <path d={`M${MODULE.x + MODULE.w / 2} ${THREAD.y + THREAD.h}V${MODULE.y}`} pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.84, 0.9), strokeWidth: 1.6 }} />
      <g style={rise(0.88, 0.95, 0, 8)}>
        <rect x={MODULE.x} y={MODULE.y} width={MODULE.w} height={MODULE.h} className='dg-wash dg-accent' />
        <text x={MODULE.x + MODULE.w / 2} y={MODULE.y + MODULE.h / 2} textAnchor='middle'>truyenyy</text>
      </g>
    </svg>
  )
}
