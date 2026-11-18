import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// Library: a shelf with floor/shelf locations (two rows of spines), then the catalog flow below it: a barcode read by
// a beam, the entry form filling from the scan (isbn, then the lookup fills title/author/publisher/ddc), the new copy
// filed on the shelf, and a loan card with its three dates. Under the scene, the frontend stack as a row of cells; the
// cell of the layer each action touches lights in turn. Progress 0..1 (anim.ts): the whole frame is ghosted at 0 and
// reaches full strength by 0.25, scan + entry 0.25-0.8, loan 0.8-0.95, signature line 0.9+.

const SPINE_W = [14, 10, 18, 12, 16, 10, 20, 12, 14, 18, 10, 16]
const SPINE_H = [48, 38, 54, 42, 50, 36, 52, 44, 40, 50]
const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1]
const BOARDS = [98, 160]
const SHELVES = ['floor 2 · shelf A', 'floor 2 · shelf B']
const CARD_Y = 184
const CARD_H = 148
const FIELDS = ['isbn', 'title', 'author', 'publisher', 'ddc']
const FIELD_FILL = [60, 72, 52, 66, 40]
const DATES = ['borrow', 'due', 'return']
const LAYERS: [string, string, number, number][] = [
  ['ui', 'React 19', 0.26, 0.44],
  ['app', 'Next.js 16', 0.72, 0.82],
  ['data', 'TanStack Query', 0.48, 0.66],
  ['state', 'Redux Toolkit', 0.78, 0.94],
  ['forms', 'React Hook Form', 0.64, 0.74],
]
const CELL = { y: 356, w: 112, h: 72, gap: 8 }
const COMMAND = 'npx playwright test'
const CH = 7 // one 11px mono character (the typed line is forced to this advance)

// Ghosted (0.3) from the start, full between a and b.
const faint = (a: number, b: number): CSSProperties => ({ opacity: `calc(0.3 + 0.7 * ${seg(a, b)})` })

// A row of spines sitting on `base`, left to right from `x0`, stopping before `xEnd`.
function spines (x0: number, xEnd: number, offset: number) {
  const out: { x: number, w: number, h: number }[] = []
  let x = x0
  for (let i = 0; x + SPINE_W[(i + offset) % SPINE_W.length]! <= xEnd; i++) {
    const w = SPINE_W[(i + offset) % SPINE_W.length]!
    out.push({ x, w, h: SPINE_H[(i * 3 + offset) % SPINE_H.length]! })
    x += w + 4
  }
  return out
}

const ROWS = [spines(36, 470, 0), spines(36, 450, 5)]
const SLOT = ROWS[1]![ROWS[1]!.length - 1]!
const COPY_X = SLOT.x + SLOT.w + 4

function Shelf () {
  return (
    <g style={faint(0, 0.14)}>
      <rect x={24} y={28} width={592} height={132} className='dg-edge' />
      <path d={`M24 ${BOARDS[0]}H616`} className='dg-edge' />
      {ROWS.map((row, r) => row.map((s, i) => (
        <rect key={`${r}-${i}`} x={s.x} y={BOARDS[r]! - s.h} width={s.w} height={s.h} className='dg-fill' />
      )))}
      {SHELVES.map((name, r) => (
        <text key={name} x={604} y={BOARDS[r]! - 12} textAnchor='end' className='dg-dim'>{name}</text>
      ))}
    </g>
  )
}

// The barcode's bars, 2px per unit with 2px gaps, from x = 48.
const BAR_PATH = BARS.reduce((acc, w) => ({ x: acc.x + w * 2 + 2, d: `${acc.d}M${acc.x} 204h${w * 2}v80h${-w * 2}z` }), { x: 48, d: '' }).d

function Scan () {
  return (
    <g>
      <g style={faint(0.06, 0.2)}>
        <rect x={24} y={CARD_Y} width={176} height={CARD_H} className='dg-edge' />
        <path d={BAR_PATH} className='dg-ink' />
        <path d='M64 306H160' className='dg-edge' style={{ strokeWidth: 5 }} />
      </g>
      <rect x={48} y={204} width={130} height={80} className='dg-wash' style={fade(0.4, 0.44)} />
      <rect x={40} y={203} width={146} height={2} className='dg-solid' style={{ ...travel(0.28, 0.42, 0, 80), ...pulse(0.26, 0.45) }} />
      <path d='M200 210H232' pathLength={1} className='dg-accent' style={draw(0.44, 0.47)} />
    </g>
  )
}

function Form () {
  return (
    <g>
      <g style={faint(0.08, 0.22)}>
        <rect x={232} y={CARD_Y} width={176} height={CARD_H} className='dg-edge' />
        {FIELDS.map((name, i) => (
          <g key={name}>
            <text x={244} y={210 + i * 26} className='dg-dim'>{name}</text>
            <rect x={312} y={200 + i * 26} width={84} height={20} className='dg-edge' />
          </g>
        ))}
      </g>
      {FIELDS.map((name, i) => {
        const a = i ? 0.51 + i * 0.03 : 0.46
        return <rect key={name} x={318} y={207 + i * 26} height={6} className='dg-solid' style={{ width: `calc(${seg(a, a + 0.04)} * ${FIELD_FILL[i]}px)` }} />
      })}
      {/* validated: the form's outline flashes, then the copy is filed */}
      <rect x={232} y={CARD_Y} width={176} height={CARD_H} className='dg-accent' style={pulse(0.65, 0.73)} />
      <rect x={COPY_X} y={BOARDS[1]! - 50} width={14} height={50} className='dg-solid' style={rise(0.72, 0.8, 0, -16)} />
    </g>
  )
}

function Loan () {
  return (
    <g>
      <g style={faint(0.1, 0.24)}>
        <rect x={440} y={CARD_Y} width={176} height={CARD_H} className='dg-edge' />
        {DATES.map((name, i) => (
          <g key={name}>
            <text x={452} y={214 + i * 40} className='dg-dim'>{name}</text>
            <rect x={516} y={204 + i * 40} width={84} height={20} className='dg-edge' />
          </g>
        ))}
      </g>
      <rect x={516} y={244} width={84} height={20} className='dg-wash' style={fade(0.9, 0.94)} />
      {DATES.map((name, i) => (
        <rect key={name} x={522} y={211 + i * 40} height={6} className='dg-solid' style={{ width: `calc(${seg(0.8 + i * 0.04, 0.84 + i * 0.04)} * 60px)` }} />
      ))}
    </g>
  )
}

function Stack () {
  return (
    <g>
      {LAYERS.map(([label, tech, a, b], i) => {
        const x = 24 + i * (CELL.w + CELL.gap)
        return (
          <g key={label}>
            <g style={faint(0.12 + i * 0.02, 0.26 + i * 0.02)}>
              <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-fill' />
              <text x={x + CELL.w / 2} y={CELL.y + 24} textAnchor='middle' className='dg-dim'>{label}</text>
              <text x={x + CELL.w / 2} y={CELL.y + 48} textAnchor='middle'>{tech}</text>
            </g>
            <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-wash' style={pulse(a, b)} />
            <rect x={x} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-accent' style={pulse(a, b)} />
          </g>
        )
      })}
    </g>
  )
}

export function LibraryDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='Library: a shelf of book spines with floor and shelf labels, a barcode read by a scan beam, the entry form filling isbn, title, author, publisher and ddc from the lookup, the new copy filed on the shelf, a loan card with borrow, due and return dates, and the frontend stack lighting up layer by layer' className='dg'>
      <Shelf />
      <Scan />
      <Form />
      <Loan />
      <Stack />
      <defs>
        <mask id='lib-typed' maskUnits='userSpaceOnUse'>
          <rect x={24 + 2 * CH} y={458} height={20} fill='#fff' style={{ width: `calc(${seg(0.92, 0.98)} * ${COMMAND.length * CH}px)` }} />
        </mask>
      </defs>
      <g style={fade(0.9, 0.93)}>
        <text x={24} y={468} style={{ fill: 'hsl(var(--primary))' }}>$</text>
        <text x={24 + 2 * CH} y={468} mask='url(#lib-typed)' textLength={COMMAND.length * CH} lengthAdjust='spacing'>{COMMAND}</text>
        <rect x={24 + 2 * CH} y={461} width={CH} height={14} className='dg-solid' style={travel(0.92, 0.98, COMMAND.length * CH)} />
      </g>
    </svg>
  )
}
