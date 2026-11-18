import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// Library: a shelf wireframe (two rows of spines), then along the bottom the catalog flow: a barcode read by a beam,
// the entry form filling from the scan (isbn, then the lookup), the new copy filed on the shelf, and a loan card with
// its three dates. Progress 0..1 (see anim.ts), three beats: frame 0-0.25, scan 0.25-0.75, loan 0.75-0.95.

const SPINE_W = [14, 10, 18, 12, 16, 10, 20, 12, 14, 18, 10, 16]
const SPINE_H = [56, 46, 62, 50, 58, 44, 60, 52, 48, 58]
const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1]
const CARD_Y = 232
const CARD_H = 208
const ROWS = [268, 324, 380]
const DATES = ['borrow', 'due', 'return']
const COMMAND = 'npx playwright test'
const CH = 7 // one 11px mono character (the typed line is forced to this advance)

// Faint from the start, full between a and b.
const faint = (a: number, b: number): CSSProperties => ({ opacity: `calc(0.3 + 0.7 * ${seg(a, b)})` })

// A row of spines sitting on `base`, left to right from `x0`, stopping before `xEnd` (the top row keeps a slot free).
function spines (x0: number, xEnd: number, base: number, offset: number) {
  const out: { x: number, w: number, h: number }[] = []
  let x = x0
  for (let i = 0; x + SPINE_W[(i + offset) % SPINE_W.length]! <= xEnd; i++) {
    const w = SPINE_W[(i + offset) % SPINE_W.length]!
    out.push({ x, w, h: SPINE_H[(i * 3 + offset) % SPINE_H.length]! })
    x += w + 4
  }
  return out
}

const TOP = spines(36, 582, 112, 0)
const BOTTOM = spines(36, 604, 196, 5)
const SLOT = TOP[TOP.length - 1]!
const COPY_X = SLOT.x + SLOT.w + 4

function Shelf () {
  return (
    <g>
      <rect x={24} y={36} width={592} height={160} className='dg-edge' style={faint(0, 0.08)} />
      <path d='M24 112H616' pathLength={1} className='dg-edge' style={draw(0.04, 0.12)} />
      {[TOP, BOTTOM].map((row, r) => row.map((s, i) => {
        const a = 0.1 + r * 0.06 + (i / row.length) * 0.08
        return <rect key={`${r}-${i}`} x={s.x} y={(r ? 196 : 112) - s.h} width={s.w} height={s.h} className='dg-fill' style={rise(a, a + 0.05, 0, 6)} />
      }))}
      {/* the copy the scan files: it drops into the slot kept free at the end of the top row */}
      <rect x={COPY_X} y={112 - 58} width={14} height={58} className='dg-solid' style={rise(0.68, 0.76, 0, -16)} />
    </g>
  )
}

// The barcode's bars, 2px per unit with 2px gaps, from x = 48.
const BAR_PATH = BARS.reduce((acc, w) => ({ x: acc.x + w * 2 + 2, d: `${acc.d}M${acc.x} 262h${w * 2}v90h${-w * 2}z` }), { x: 48, d: '' }).d

function Barcode () {
  return (
    <g>
      <rect x={24} y={CARD_Y} width={176} height={CARD_H} className='dg-edge' style={faint(0.14, 0.22)} />
      <g style={fade(0.18, 0.26)}>
        <path d={BAR_PATH} className='dg-ink' />
        <path d='M64 388H160' className='dg-edge' style={{ strokeWidth: 5 }} />
      </g>
      <rect x={48} y={262} width={128} height={90} className='dg-wash' style={fade(0.42, 0.46)} />
      <rect x={40} y={261} width={144} height={2} className='dg-solid' style={{ ...travel(0.28, 0.44, 0, 90), ...pulse(0.26, 0.47) }} />
      <path d='M200 336H232' pathLength={1} className='dg-accent' style={draw(0.46, 0.5)} />
    </g>
  )
}

function Form () {
  const fill = [66, 78, 50]
  return (
    <g>
      <rect x={232} y={CARD_Y} width={176} height={CARD_H} className='dg-edge' style={faint(0.16, 0.24)} />
      <text x={252} y={ROWS[0]! + 12} style={fade(0.2, 0.28)}>isbn</text>
      {ROWS.map((y, i) => {
        const a = i ? 0.56 + i * 0.05 : 0.5
        return (
          <g key={y}>
            <rect x={300} y={y} width={92} height={24} className='dg-edge' style={fade(0.2 + i * 0.02, 0.28 + i * 0.02)} />
            <rect x={306} y={y + 9} height={6} className='dg-solid' style={{ width: `calc(${seg(a, a + 0.05)} * ${fill[i]}px)` }} />
          </g>
        )
      })}
    </g>
  )
}

function Loan () {
  return (
    <g>
      <rect x={440} y={CARD_Y} width={176} height={CARD_H} className='dg-edge' style={faint(0.18, 0.26)} />
      {DATES.map((name, i) => {
        const y = ROWS[i]!
        const a = 0.78 + i * 0.04
        return (
          <g key={name}>
            <text x={460} y={y + 12} style={fade(0.22 + i * 0.02, 0.3 + i * 0.02)}>{name}</text>
            <rect x={524} y={y} width={76} height={24} className='dg-edge' style={fade(0.22 + i * 0.02, 0.3 + i * 0.02)} />
            {i === 1 && <rect x={524} y={y} width={76} height={24} className='dg-wash dg-accent' style={fade(0.9, 0.94)} />}
            <rect x={530} y={y + 9} height={6} className='dg-solid' style={{ width: `calc(${seg(a, a + 0.04)} * 56px)` }} />
          </g>
        )
      })}
    </g>
  )
}

export function LibraryDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='Library: a shelf of book spines, a barcode read by a scan beam, the entry form filling from the isbn, the new copy filed on the shelf, and a loan card with borrow, due and return dates' className='dg'>
      <Shelf />
      <Barcode />
      <Form />
      <Loan />
      <defs>
        <mask id='lib-typed' maskUnits='userSpaceOnUse'>
          <rect x={24 + 2 * CH} y={468} height={20} fill='#fff' style={{ width: `calc(${seg(0.92, 0.98)} * ${COMMAND.length * CH}px)` }} />
        </mask>
      </defs>
      <g style={fade(0.9, 0.93)}>
        <text x={24} y={478} style={{ fill: 'hsl(var(--primary))' }}>$</text>
        <text x={24 + 2 * CH} y={478} mask='url(#lib-typed)' textLength={COMMAND.length * CH} lengthAdjust='spacing'>{COMMAND}</text>
        <rect x={24 + 2 * CH} y={471} width={CH} height={14} className='dg-solid' style={travel(0.92, 0.98, COMMAND.length * CH)} />
      </g>
    </svg>
  )
}
