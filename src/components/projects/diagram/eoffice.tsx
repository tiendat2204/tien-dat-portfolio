import type { CSSProperties } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import { AXIS_BASE, AXIS_TOP, AXIS_X, BASE_INSET, BASE_PATHS, BOARDS, type Board } from '@/components/projects/diagram/eoffice-parts'
import type { SolidPaths } from '@/components/iso/kit/iso-kit'

// E-Office: the document page (PDF preview, documents table, status pill) and its approval track on the left, the
// frontend's five layers exploded as an anatomy stack on the right, the REST API as a separate box under it.
// Phases over --p (see anim.ts): draw the page (0-0.2), explode the stack and number the parts (0.2-0.5),
// approve: the marker walks draft -> review -> active past the role guard while the request rides down the stack
// to the API and the terminal types (0.5-0.84), the result: stamp, pill, table row and toast (0.84-1).

const DOTO: CSSProperties = { fontFamily: 'var(--font-doto)', fontWeight: 800 }
const STAGES = ['draft', 'review', 'active'] as const
const SX = [74, 162, 250]
const TRACK_Y = 372
const ROWS = ['contract', 'memo', 'invoice', 'notice', 'policy']

// Slides from `dy` px below into place (visible the whole time; the stack opens this way).
const slide = (a: number, b: number, dy: number): CSSProperties => ({ transform: `translate(0, calc((1 - ${seg(a, b)}) * ${dy}px))` })

// `+` crosshairs on the corners of a sub-panel.
function Crosses ({ x, y, w, h, style }: { x: number, y: number, w: number, h: number, style?: CSSProperties }) {
  const at = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
  return <path d={at.map(([cx, cy]) => `M${cx - 4} ${cy}H${cx + 4}M${cx} ${cy - 4}V${cy + 4}`).join('')} className='dg-line' style={{ strokeWidth: 0.8, ...style }} />
}

// A kit solid (slab) painted with the anatomy tone ladder: silhouette, side shades, top, hairline outline.
function Solid ({ paths, wash }: { paths: SolidPaths, wash?: CSSProperties }) {
  return (
    <g>
      <path d={paths.fill} style={{ fill: 'var(--anatomy-paper)' }} />
      {paths.shades.map((d, i) => d && <path key={i} d={d} style={{ fill: `var(--anatomy-shade-${i})` }} />)}
      <path d={paths.top} style={{ fill: 'var(--anatomy-top)' }} />
      {wash && <path d={paths.top} className='dg-wash' style={wash} />}
      {paths.crease && <path d={paths.crease} style={{ fill: 'none', stroke: 'var(--anatomy-faint)', strokeWidth: 0.8 }} />}
      {paths.bevel && <path d={paths.bevel} style={{ fill: 'none', stroke: 'var(--anatomy-faint)', strokeWidth: 0.6 }} />}
      <path d={paths.outline} style={{ fill: 'none', stroke: 'var(--anatomy-hi)', strokeWidth: 0.9, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
    </g>
  )
}

// A numbered balloon on a hairline leader from `from` to the balloon's rim.
function Balloon ({ n, from, at, a, accent }: { n: number, from: [number, number], at: [number, number], a: number, accent?: boolean }) {
  return (
    <g>
      <path d={`M${from[0]} ${from[1]}L${at[0]} ${at[1]}`} pathLength={1} className='dg-line' style={{ ...draw(a, a + 0.05), strokeWidth: 0.8 }} />
      <circle cx={from[0]} cy={from[1]} r={1.3} className='dg-ink' style={fade(a, a + 0.03)} />
      <g style={fade(a + 0.03, a + 0.07)}>
        <circle cx={at[0]} cy={at[1]} r={7} className={accent ? 'dg-solid' : 'dg-fill'} style={accent ? undefined : { stroke: 'currentColor', strokeWidth: 0.9 }} />
        <text x={at[0]} y={at[1] + 0.5} textAnchor='middle' className={accent ? 'dg-small dg-on' : 'dg-small'} style={{ fontWeight: 600 }}>{n}</text>
      </g>
    </g>
  )
}

// One board of the stack with its chip, screws, label and balloon; the request's wash runs over its top as it passes.
function BoardView ({ b, i }: { b: Board, i: number }) {
  const open = slide(0.3, 0.46, b.dy)
  const at = 0.6 + (4 - i) * 0.04
  const shown = 0.22 + i * 0.015
  const labelAt = 0.44 + (4 - i) * 0.02
  return (
    <g style={open}>
      <g style={fade(shown, shown + 0.04)}>
        <Solid paths={b.body} wash={pulse(at - 0.01, at + 0.07)} />
        <path d={b.inset} className='dg-edge' style={{ strokeWidth: 0.6 }} />
        <path d={b.screws} style={{ fill: 'none', stroke: 'var(--anatomy-mid)', strokeWidth: 0.7 }} />
        <Solid paths={b.chip} />
      </g>
      <Balloon n={b.n} from={[b.left[0] + 3, b.left[1] - 2]} at={[338, b.cy - 20]} a={0.4 + (4 - i) * 0.02} />
      <g style={fade(labelAt, labelAt + 0.05)}>
        <path d={`M${b.right[0] + 2} ${b.right[1] + 2}H${520}`} className='dg-line' style={{ strokeWidth: 0.8 }} />
        <text x={526} y={b.cy - 10} style={{ fontSize: 10, fontWeight: 600 }}>{b.label}</text>
        <text x={526} y={b.cy + 2} className='dg-dim dg-small'>{b.tech[0]}</text>
        <text x={526} y={b.cy + 13} className='dg-dim dg-small'>{b.tech[1]}</text>
      </g>
    </g>
  )
}

export function EofficeDiagram () {
  const apiY = 388
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='E-Office: a document page with a PDF preview, a documents table and a status pill; an approval track from draft through a role guard to review and active; the frontend stack exploded into ui, routes, data, forms and api boards with numbered balloons, the REST API as a separate box; a terminal line and a stamp' className='dg'>
      <defs>
        <clipPath id='eo-type'>
          <rect x={46} y={420} width={0} height={22} style={{ width: `calc(${seg(0.56, 0.72)} * 160px)` }} />
        </clipPath>
      </defs>

      {/* ---- product scene: the document page ---- */}
      <rect x={24} y={28} width={276} height={304} rx={3} pathLength={1} className='dg-fill' style={draw(0, 0.1)} />
      <Crosses x={24} y={28} w={276} h={304} style={fade(0.02, 0.08)} />
      <g style={fade(0.06, 0.12)}>
        <path d='M24 48H300' className='dg-edge' />
        <text x={36} y={38} className='dg-dim dg-small'>documents / :id</text>
        <rect x={244} y={32} width={48} height={12} rx={6} className='dg-fill' />
        <text x={268} y={38.5} textAnchor='middle' className='dg-small'>staff</text>
      </g>
      <path d='M36 62H150' pathLength={1} className='dg-line' style={{ ...draw(0.08, 0.14), strokeWidth: 6 }} />
      <path d='M36 73H110' pathLength={1} className='dg-edge' style={{ ...draw(0.1, 0.15), strokeWidth: 3 }} />

      {/* status pill: draft, then active */}
      <rect x={212} y={52} width={80} height={20} rx={10} className='dg-fill' style={fade(0.1, 0.15)} />
      <rect x={212} y={52} width={80} height={20} rx={10} className='dg-wash dg-accent' style={fade(0.88, 0.93)} />
      <text x={252} y={62.5} textAnchor='middle' className='dg-small' style={{ opacity: `calc(min(${seg(0.1, 0.15)}, 1 - ${seg(0.88, 0.92)}))` }}>draft</text>
      <text x={252} y={62.5} textAnchor='middle' className='dg-small' style={{ ...fade(0.9, 0.94), fontWeight: 600 }}>active</text>

      {/* PDF preview */}
      <rect x={36} y={82} width={104} height={138} rx={2} pathLength={1} className='dg-edge' style={draw(0.1, 0.16)} />
      <g style={fade(0.12, 0.18)}>
        <rect x={48} y={92} width={80} height={104} className='dg-fill' />
        <path d='M56 102H102M56 110H118M56 118H112M56 126H120M56 134H98M56 148H118M56 156H110M56 164H120M56 172H90' className='dg-edge' style={{ strokeWidth: 2.4 }} />
        <text x={88} y={208} textAnchor='middle' className='dg-dim dg-small'>1 / 3</text>
      </g>
      <path d='M48 92H56V100M120 92H128V100M48 188V196H56M120 196H128V188' pathLength={1} className='dg-accent' style={{ ...draw(0.14, 0.2), strokeWidth: 0.9 }} />
      <text x={36} y={230} className='dg-dim dg-small' style={fade(0.16, 0.2)}>preview · react-pdf</text>
      {/* dimension ticks under the sheet */}
      <g style={fade(0.18, 0.22)}>
        <path d='M48 200V204M128 200V204M48 202H128' className='dg-line' style={{ strokeWidth: 0.6 }} />
      </g>

      {/* documents table */}
      <rect x={152} y={82} width={136} height={138} rx={2} pathLength={1} className='dg-edge' style={draw(0.12, 0.18)} />
      <g style={fade(0.14, 0.2)}>
        <rect x={152} y={82} width={136} height={18} className='dg-wash' />
        <text x={160} y={91} className='dg-small' style={{ fontWeight: 600 }}>name</text>
        <text x={214} y={91} className='dg-small' style={{ fontWeight: 600 }}>status</text>
        <text x={262} y={91} className='dg-small' style={{ fontWeight: 600 }}>rev</text>
        <path d='M208 82V220M256 82V220' className='dg-edge' />
      </g>
      {ROWS.map((row, i) => {
        const y = 110 + i * 22
        const a = 0.16 + i * 0.015
        return (
          <g key={row} style={fade(a, a + 0.04)}>
            <path d={`M152 ${y + 11}H288`} className='dg-edge' />
            <text x={160} y={y} className='dg-small'>{row}</text>
            <text x={270} y={y} textAnchor='middle' className='dg-dim dg-small'>{i === 0 ? 'r2' : 'r1'}</text>
            {i > 0 && <text x={214} y={y} className='dg-dim dg-small'>{i % 2 ? 'active' : 'draft'}</text>}
          </g>
        )
      })}
      <text x={214} y={110} className='dg-small' style={{ opacity: `calc(min(${seg(0.16, 0.2)}, 1 - ${seg(0.9, 0.94)}))` }}>draft</text>
      <text x={214} y={110} className='dg-small' style={{ ...fade(0.9, 0.94), fontWeight: 600 }}>active</text>
      <rect x={153} y={101} width={134} height={20} className='dg-wash' style={fade(0.9, 0.94)} />
      <text x={152} y={230} className='dg-dim dg-small' style={fade(0.18, 0.22)}>TanStack Table</text>

      {/* confirm form: comment + approve */}
      <g style={rise(0.18, 0.24, 0, 6)}>
        <rect x={36} y={240} width={164} height={24} rx={3} className='dg-fill' />
        <text x={44} y={252} className='dg-dim dg-small'>comment</text>
        <rect x={210} y={240} width={78} height={24} rx={3} className='dg-ink' />
        <text x={249} y={252} textAnchor='middle' className='dg-small dg-on' style={{ fontWeight: 600 }}>approve</text>
      </g>
      <path d='M44 258H136' pathLength={1} className='dg-line' style={{ ...draw(0.56, 0.62), strokeWidth: 1.6 }} />
      <rect x={210} y={240} width={78} height={24} rx={3} className='dg-wash dg-accent' style={pulse(0.6, 0.68)} />

      {/* file upload dropzone */}
      <g style={rise(0.2, 0.26, 0, 6)}>
        <rect x={36} y={280} width={252} height={32} rx={3} className='dg-fill dg-dash' />
        <path d='M48 288H56L60 292V304H48Z M56 288V292H60' className='dg-line' style={{ strokeWidth: 0.9 }} />
        <text x={68} y={290} className='dg-small'>drop file · upload</text>
      </g>
      <rect x={68} y={299} width={200} height={4} rx={2} className='dg-edge' style={{ fill: 'none', ...fade(0.22, 0.26) }} />
      <path d='M70 301H266' pathLength={1} className='dg-accent' style={{ ...draw(0.62, 0.74), strokeWidth: 2.4 }} />

      {/* toast */}
      <g style={rise(0.94, 1, 0, 12)}>
        <rect x={150} y={302} width={138} height={22} rx={4} className='dg-fill dg-accent' />
        <circle cx={163} cy={313} r={6} className='dg-solid' />
        <path d='M160 313L162.4 315.4L166.5 310.8' className='dg-line' style={{ stroke: 'hsl(var(--primary-foreground))', strokeWidth: 1.4 }} />
        <text x={176} y={313.5} className='dg-small'>status updated</text>
      </g>

      {/* the stamp lands on the preview */}
      <g transform='translate(88 150)'>
        <g style={{ opacity: seg(0.86, 0.9), transform: `rotate(-14deg) scale(calc(1.7 - 0.7 * ${seg(0.86, 0.92)}))` }}>
          <rect x={-34} y={-13} width={68} height={26} rx={3} className='dg-accent' style={{ fill: 'hsl(var(--background))', strokeWidth: 1.6 }} />
          <rect x={-30} y={-9} width={60} height={18} rx={2} className='dg-accent' style={{ strokeWidth: 0.6 }} />
          <text x={0} y={0.5} textAnchor='middle' style={{ ...DOTO, fontSize: 13, fill: 'hsl(var(--primary))' }}>ACTIVE</text>
        </g>
      </g>

      {/* ---- approval track under the page ---- */}
      {STAGES.map((label, i) => (
        <g key={label}>
          {i < 2 && (
            <path d={`M${SX[i] + 12} ${TRACK_Y}H${SX[i + 1] - 12}`} pathLength={1} className='dg-line' style={draw(0.46 + i * 0.03, 0.52 + i * 0.03)} />
          )}
          <g style={fade(0.44 + i * 0.03, 0.5 + i * 0.03)}>
            <circle cx={SX[i]} cy={TRACK_Y} r={12} className='dg-fill' style={{ stroke: 'currentColor', strokeWidth: 0.9 }} />
            <text x={SX[i]} y={TRACK_Y + 26} textAnchor='middle' className='dg-small'>{label}</text>
          </g>
          <circle cx={SX[i]} cy={TRACK_Y} r={12} className='dg-wash dg-accent' style={fade(0.56 + i * 0.14, 0.6 + i * 0.14)} />
        </g>
      ))}
      <text x={24} y={352} className='dg-dim dg-small' style={fade(0.44, 0.5)}>status flow</text>
      {/* role guard lock on the way to review */}
      <g style={fade(0.5, 0.54)}>
        <rect x={110} y={364} width={16} height={16} rx={2} style={{ fill: 'hsl(var(--background))' }} />
        <rect x={112} y={371} width={12} height={9} rx={1.5} className='dg-ink' />
        <path d='M114.5 371V367.5A3.5 3.5 0 0 1 121.5 367.5V371' className='dg-line' style={{ strokeWidth: 1.2 }} />
      </g>
      <path d='M114.5 371V367.5A3.5 3.5 0 0 1 121.5 367.5V368.6' pathLength={1} className='dg-accent' style={{ ...fade(0.66, 0.7), strokeWidth: 1.2 }} />
      <text x={118} y={TRACK_Y + 26} textAnchor='middle' className='dg-small' style={{ opacity: `calc(min(${seg(0.66, 0.7)}, 1 - ${seg(0.76, 0.8)}))`, fontWeight: 600 }}>staff ok</text>
      {/* marker: draft -> review (pause at the guard) -> active */}
      <circle cx={SX[0]} cy={TRACK_Y} r={4} className='dg-solid' style={{ ...travel(0.56, 0.64, 24), ...pulse(0.54, 0.7) }} />
      <circle cx={SX[0] + 24} cy={TRACK_Y} r={4} className='dg-solid' style={{ ...travel(0.7, 0.76, SX[1] - SX[0] - 24), ...pulse(0.68, 0.77) }} />
      <circle cx={SX[1]} cy={TRACK_Y} r={4} className='dg-solid' style={{ ...travel(0.78, 0.84, SX[2] - SX[1]), ...pulse(0.77, 0.86) }} />
      <path d={`M${SX[2] - 5} ${TRACK_Y}L${SX[2] - 1.5} ${TRACK_Y + 3.5}L${SX[2] + 5.5} ${TRACK_Y - 4}`} pathLength={1} className='dg-accent' style={{ ...draw(0.86, 0.9), strokeWidth: 1.8 }} />

      {/* scene balloons: the same numbers as the stack's boards */}
      <Balloon n={1} from={[212, 62]} at={[196, 76]} a={0.46} />
      <Balloon n={4} from={[288, 252]} at={[302, 240]} a={0.5} />
      <Balloon n={5} from={[288, 296]} at={[302, 284]} a={0.52} />
      <Balloon n={2} from={[126, 366]} at={[140, 352]} a={0.54} />
      <Balloon n={3} from={[288, 91]} at={[302, 104]} a={0.48} />

      {/* ---- anatomy: the frontend stack, exploded ---- */}
      <Crosses x={316} y={28} w={300} h={376} style={fade(0.2, 0.26)} />
      <text x={326} y={40} className='dg-dim dg-small' style={fade(0.2, 0.26)}>frontend · exploded</text>
      <g style={fade(0.2, 0.26)}>
        <Solid paths={BASE_PATHS} />
        <path d={BASE_INSET} className='dg-edge' style={{ strokeWidth: 0.6 }} />
      </g>
      {BOARDS.map((b, i) => <BoardView key={b.id} b={b} i={i} />)}
      {/* centreline, grown from the base as the stack opens */}
      <g transform={`translate(${AXIS_X} ${AXIS_BASE})`}>
        <path d={`M0 0V${AXIS_TOP - AXIS_BASE}`} className='dg-line' style={{ strokeDasharray: '8 2.5 1.5 2.5', strokeWidth: 0.8, transform: `scaleY(${seg(0.3, 0.46)})` }} />
      </g>
      {/* exploded-height dimension on the left */}
      <g style={fade(0.46, 0.52)}>
        <path d={`M322 ${AXIS_BASE}V${AXIS_TOP + 16}M319 ${AXIS_BASE}H325M319 ${AXIS_TOP + 16}H325`} className='dg-line' style={{ strokeWidth: 0.6 }} />
        <text x={322} y={AXIS_TOP + 6} textAnchor='middle' className='dg-dim dg-small'>z</text>
      </g>
      {/* the request rides the centreline down to the API and the response lights the base */}
      <rect x={AXIS_X - 4} y={AXIS_TOP - 4} width={8} height={8} rx={1} className='dg-solid' style={{ ...travel(0.58, 0.8, 0, apiY - AXIS_TOP), ...pulse(0.56, 0.82) }} />
      <path d={`M${AXIS_X} ${AXIS_BASE}V${apiY - 16}`} className='dg-accent dg-dash' style={fade(0.76, 0.8)} />
      <g style={fade(0.5, 0.56)}>
        <rect x={376} y={apiY - 16} width={120} height={32} rx={3} className='dg-fill dg-dash' />
        <text x={436} y={apiY - 5} textAnchor='middle' className='dg-small' style={{ fontWeight: 600 }}>REST API</text>
        <text x={436} y={apiY + 7} textAnchor='middle' className='dg-dim dg-small'>separate backend</text>
      </g>
      <rect x={376} y={apiY - 16} width={120} height={32} rx={3} className='dg-wash dg-accent' style={pulse(0.8, 0.9)} />
      <text x={504} y={apiY - 5} className='dg-small' style={fade(0.82, 0.86)}>PATCH status</text>
      <text x={504} y={apiY + 7} className='dg-small' style={{ ...fade(0.86, 0.9), fill: 'hsl(var(--primary))', fontWeight: 600 }}>200</text>
      {/* the response comes back up to the data board: invalidate */}
      <rect x={AXIS_X - 3} y={apiY - 19} width={6} height={6} rx={1} className='dg-solid' style={{ ...travel(0.86, 0.94, 0, (BOARDS[2]?.cy ?? 0) - (apiY - 16)), ...pulse(0.85, 0.95) }} />

      {/* ---- terminal ---- */}
      <rect x={24} y={416} width={592} height={56} rx={3} className='dg-fill' style={fade(0.52, 0.56)} />
      <Crosses x={24} y={416} w={592} h={56} style={fade(0.52, 0.56)} />
      <text x={34} y={431} style={{ ...fade(0.52, 0.56), fill: 'hsl(var(--primary))', fontWeight: 700 }}>$</text>
      <g clipPath='url(#eo-type)'>
        <text x={48} y={431} style={{ fontSize: 10 }}>cat use-document-status.ts</text>
      </g>
      <rect x={48} y={425} width={6} height={12} className='dg-solid' style={{ ...travel(0.56, 0.72, 160), ...fade(0.54, 0.56) }} />
      <text x={48} y={447} className='dg-dim dg-small' style={fade(0.74, 0.78)}>useMutation({'{'} mutationFn: docApi.setStatus,</text>
      <text x={48} y={460} className='dg-dim dg-small' style={fade(0.76, 0.8)}>  onSuccess: () =&gt; qc.invalidateQueries() {'}'})</text>
      <text x={604} y={431} textAnchor='end' className='dg-small' style={{ ...fade(0.92, 0.96), fill: 'hsl(var(--primary))', fontWeight: 600 }}>→ invalidated</text>
      <text x={604} y={454} textAnchor='end' className='dg-dim dg-small' style={fade(0.78, 0.82)}>toast · Sonner</text>

      {/* ---- title block ---- */}
      <g style={fade(0.02, 0.1)}>
        <path d='M24 486H616M24 506H616M24 486V506M616 486V506M300 486V506M420 486V506M520 486V506' className='dg-edge' style={{ strokeWidth: 0.8 }} />
        <text x={32} y={496} className='dg-dim dg-small'>SHEET  e-office · approval</text>
        <text x={308} y={496} className='dg-dim dg-small'>SCALE</text>
        <text x={352} y={496.5} style={{ ...DOTO, fontSize: 12 }}>1:1</text>
        <text x={428} y={496} className='dg-dim dg-small'>REV  2</text>
        <text x={528} y={496} className='dg-dim dg-small'>FRONTEND ONLY</text>
      </g>
    </svg>
  )
}
