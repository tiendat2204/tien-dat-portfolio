import type { CSSProperties } from 'react'

import { draw, fade, seg, travel } from '@/components/projects/diagram/anim'

// E-Office: a document page wireframe (title, text bars, a table of cells) and, at its right, the approval track
// draft -> review -> active with a lock before the last step. Over --p (see anim.ts): draw the page and the track
// (0-0.25), the status block walks draft -> review, the lock opens and it walks on to active (0.25-0.75), the
// stamp lands on the page and the status cells turn solid (0.75-0.95).

const PAGE = { x: 64, y: 48, w: 320, h: 424 }
const COLS = [96, 160, 224, 288, 352]
const ROWS = [212, 242, 272, 302, 332]
const TRACK_X = 480
const NODES = [130, 260, 390]
const STAGES = ['draft', 'review', 'active'] as const
const LOCK_Y = 334
const STAMP = { cx: 316, cy: 418, r: 32 }

// A solid bar standing in for a line of text.
function Bar ({ x, y, w, ink, width = 5, style }: { x: number, y: number, w: number, ink?: boolean, width?: number, style?: CSSProperties }) {
  return <path d={`M${x} ${y}H${x + w}`} className={ink ? 'dg-line' : 'dg-edge'} style={{ strokeWidth: width, ...style }} />
}

// The table grid as one hairline path.
const GRID = [
  ...ROWS.map((y) => `M${COLS[0]} ${y}H${COLS[COLS.length - 1]}`),
  ...COLS.map((x) => `M${x} ${ROWS[0]}V${ROWS[ROWS.length - 1]}`),
].join('')

export function EofficeDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='E-Office: a document page wireframe with a title, text lines and a table; a three-step approval track draft, review, active with a lock before the last step; the status block walks the track, the lock opens and a stamp lands on the page' className='dg'>
      {/* ---- the page ---- */}
      <rect x={PAGE.x} y={PAGE.y} width={PAGE.w} height={PAGE.h} pathLength={1} className='dg-fill' style={{ ...draw(0, 0.12), fillOpacity: `${seg(0.1, 0.16)}` }} />
      <Bar x={96} y={84} w={150} ink width={6} style={fade(0.08, 0.14)} />
      <Bar x={96} y={100} w={90} width={3} style={fade(0.1, 0.16)} />
      <rect x={304} y={78} width={48} height={12} className='dg-edge' style={fade(0.1, 0.16)} />
      <rect x={304} y={78} width={48} height={12} className='dg-solid' style={fade(0.9, 0.95)} />
      {[136, 152, 168, 184].map((y, i) => (
        <Bar key={y} x={96} y={y} w={[256, 232, 256, 176][i] ?? 200} style={fade(0.12 + i * 0.02, 0.18 + i * 0.02)} />
      ))}
      <path d={GRID} pathLength={1} className='dg-edge' style={draw(0.16, 0.26)} />
      {ROWS.slice(0, -1).map((y, i) => (
        <g key={y} style={fade(0.2 + i * 0.015, 0.26 + i * 0.015)}>
          <Bar x={COLS[0] + 12} y={y + 15} w={36} width={4} />
          <Bar x={COLS[1] + 12} y={y + 15} w={24} width={4} />
          <Bar x={COLS[2] + 12} y={y + 15} w={30} width={4} />
          <rect x={COLS[3] + 28} y={y + 11} width={8} height={8} className='dg-edge' />
        </g>
      ))}
      {/* the approved row's status cell */}
      <rect x={COLS[3] + 28} y={ROWS[1] + 11} width={8} height={8} className='dg-solid' style={fade(0.88, 0.93)} />
      <Bar x={96} y={364} w={200} style={fade(0.22, 0.28)} />
      <Bar x={96} y={380} w={140} style={fade(0.24, 0.3)} />

      {/* ---- the stamp lands ---- */}
      <g style={{ ...fade(0.78, 0.86), transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(-12deg) scale(calc(1.8 - 0.8 * ${seg(0.78, 0.88)}))` }}>
        <rect x={STAMP.cx - STAMP.r} y={STAMP.cy - STAMP.r} width={STAMP.r * 2} height={STAMP.r * 2} className='dg-accent' style={{ strokeWidth: 2.5 }} />
        <rect x={STAMP.cx - STAMP.r + 7} y={STAMP.cy - STAMP.r + 7} width={STAMP.r * 2 - 14} height={STAMP.r * 2 - 14} className='dg-wash dg-accent' />
        <path d={`M${STAMP.cx - 16} ${STAMP.cy}H${STAMP.cx + 16}`} className='dg-accent' style={{ strokeWidth: 6 }} />
      </g>

      {/* ---- the approval track ---- */}
      <path d={`M${TRACK_X} ${NODES[0]}V${NODES[1]}`} pathLength={1} className='dg-edge' style={draw(0.06, 0.14)} />
      <path d={`M${TRACK_X} ${NODES[1]}V${NODES[2]}`} pathLength={1} className='dg-edge dg-dash' style={draw(0.14, 0.22)} />
      <path d={`M${TRACK_X} ${NODES[1]}V${NODES[2]}`} pathLength={1} className='dg-accent' style={draw(0.6, 0.66)} />
      {NODES.map((y, i) => (
        <g key={y} style={fade(0.04 + i * 0.06, 0.1 + i * 0.06)}>
          <rect x={TRACK_X - 11} y={y - 11} width={22} height={22} className='dg-fill' />
          <text x={TRACK_X + 26} y={y}>{STAGES[i]}</text>
        </g>
      ))}
      {/* the lock before `active`: its shackle lifts once the request is reviewed */}
      <g style={fade(0.18, 0.24)}>
        <path d={`M${TRACK_X - 6} ${LOCK_Y - 6}V${LOCK_Y - 15}H${TRACK_X + 6}V${LOCK_Y - 6}`} className='dg-line' style={{ ...travel(0.5, 0.58, 0, -7), strokeWidth: 1.5 }} />
        <rect x={TRACK_X - 10} y={LOCK_Y - 6} width={20} height={16} className='dg-fill' style={{ stroke: 'currentColor' }} />
        <rect x={TRACK_X - 10} y={LOCK_Y - 6} width={20} height={16} className='dg-wash' style={fade(0.56, 0.6)} />
      </g>
      {/* the status block walks the track */}
      <g style={travel(0.3, 0.44, 0, NODES[1] - NODES[0])}>
        <g style={travel(0.62, 0.76, 0, NODES[2] - NODES[1])}>
          <rect x={TRACK_X - 7} y={NODES[0] - 7} width={14} height={14} className='dg-solid' style={fade(0.24, 0.3)} />
        </g>
      </g>
    </svg>
  )
}
