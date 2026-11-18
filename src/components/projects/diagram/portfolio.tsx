import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

/*
  Portfolio (this site), wireframed: a browser window with a nav bar, a hero, a card grid and an empty post slot.
  An `.mdx` block flies in from outside the window and lands in the slot, where it becomes a rendered post
  (heading bar, text bars, one code block); then the theme wash sweeps across half the window.
  Progress 0..1 (see anim.ts): draw the frame 0-0.25, the mdx lands and renders 0.25-0.75, the theme sweep 0.75-0.95.
*/

const WIN = { x: 40, y: 40, w: 480, h: 400 }
const SLOT = { x: 284, y: 200, w: 212, h: 216 }
const CELLS = [0, 1].flatMap(c => [0, 1, 2].map(r => [64 + c * 92, 200 + r * 76] as const))

// The mdx block: starts outside the window on the right, lands in the centre of the post slot.
const FILE = { x: 562, y: 226, w: 48, h: 60 }
const FILE_D = [SLOT.x + SLOT.w / 2 - FILE.x - FILE.w / 2, SLOT.y + SLOT.h / 2 - FILE.y - FILE.h / 2]

// The typed command: a paper rect slides away from the text, the block cursor rides its edge.
const CMD = '$ pnpm build'
const CMD_X = 40
const CMD_Y = 482
const CMD_W = CMD.length * 6.6
const PAPER: CSSProperties = { fill: 'hsl(var(--card))' }

const bar = (w: number): CSSProperties => ({ strokeWidth: w })
const INK: CSSProperties = { fill: 'none', stroke: 'currentColor' }

export function PortfolioDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='Portfolio: a browser wireframe with a nav bar, a hero and a card grid; an mdx block lands in the empty post slot and becomes a rendered post with a heading, text and a code block, then a theme wash sweeps across half the window' className='dg'>
      {/* ---- beat 1: the empty wireframe ---- */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} pathLength={1} className='dg-fill' style={draw(0, 0.1)} />
      <g style={fade(0.06, 0.12)}>
        <path d={`M${WIN.x} 68H${WIN.x + WIN.w}`} className='dg-edge' />
        {[56, 70, 84].map(x => <circle key={x} cx={x} cy={54} r={3} className='dg-edge' />)}
        <path d='M140 54H300' className='dg-edge' style={bar(6)} />
      </g>
      <g style={fade(0.1, 0.16)}>
        <rect x={64} y={78} width={12} height={12} className='dg-ink' />
        <path d='M348 84H376M388 84H416M428 84H456M468 84H496' className='dg-edge' style={bar(4)} />
        <path d={`M${WIN.x} 100H${WIN.x + WIN.w}`} className='dg-edge' />
      </g>
      <g style={fade(0.14, 0.2)}>
        <path d='M64 132H260' style={{ ...INK, ...bar(8) }} />
        <path d='M64 150H300M64 162H230' className='dg-edge' style={bar(4)} />
        <path d={`M${WIN.x} 184H${WIN.x + WIN.w}`} className='dg-edge' />
      </g>
      <g style={fade(0.18, 0.25)}>
        {CELLS.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={80} height={64} className='dg-edge' style={{ fill: 'none' }} />
            <rect x={x + 10} y={y + 10} width={22} height={16} className='dg-wash' />
            <path d={`M${x + 10} ${y + 40}H${x + 60}M${x + 10} ${y + 52}H${x + 44}`} className='dg-edge' style={bar(4)} />
          </g>
        ))}
        <rect x={SLOT.x} y={SLOT.y} width={SLOT.w} height={SLOT.h} className='dg-edge dg-dash' style={{ fill: 'none' }} />
      </g>

      {/* ---- beat 2: pnpm build, the mdx block lands in the slot and becomes a post ---- */}
      <text x={CMD_X} y={CMD_Y} textLength={CMD_W} lengthAdjust='spacing' style={fade(0.24, 0.26)}>{CMD}</text>
      <rect x={CMD_X - 1} y={CMD_Y - 8} width={CMD_W + 2} height={16} style={{ ...PAPER, transform: `translate(calc(${seg(0.26, 0.34)} * ${CMD_W + 2}px), 0)` }} />
      <rect x={CMD_X} y={CMD_Y - 7} width={6} height={14} className='dg-ink' style={{ ...travel(0.26, 0.34, CMD_W), ...pulse(0.24, 1, 0.02) }} />

      <path d={`M${FILE.x + FILE.w / 2} ${FILE.y + FILE.h / 2}l${FILE_D[0]} ${FILE_D[1]}`} pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.36, 0.52), ...pulse(0.34, 0.62, 0.04) }} />
      <g style={{ ...travel(0.36, 0.52, FILE_D[0], FILE_D[1]), ...pulse(0.3, 0.62, 0.04) }}>
        <path d={`M${FILE.x} ${FILE.y}h${FILE.w - 14}l14 14v${FILE.h - 14}H${FILE.x}Z`} className='dg-fill' style={{ stroke: 'hsl(var(--primary))' }} />
        <path d={`M${FILE.x + FILE.w - 14} ${FILE.y}v14h14`} className='dg-accent' />
        <path d={`M${FILE.x + 10} ${FILE.y + 26}h16M${FILE.x + 10} ${FILE.y + 36}h28M${FILE.x + 10} ${FILE.y + 46}h20`} className='dg-accent' style={bar(3)} />
        <text x={FILE.x + FILE.w / 2} y={FILE.y + FILE.h + 14} textAnchor='middle' className='dg-dim'>.mdx</text>
      </g>
      <g style={rise(0.6, 0.68, 0, 8)}>
        <path d='M304 226H420' style={{ ...INK, ...bar(8) }} />
        <path d='M304 248H476M304 260H448M304 272H468M304 284H392' className='dg-edge' style={bar(4)} />
      </g>
      <g style={rise(0.66, 0.75, 0, 8)}>
        <rect x={304} y={304} width={172} height={88} className='dg-fill' />
        <path d='M320 324H368M332 340H444M332 356H404M320 372H356' className='dg-accent' style={bar(4)} />
      </g>

      {/* ---- beat 3: the theme wash sweeps across half the window, the toggle fills ---- */}
      <rect x={WIN.x + 1} y={69} height={WIN.h - 30} className='dg-ink' style={{ width: `calc(${seg(0.78, 0.92)} * ${WIN.w / 2 - 1}px)`, opacity: 0.1 }} />
      <path d={`M${WIN.x + 1} 69V${WIN.y + WIN.h - 1}`} pathLength={1} className='dg-accent' style={{ ...travel(0.78, 0.92, WIN.w / 2 - 1), ...pulse(0.78, 0.95, 0.02) }} />
      <circle cx={496} cy={54} r={5} className='dg-edge' style={{ fill: 'none', ...fade(0.06, 0.12) }} />
      <circle cx={496} cy={54} r={5} className='dg-solid' style={fade(0.88, 0.95)} />
    </svg>
  )
}
