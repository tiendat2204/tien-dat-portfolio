import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

/*
  Portfolio (this site): a browser window with the real header menu (about, skills, experience, awards, articles),
  a hero, a card grid and an empty post slot on the right. Under it, the stack strip: one cell per layer of the
  site's config (ui, content, app, registry, deploy). Over `--p` the scene lights the cells in turn:
  0-0.22 the ghosted frame comes to full strength and the ui cards fill (ui); 0.26-0.52 `post.mdx` flies into the
  slot and renders (content); 0.52-0.66 `$ pnpm build` is typed and the route appears in the url bar (app);
  0.66-0.8 the post's component block renders (registry); 0.8-0.95 the theme wash sweeps the window (deploy).
*/

const WIN = { x: 24, y: 24, w: 536, h: 300 }
const R = WIN.x + WIN.w
const SLOT = { x: 300, y: 96, w: 244, h: 212 }
const CARDS = [0, 1].flatMap(c => [0, 1].map(r => [40 + c * 96, 152 + r * 76] as const))
const NAV = [['about', 40], ['skills', 100], ['experience', 160], ['awards', 250], ['articles', 316]] as const
const URL = 'tiendat.work'

// The stack strip: label / main tech per layer, and the progress window in which the scene touches that layer.
const CELL = { y: 356, w: 100, h: 80, gap: 9 }
const LAYERS: [string, string, number, number][] = [
  ['ui', 'shadcn/ui', 0.06, 0.26],
  ['content', 'MDX', 0.26, 0.52],
  ['app', 'Next.js', 0.52, 0.66],
  ['registry', 'shadcn CLI', 0.66, 0.8],
  ['deploy', 'Vercel', 0.8, 1.2],
]
const cellX = (i: number) => WIN.x + i * (CELL.w + CELL.gap)

// The mdx file: starts outside the window on the right, lands in the centre of the post slot.
const FILE = { x: 576, y: 180, w: 40, h: 52 }
const FILE_D = [SLOT.x + SLOT.w / 2 - FILE.x - FILE.w / 2, SLOT.y + SLOT.h / 2 - FILE.y - FILE.h / 2]

// The typed command: a paper rect slides away from the text, the block cursor rides its edge.
const CMD = '$ pnpm build'
const CMD_X = 24
const CMD_Y = 478
const CMD_W = CMD.length * 6.6
const PAPER: CSSProperties = { fill: 'hsl(var(--card))' }

const bar = (w: number): CSSProperties => ({ strokeWidth: w })
const INK: CSSProperties = { fill: 'none', stroke: 'currentColor' }
const NONE: CSSProperties = { fill: 'none' }
// Ghosted at p=0, full strength by 0.2.
const ghost = (a: number, b: number): CSSProperties => ({ opacity: `calc(0.3 + 0.7 * ${seg(a, b)})` })

export function PortfolioDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='Portfolio: a browser wireframe with the site menu (about, skills, experience, awards, articles), a hero, a card grid and a post slot; post.mdx lands in the slot and becomes a rendered post, pnpm build is typed, the route appears in the url bar and a theme wash sweeps the window, while a strip of five stack cells (ui shadcn/ui, content MDX, app Next.js, registry shadcn CLI, deploy Vercel) lights up in turn' className='dg'>
      <g style={ghost(0, 0.2)}>
        {/* ---- the browser: chrome, url bar, the real header menu ---- */}
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} className='dg-fill' />
        <path d={`M${WIN.x} 52H${R}M${WIN.x} 80H${R}`} className='dg-edge' />
        {[40, 52, 64].map(x => <circle key={x} cx={x} cy={38} r={3} className='dg-edge' style={NONE} />)}
        <rect x={96} y={30} width={224} height={16} className='dg-edge' style={NONE} />
        <text x={104} y={38} className='dg-dim'>{URL}</text>
        <text x={104 + URL.length * 6.6} y={38} style={fade(0.58, 0.66)}>/blog/post</text>
        <circle cx={540} cy={38} r={5} className='dg-edge' style={NONE} />
        <circle cx={540} cy={38} r={5} className='dg-solid' style={fade(0.9, 0.95)} />
        {NAV.map(([label, x]) => <text key={label} x={x} y={66} className='dg-dim'>{label}</text>)}
        <path d='M40 76H76' className='dg-accent' style={{ ...bar(2), ...fade(0.06, 0.12) }} />

        {/* ---- hero bars, the card grid (ui), the empty post slot ---- */}
        <g style={fade(0.04, 0.16)}>
          <path d='M40 104H220' style={{ ...INK, ...bar(8) }} />
          <path d='M40 122H268M40 134H200' className='dg-edge' style={bar(4)} />
        </g>
        {CARDS.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width={84} height={60} className='dg-edge' style={NONE} />
            <rect x={x + 10} y={y + 10} width={24} height={16} className='dg-wash' style={fade(0.1, 0.24)} />
            <path d={`M${x + 10} ${y + 40}H${x + 64}M${x + 10} ${y + 50}H${x + 46}`} className='dg-edge' style={{ ...bar(4), ...fade(0.04, 0.16) }} />
          </g>
        ))}
        <rect x={SLOT.x} y={SLOT.y} width={SLOT.w} height={SLOT.h} className='dg-edge dg-dash' style={NONE} />

        {/* ---- content: post.mdx flies into the slot and renders; registry: its component block ---- */}
        <path d={`M${FILE.x + FILE.w / 2} ${FILE.y + FILE.h / 2}l${FILE_D[0]} ${FILE_D[1]}`} pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.3, 0.44), ...pulse(0.28, 0.54, 0.04) }} />
        <g style={{ ...travel(0.3, 0.44, FILE_D[0], FILE_D[1]), ...pulse(0.22, 0.54, 0.04) }}>
          <path d={`M${FILE.x} ${FILE.y}h${FILE.w - 12}l12 12v${FILE.h - 12}H${FILE.x}Z`} className='dg-fill' style={{ stroke: 'hsl(var(--primary))' }} />
          <path d={`M${FILE.x + FILE.w - 12} ${FILE.y}v12h12`} className='dg-accent' />
          <path d={`M${FILE.x + 8} ${FILE.y + 24}h14M${FILE.x + 8} ${FILE.y + 33}h24M${FILE.x + 8} ${FILE.y + 42}h18`} className='dg-accent' style={bar(3)} />
          <text x={FILE.x + FILE.w} y={FILE.y - 12} textAnchor='end' className='dg-dim'>post.mdx</text>
        </g>
        <g style={rise(0.46, 0.52, 0, 8)}>
          <path d='M316 120H440' style={{ ...INK, ...bar(8) }} />
          <path d='M316 142H528M316 154H500M316 166H516M316 178H420' className='dg-edge' style={bar(4)} />
        </g>
        <g style={rise(0.68, 0.78, 0, 8)}>
          <rect x={316} y={200} width={212} height={84} className='dg-fill' style={{ stroke: 'hsl(var(--primary))' }} />
          <path d='M332 220H380M344 236H472M344 252H432M332 268H368' className='dg-accent' style={bar(4)} />
        </g>

        {/* ---- deploy: the theme wash sweeps across half the window ---- */}
        <rect x={WIN.x + 1} y={81} height={WIN.h - 58} className='dg-ink' style={{ width: `calc(${seg(0.82, 0.94)} * ${WIN.w / 2 - 1}px)`, opacity: 0.1 }} />
        <path d={`M${WIN.x + 1} 81V${WIN.y + WIN.h - 1}`} className='dg-accent' style={{ ...travel(0.82, 0.94, WIN.w / 2 - 1), ...pulse(0.82, 0.97, 0.02) }} />

        {/* ---- the stack strip: one cell per layer, lit while the scene touches it ---- */}
        {LAYERS.map(([label, tech, a, b], i) => (
          <g key={label}>
            <rect x={cellX(i)} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-wash' style={pulse(a, b, 0.04)} />
            <rect x={cellX(i)} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-edge' style={NONE} />
            <rect x={cellX(i)} y={CELL.y} width={CELL.w} height={CELL.h} className='dg-accent' style={{ ...NONE, ...pulse(a, b, 0.04) }} />
            <path d={`M${cellX(i) + 10} ${CELL.y + CELL.h - 10}h${CELL.w - 20}`} className='dg-accent' style={{ ...bar(3), ...fade(a, a + 0.04) }} />
            <text x={cellX(i) + 10} y={CELL.y + 22} className='dg-dim'>{label}</text>
            <text x={cellX(i) + 10} y={CELL.y + 48}>{tech}</text>
          </g>
        ))}
      </g>

      {/* ---- app: the typed command (outside the ghost group so the paper stays opaque) ---- */}
      <text x={CMD_X} y={CMD_Y} textLength={CMD_W} lengthAdjust='spacing' style={fade(0.5, 0.52)}>{CMD}</text>
      <rect x={CMD_X - 1} y={CMD_Y - 8} width={CMD_W + 2} height={16} style={{ ...PAPER, transform: `translate(calc(${seg(0.52, 0.62)} * ${CMD_W + 2}px), 0)` }} />
      <rect x={CMD_X} y={CMD_Y - 7} width={6} height={14} className='dg-ink' style={{ ...travel(0.52, 0.62, CMD_W), ...pulse(0.5, 1.2, 0.02) }} />
    </svg>
  )
}
