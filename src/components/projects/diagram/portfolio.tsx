import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import { iso, onTop, ring, screenRise, slabOf, type Plan, type Projection } from '@/components/iso/kit/iso-kit'

/*
  Portfolio (this site): the spec sheet of tiendat.work. Left, the product: a browser window with the site's own
  character (dot-matrix title, hatch strips, `+` marks, the nav) and an empty `app/blog/[slug]` panel. Right, the
  anatomy: the site's five layers (ui, content, app, registry, deploy: figures/portfolio/config.ts) as axonometric
  plates that explode apart with numbered balloons. Then `$ pnpm build` types, `blog/hello.mdx` leaves the content
  plate and lands in the panel as a rendered post, a theme sweep crosses the window and the build prints its result.
  Progress 0..1 (see anim.ts): draw 0-0.24, explode 0.24-0.5, build 0.46-0.82, theme 0.8-0.92, result 0.9-1.
*/

// --- the stack (kit geometry, built once at module load) ---------------------------------------------------------------

const P: Projection = { origin: [450, 200], scale: 1.107 }
const PLAN: Plan = { x: -55, y: -40, w: 110, d: 80, r: 3 }
const T = 5
const RISE = screenRise(1, P)
const PITCH_CLOSED = 7
const PITCH_OPEN = 40
const SLAB = slabOf(PLAN, 0, T, P, 6)
const [ROOT_X, ROOT_Y] = iso([PLAN.x + PLAN.w, PLAN.y + PLAN.r + 2, T / 2], P)
const BALLOON_DX = 22
const BALLOON_DY = -12

type Layer = { n: number, label: string, tech: string[], motif: string }

const motifRects = (boxes: [number, number, number, number][]) =>
  boxes.map(([x, y, w, d]) => onTop([[x, y], [x + w, y], [x + w, y + d], [x, y + d]], T, P, true)).join('')
const motifLines = (lines: [number, number, number, number][]) =>
  lines.map(([x1, y1, x2, y2]) => onTop([[x1, y1], [x2, y2]], T, P)).join('')

// Plate index 0 is the bottom (deploy); config layer k is plate 4 - k, so the ui is the top plate and balloon 1.
const LAYERS: Layer[] = [
  { n: 5, label: 'deploy', tech: ['Vercel'], motif: ring(0, 0, 24, T, P, 32) + ring(0, 0, 12, T, P, 24) + motifLines([[-32, 0, 32, 0], [0, -32, 0, 32]]) },
  { n: 4, label: 'registry', tech: ['shadcn CLI'], motif: motifRects([-2, -1, 0, 1].flatMap(i => [-1, 0, 1].map((j): [number, number, number, number] => [i * 22 - 8, j * 18 - 6, 16, 12]))) },
  { n: 3, label: 'app', tech: ['Next.js 16'], motif: motifRects([[-11, -28, 22, 12], [-46, 6, 26, 12], [-13, 6, 26, 12], [20, 6, 26, 12]]) + motifLines([[0, -16, 0, -4], [-33, -4, 33, -4], [-33, -4, -33, 6], [0, -4, 0, 6], [33, -4, 33, 6]]) },
  { n: 2, label: 'content', tech: ['MDX', 'Fumadocs'], motif: motifLines([[-40, -26, -24, -26], [-40, -14, 40, -14], [-40, -4, 22, -4], [-40, 6, 36, 6], [-40, 16, 12, 16]]) + motifRects([[-40, -30, 10, 8]]) },
  { n: 1, label: 'ui', tech: ['shadcn/ui', 'Tailwind'], motif: motifRects([[-42, -26, 26, 20], [-13, -26, 26, 20], [16, -26, 26, 20]]) + motifLines([[-42, 4, 30, 4], [-42, 14, -2, 14]]) },
]

// Screen lift of plate i at rest and fully open; the middle plate stays put, the others part around it.
const liftOf = (i: number, pitch: number) => -(i - 2) * pitch * RISE
const OPEN_Y = (i: number) => 200 + liftOf(i, PITCH_OPEN)
const topEdge = OPEN_Y(4) - 47 - T * RISE
const bottomEdge = OPEN_Y(0) + 47

// --- the browser (the site's own character) ---------------------------------------------------------------------------

const NAV = [['about', 40], ['skills', 82], ['experience', 126], ['awards', 198], ['articles', 250]] as const

// 45-degree hatch, like the hero strip and the card's own backdrop: one path, drawn line by line.
function hatch (x0: number, y0: number, w: number, h: number, step = 6) {
  const d: string[] = []
  for (let s = x0 - h; s < x0 + w; s += step) {
    const a = Math.max(s, x0)
    const b = Math.min(s + h, x0 + w)
    if (a < b) d.push(`M${a} ${y0 + h - (a - s)}L${b} ${y0 + h - (b - s)}`)
  }
  return d.join('')
}
const STRIP_A = hatch(40, 108, 256, 12)
const STRIP_B = hatch(40, 126, 140, 5)

const cross = (x: number, y: number) => `M${x - 4} ${y}h8M${x} ${y - 4}v8`
const CROSSES = [cross(32, 60), cross(304, 60), cross(32, 312), cross(304, 312)].join('')
const PANEL_CROSSES = [cross(46, 160), cross(290, 160), cross(46, 304), cross(290, 304)].join('')

const PAPER: CSSProperties = { fill: 'hsl(var(--card))' }
const DOTO: CSSProperties = { fontFamily: 'var(--font-doto)', fontWeight: 800 }
const HAIR: CSSProperties = { strokeWidth: 0.8 }

// The mdx file: starts on the content plate (plate 3), lands on the post panel.
const FILE_FROM: [number, number] = [450, OPEN_Y(3) - 8]
const FILE_TO: [number, number] = [168, 230]
const FILE_D = [FILE_TO[0] - FILE_FROM[0], FILE_TO[1] - FILE_FROM[1]]

// The typed command: a paper rect shrinks away from the text, the block cursor rides its edge.
const CMD = '$ pnpm build'
const CMD_X = 40
const CMD_Y = 422
const CMD_W = CMD.length * 6.6

function Balloon ({ x, y, n, style, small = false }: { x: number, y: number, n: number, style?: CSSProperties, small?: boolean }) {
  return (
    <g style={style}>
      <circle cx={x} cy={y} r={small ? 6 : 7} className='dg-fill' style={{ stroke: 'currentColor', strokeWidth: 0.9 }} />
      <text x={x} y={y + 0.5} textAnchor='middle' className='dg-small' style={{ fontWeight: 500 }}>{n}</text>
    </g>
  )
}

function Plate ({ layer, i }: { layer: Layer, i: number }) {
  const rest = liftOf(i, PITCH_CLOSED)
  const open = liftOf(i, PITCH_OPEN)
  const at = 0.4 + (4 - i) * 0.02
  const bx = ROOT_X + BALLOON_DX
  const by = ROOT_Y + BALLOON_DY
  return (
    <g transform={`translate(0 ${rest.toFixed(1)})`}>
      <g style={{ ...travel(0.24, 0.42, 0, open - rest), ...fade(0.14, 0.2) }}>
        <path className='iso-fill' d={SLAB.fill} />
        {SLAB.shades.map((d, shade) => d && <path key={shade} className='iso-shade' data-shade={shade} d={d} />)}
        <path className='iso-top' d={SLAB.top} />
        <path className='dg-edge' d={SLAB.crease} style={HAIR} />
        <path className='dg-line' d={SLAB.outline} pathLength={1} style={{ ...draw(0.14, 0.26), strokeWidth: 0.9 }} />
        <path className='dg-line' d={layer.motif} pathLength={1} style={{ ...draw(0.3 + i * 0.02, 0.44 + i * 0.02), strokeWidth: 0.7, opacity: 0.7 }} />
        {/* balloon: a hairline leader from the plate's right face to a numbered circle, the layer's name beside it */}
        <path d={`M${ROOT_X.toFixed(1)} ${ROOT_Y.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`} pathLength={1} className='dg-line' style={{ ...draw(at, at + 0.05), ...HAIR }} />
        <circle cx={ROOT_X} cy={ROOT_Y} r={1.3} className='dg-ink' style={fade(at, at + 0.02)} />
        <Balloon x={bx} y={by} n={layer.n} style={fade(at + 0.03, at + 0.07)} />
        <g style={fade(at + 0.05, at + 0.09)}>
          <text x={bx + 11} y={by} style={{ fontSize: 10, fontWeight: 500 }}>{layer.label}</text>
          {layer.tech.map((tech, k) => <text key={tech} x={bx + 11} y={by + 11 + k * 10} className='dg-dim dg-small'>{tech}</text>)}
        </g>
      </g>
    </g>
  )
}

export function PortfolioDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='Portfolio: a browser window with the site, its five layers (ui, content, app, registry, deploy) exploded as axonometric plates with numbered balloons, pnpm build typed in a terminal, an mdx file rendered as a blog post, a light and dark theme sweep and the static build result' className='dg'>
      {/* ---- product: the browser window ---- */}
      <rect x={20} y={24} width={296} height={300} rx={6} pathLength={1} className='dg-fill' style={draw(0, 0.08)} />
      <g style={fade(0.05, 0.11)}>
        <path d='M20 48H316' className='dg-edge' />
        {[34, 46, 58].map(x => <circle key={x} cx={x} cy={36} r={3} className='dg-edge' />)}
        <rect x={76} y={29.5} width={170} height={13} rx={6.5} className='dg-fill' />
        <text x={86} y={36} className='dg-dim dg-small'>tiendat.work/blog/hello</text>
        <circle cx={300} cy={36} r={6.5} className='dg-fill' />
      </g>
      <path d={CROSSES} pathLength={1} className='dg-line' style={{ ...draw(0.08, 0.14), ...HAIR }} />
      <text x={40} y={86} style={{ ...DOTO, fontSize: 28, ...fade(0.1, 0.16) }}>TIEN DAT</text>
      <path d={STRIP_A} pathLength={1} className='dg-edge' style={draw(0.12, 0.2)} />
      <path d={STRIP_B} pathLength={1} className='dg-edge' style={draw(0.16, 0.22)} />
      <g style={fade(0.16, 0.22)}>
        {NAV.map(([label, x]) => <text key={label} x={x} y={142} className={label === 'articles' ? undefined : 'dg-dim'} style={{ fontSize: 9 }}>{label}</text>)}
        <path d='M250 149H290' className='dg-accent' />
      </g>
      {/* the empty post panel: app/blog/[slug] before the build */}
      <rect x={40} y={154} width={256} height={156} rx={3} pathLength={1} className='dg-edge dg-dash' style={draw(0.18, 0.24)} />
      <path d={PANEL_CROSSES} className='dg-line' style={{ ...fade(0.2, 0.24), ...HAIR }} />
      <text x={56} y={166} className='dg-dim dg-small' style={fade(0.2, 0.24)}>app/blog/[slug]</text>
      <path d='M246 36H254' className='dg-line' style={{ ...fade(0.44, 0.48), ...HAIR }} />
      <Balloon x={262} y={36} n={3} small style={fade(0.44, 0.48)} />

      {/* ---- anatomy: the exploded stack ---- */}
      <path d={`M450 ${(bottomEdge + 12).toFixed(1)}V${(topEdge - 10).toFixed(1)}`} pathLength={1} className='dg-line dg-dash' style={{ ...draw(0.26, 0.44), ...HAIR }} />
      {LAYERS.map((layer, i) => <Plate key={layer.label} layer={layer} i={i} />)}
      {/* dimension: the open stack's height */}
      <g style={fade(0.42, 0.48)}>
        <path d={`M346 ${topEdge.toFixed(1)}V${bottomEdge.toFixed(1)}M342 ${topEdge.toFixed(1)}h8M342 ${bottomEdge.toFixed(1)}h8M352 ${topEdge.toFixed(1)}H358M352 ${bottomEdge.toFixed(1)}H358`} className='dg-line' style={HAIR} />
        <text x={0} y={0} textAnchor='middle' className='dg-dim dg-small' transform={`translate(339 ${((topEdge + bottomEdge) / 2).toFixed(1)}) rotate(-90)`}>5 layers · exploded</text>
      </g>
      <text x={450} y={bottomEdge + 24} textAnchor='middle' className='dg-dim dg-small' style={fade(0.44, 0.5)}>assembly · axonometric</text>
      {/* the side module (config.side): the motion libraries, this page's scroll among them */}
      <g style={rise(0.46, 0.52, 0, 6)}>
        <rect x={40} y={344} width={236} height={24} rx={3} className='dg-edge dg-dash' />
        <path d='M136 344V324' className='dg-edge dg-dash' />
        <text x={52} y={356} style={{ fontSize: 10, fontWeight: 500 }}>motion</text>
        <text x={100} y={356} className='dg-dim dg-small'>GSAP · Motion · Lenis</text>
        <text x={276} y={337} textAnchor='end' className='dg-dim' style={{ fontSize: 8 }}>side module</text>
      </g>

      {/* ---- build: the mdx file leaves the content plate and lands as a rendered post ---- */}
      <path d={`M${FILE_FROM[0]} ${FILE_FROM[1]}L${FILE_TO[0]} ${FILE_TO[1]}`} pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.52, 0.66), ...pulse(0.5, 0.74, 0.03) }} />
      <g style={{ ...travel(0.52, 0.66, FILE_D[0], FILE_D[1]), ...pulse(0.47, 0.72, 0.03) }}>
        <g transform={`translate(${FILE_FROM[0] - 20} ${FILE_FROM[1] - 26})`}>
          <path d='M0 0H28L40 12V52H0Z' className='dg-fill' style={{ stroke: 'hsl(var(--primary))' }} />
          <path d='M28 0V12H40' className='dg-accent' />
          <path d='M7 20H21M7 28H33M7 36H27M7 44H17' className='dg-accent' style={HAIR} />
          <text x={20} y={64} textAnchor='middle' className='dg-small'>blog/hello.mdx</text>
          <Balloon x={40} y={2} n={2} small />
        </g>
      </g>
      {/* the rendered post */}
      <text x={52} y={186} style={{ fontSize: 14, fontWeight: 700, ...fade(0.68, 0.72) }}>Hello</text>
      <g style={fade(0.69, 0.73)}>
        <rect x={238} y={174} width={46} height={32} rx={2} className='dg-fill' />
        <circle cx={271} cy={183} r={3} className='dg-edge' />
        <path d='M238 206L252 190L261 199L268 193L284 206' className='dg-edge' />
        <text x={261} y={213} textAnchor='middle' className='dg-dim' style={{ fontSize: 8 }}>next/image</text>
      </g>
      <path d='M52 200H226M52 210H200' pathLength={1} className='dg-edge' style={{ ...draw(0.68, 0.74), strokeWidth: 3 }} />
      <g style={rise(0.72, 0.77, 0, 6)}>
        <rect x={52} y={220} width={216} height={22} rx={3} className='dg-wash' />
        <path d='M53.5 222V240' className='dg-accent' style={{ strokeWidth: 2.5 }} />
        <text x={64} y={231} className='dg-small'>Callout · written in MDX</text>
      </g>
      <g style={rise(0.75, 0.8, 0, 6)}>
        <rect x={52} y={250} width={216} height={46} rx={3} className='dg-fill' />
        <text x={60} y={259} className='dg-dim' style={{ fontSize: 8 }}>tsx</text>
      </g>
      <path d='M64 270H140M76 280H200M76 290H150' pathLength={1} className='dg-accent' style={{ ...draw(0.77, 0.83), strokeWidth: 3 }} />
      <path d='M268 231H278' className='dg-line' style={{ ...fade(0.8, 0.84), ...HAIR }} />
      <Balloon x={284} y={231} n={1} small style={fade(0.8, 0.84)} />

      {/* ---- theme: a wash sweeps the window, the toggle turns from sun to moon ---- */}
      <rect x={21} y={49} height={274} className='dg-ink' style={{ width: `calc(${seg(0.82, 0.92)} * 294px)`, opacity: 0.1 }} />
      <path d='M21 49V323' pathLength={1} className='dg-accent' style={{ ...travel(0.82, 0.92, 294), ...pulse(0.82, 0.94, 0.02) }} />
      <g style={{ opacity: `calc(min(${seg(0.05, 0.11)}, 1 - ${seg(0.86, 0.92)}))` }}>
        <circle cx={300} cy={36} r={2.5} className='dg-accent' />
        <path d='M300 29.5V31M300 41V42.5M293.5 36H295M305 36H306.5' className='dg-accent' />
      </g>
      <path d='M301.5 31A5 5 0 1 0 302.5 41A4 4 0 0 1 301.5 31Z' className='dg-solid' style={fade(0.86, 0.92)} />

      {/* ---- terminal: the build and its result ---- */}
      <rect x={20} y={402} width={600} height={66} rx={4} pathLength={1} className='dg-fill' style={draw(0.4, 0.46)} />
      <path d={[cross(28, 410), cross(612, 410), cross(28, 460), cross(612, 460)].join('')} className='dg-line' style={{ ...fade(0.44, 0.48), ...HAIR }} />
      <text x={CMD_X} y={CMD_Y} textLength={CMD_W} lengthAdjust='spacing' style={fade(0.44, 0.46)}>{CMD}</text>
      <rect x={CMD_X - 1} y={CMD_Y - 8} width={CMD_W + 2} height={16} style={{ ...PAPER, transform: `translate(calc(${seg(0.46, 0.54)} * ${CMD_W + 2}px), 0)` }} />
      <rect x={CMD_X} y={CMD_Y - 7} width={6} height={14} className='dg-ink' style={{ ...travel(0.46, 0.54, CMD_W), ...pulse(0.44, 0.9, 0.02) }} />
      <text x={CMD_X} y={CMD_Y + 18} className='dg-small' style={fade(0.9, 0.94)}>
        <tspan style={{ fill: 'hsl(var(--primary))' }}>✓</tspan> Generating static pages · next/image optimized
      </text>
      <text x={CMD_X} y={CMD_Y + 34} className='dg-small' style={fade(0.94, 0.98)}>
        <tspan className='dg-dim'>○</tspan> /blog/hello <tspan className='dg-dim'>(Static)</tspan> · theme light/dark · analytics
      </text>
      <path d='M356 456H366' className='dg-line' style={{ ...fade(0.96, 1), ...HAIR }} />
      <Balloon x={374} y={456} n={5} small style={fade(0.96, 1)} />

      {/* ---- title block ---- */}
      <g style={fade(0.02, 0.08)}>
        <rect x={20} y={484} width={600} height={22} className='dg-fill' />
        <path d='M300 484V506M420 484V506M530 484V506' className='dg-edge' />
        <text x={30} y={495} style={{ ...DOTO, fontSize: 11 }}>PORTFOLIO</text>
        <text x={110} y={495} className='dg-dim dg-small'>spec sheet · tiendat.work</text>
        <text x={310} y={495} className='dg-dim dg-small'>SCALE 1:1</text>
        <text x={430} y={495} className='dg-dim dg-small'>FIG 1 / 8</text>
        <text x={540} y={495} className='dg-dim dg-small'>REV A</text>
      </g>
    </svg>
  )
}
