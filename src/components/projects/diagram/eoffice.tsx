import type { CSSProperties } from 'react'

import { fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

/*
  E-Office, one wireframe: the document page (title, a status pill, the documents table with its name / status / rev
  columns) and, at its right, the four steps of changing a status: the `set active` menu item, the role guard lock,
  the file upload, the toast. Below, the frontend stack as five cells that light up as the action passes through them.
  Beats of `--p`: 0-0.18 the ghosted scene comes to full strength; 0.2-0.78 the action walks the right column and
  the stack (ui -> routes -> forms -> data -> api); 0.8-0.95 the pill flips draft -> active, the stamp lands, the toast.
*/

const PAGE = { x: 30, y: 30, w: 360, h: 288 }
const COLS = [48, 196, 290, 372]
const HEAD_Y = 104
const ROW_H = 26
const ROWS = 4
const ACTED = 1
const rowY = (i: number) => HEAD_Y + 24 + i * ROW_H
const PILL = { x: 300, y: 44, w: 72, h: 20 }
const STAMP = { x: 302, y: 244, s: 60 }

const CARD = { x: 420, w: 190, h: 56 }
const cardY = (i: number) => 30 + i * 72
const STEPS = [
  { text: 'set active', at: 0.2 },
  { text: 'role guard', at: 0.32 },
  { text: 'upload', at: 0.44 },
] as const
const TOAST_AT = 0.88

// The stack strip: label / main tech per layer of the config, in the order the action touches them.
const CELL = { y: 356, w: 100, h: 56, gap: 16 }
const cellX = (i: number) => 38 + i * (CELL.w + CELL.gap)
const LAYERS = [
  { label: 'ui', tech: 'React 19', at: 0.2 },
  { label: 'routes', tech: 'React Router', at: 0.32 },
  { label: 'forms', tech: 'Zod 4', at: 0.44 },
  { label: 'data', tech: 'TanStack Query', at: 0.56 },
  { label: 'api', tech: 'Axios', at: 0.68 },
] as const
const RUN: [number, number] = [0.2, 0.78]

const CMD = '$ npx vite build'
const CMD_X = 38
const CMD_Y = 460
const CMD_W = CMD.length * 6.6

// Everything drawn at p=0 is a ghost (0.3) that comes to full strength over the first beat.
const GHOST: CSSProperties = { opacity: `calc(0.3 + 0.7 * ${seg(0, 0.18)})` }
const bar = (w: number): CSSProperties => ({ strokeWidth: w })
const SMALL: CSSProperties = { fontSize: 10 }

export function EofficeDiagram () {
  return (
    <svg
      viewBox='0 0 640 520'
      role='img'
      aria-label='E-Office: a document page with a name, status and rev table; the set active menu item, a role guard lock, a file upload and a status updated toast; the status pill flips from draft to active and a stamp lands; below, the stack cells ui, routes, forms, data and api light up in turn'
      className='dg'
    >
      <g style={GHOST}>
        {/* ---- the document page ---- */}
        <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} className='dg-fill' />
        <text x={48} y={54} className='dg-dim'>documents/:id</text>
        <path d='M48 78H214' className='dg-line' style={bar(6)} />
        <rect x={PILL.x} y={PILL.y} width={PILL.w} height={PILL.h} className='dg-fill' />
        <text x={PILL.x + PILL.w / 2} y={PILL.y + PILL.h / 2} textAnchor='middle' style={{ opacity: `calc(1 - ${seg(0.82, 0.86)})` }}>draft</text>
        {/* the table: header row with its real columns, then rows of bars */}
        <path d={`M${COLS[0]} ${HEAD_Y}H${COLS[3]}M${COLS[0]} ${HEAD_Y + 24}H${COLS[3]}`} className='dg-line' />
        <path d={`${[1, 2].map((i) => `M${COLS[i]} ${HEAD_Y}V${rowY(ROWS)}`).join('')}${Array.from({ length: ROWS }, (_, i) => `M${COLS[0]} ${rowY(i + 1)}H${COLS[3]}`).join('')}`} className='dg-edge' />
        <text x={COLS[0] + 10} y={HEAD_Y + 12}>name</text>
        <text x={COLS[1] + 10} y={HEAD_Y + 12}>status</text>
        <text x={COLS[2] + 10} y={HEAD_Y + 12}>rev</text>
        {Array.from({ length: ROWS }, (_, i) => (
          <g key={i}>
            <path d={`M${COLS[0] + 10} ${rowY(i) + 13}H${COLS[0] + [120, 96, 110, 76][i]}`} className='dg-edge' style={bar(5)} />
            <rect x={COLS[1] + 12} y={rowY(i) + 9} width={8} height={8} className='dg-edge' />
            <path d={`M${COLS[2] + 10} ${rowY(i) + 13}H${COLS[2] + [30, 24, 40, 24][i]}`} className='dg-edge' style={bar(5)} />
          </g>
        ))}
        <path d='M48 256H200M48 272H160' className='dg-edge' style={bar(5)} />

        {/* ---- the right column: the three steps and the toast ---- */}
        {STEPS.map((s, i) => (
          <g key={s.text}>
            <rect x={CARD.x} y={cardY(i)} width={CARD.w} height={CARD.h} className='dg-fill' />
            <text x={CARD.x + 60} y={cardY(i) + CARD.h / 2}>{s.text}</text>
          </g>
        ))}
        <rect x={CARD.x} y={cardY(3)} width={CARD.w} height={CARD.h} className='dg-edge dg-dash' />
        {/* the menu bullet, the lock, the upload tray */}
        <rect x={CARD.x + 22} y={cardY(0) + 22} width={12} height={12} className='dg-edge' />
        <rect x={CARD.x + 18} y={cardY(1) + 24} width={20} height={16} className='dg-fill' style={{ stroke: 'currentColor' }} />
        <path d={`M${CARD.x + 22} ${cardY(1) + 24}V${cardY(1) + 15}H${CARD.x + 34}V${cardY(1) + 24}`} className='dg-line' style={{ ...travel(0.34, 0.42, 0, -7), strokeWidth: 1.5 }} />
        <path d={`M${CARD.x + 16} ${cardY(2) + 34}v8h24v-8`} className='dg-line' />
        <path d={`M${CARD.x + 28} ${cardY(2) + 36}V${cardY(2) + 16}m-6 6l6 -6l6 6`} className='dg-line' style={{ ...travel(0.46, 0.54, 0, -6), strokeWidth: 1.5 }} />

        {/* ---- the stack strip ---- */}
        {LAYERS.map((l, i) => (
          <g key={l.label}>
            <rect x={cellX(i)} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-fill' />
            <text x={cellX(i) + CELL.w / 2} y={CELL.y + 18} textAnchor='middle' className='dg-dim' style={SMALL}>{l.label}</text>
            <text x={cellX(i) + CELL.w / 2} y={CELL.y + 38} textAnchor='middle' style={SMALL}>{l.tech}</text>
          </g>
        ))}
        <text x={CMD_X} y={CMD_Y} textLength={CMD_W} lengthAdjust='spacing'>{CMD}</text>
      </g>

      {/* ---- the action: each step and its layer light up in turn ---- */}
      {STEPS.map((s, i) => (
        <rect key={s.text} x={CARD.x} y={cardY(i)} width={CARD.w} height={CARD.h} className='dg-wash' style={pulse(s.at, s.at + 0.12, 0.03)} />
      ))}
      <rect x={CARD.x + 18} y={cardY(1) + 24} width={20} height={16} className='dg-wash' style={fade(0.4, 0.44)} />
      <rect x={COLS[0] + 2} y={rowY(ACTED) + 1} width={COLS[3] - COLS[0] - 4} height={ROW_H - 2} className='dg-wash' style={pulse(0.56, 0.68, 0.03)} />
      {LAYERS.map((l, i) => (
        <g key={l.label}>
          <rect x={cellX(i)} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-wash' style={pulse(l.at, l.at + 0.12, 0.03)} />
          <rect x={cellX(i)} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-accent' style={pulse(l.at + 0.02, l.at + 0.1, 0.02)} />
        </g>
      ))}
      {/* the packet rides the top of the strip, cell to cell, under the action */}
      <rect x={cellX(0) + CELL.w / 2 - 5} y={CELL.y - 16} width={10} height={10} className='dg-solid' style={{ ...travel(RUN[0], RUN[1], 4 * (CELL.w + CELL.gap)), ...pulse(RUN[0] - 0.02, RUN[1] + 0.02) }} />

      {/* ---- the result: the row and the pill turn active, the stamp lands, the toast ---- */}
      <rect x={COLS[1] + 12} y={rowY(ACTED) + 9} width={8} height={8} className='dg-solid' style={fade(0.8, 0.84)} />
      <rect x={PILL.x} y={PILL.y} width={PILL.w} height={PILL.h} className='dg-solid' style={fade(0.82, 0.86)} />
      <text x={PILL.x + PILL.w / 2} y={PILL.y + PILL.h / 2} textAnchor='middle' className='dg-on' style={fade(0.84, 0.88)}>active</text>
      <g style={{ ...fade(0.84, 0.9), transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(-10deg) scale(calc(1.6 - 0.6 * ${seg(0.84, 0.92)}))` }}>
        <rect x={STAMP.x} y={STAMP.y} width={STAMP.s} height={STAMP.s} className='dg-accent' style={bar(2.5)} />
        <rect x={STAMP.x + 6} y={STAMP.y + 6} width={STAMP.s - 12} height={STAMP.s - 12} className='dg-wash dg-accent' />
        <text x={STAMP.x + STAMP.s / 2} y={STAMP.y + STAMP.s / 2} textAnchor='middle' style={{ fill: 'hsl(var(--primary))' }}>active</text>
      </g>
      <g style={rise(TOAST_AT, TOAST_AT + 0.06, 0, 10)}>
        <rect x={CARD.x} y={cardY(3)} width={CARD.w} height={CARD.h} className='dg-fill' style={{ stroke: 'hsl(var(--primary))' }} />
        <rect x={CARD.x + 22} y={cardY(3) + 22} width={12} height={12} className='dg-solid' />
        <text x={CARD.x + 48} y={cardY(3) + CARD.h / 2}>status updated</text>
      </g>

      {/* the block cursor rides the typed line */}
      <rect x={CMD_X - 1} y={CMD_Y - 8} width={CMD_W + 2} height={16} style={{ fill: 'hsl(var(--card))', transform: `translate(calc(${seg(0.2, 0.3)} * ${CMD_W + 2}px), 0)` }} />
      <rect x={CMD_X} y={CMD_Y - 7} width={6} height={14} className='dg-ink' style={travel(0.2, 0.3, CMD_W)} />
    </svg>
  )
}
