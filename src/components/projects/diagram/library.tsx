import type { CSSProperties, ReactNode } from 'react'

import type { SolidPaths } from '@/components/iso/kit/iso-kit'
import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import { bookcase, grow, settle, stack, typed } from '@/components/projects/diagram/library-parts'

// Library: an axonometric bookcase (floor and shelf labels, a ruler on top), the app's five layers exploded beside it
// with numbered balloons, then the catalog flow along the bottom: a barcode read by a beam, the ISBN lookup filling
// the entry form, the new copy filed on its shelf, and a loan card whose three dates pass the due check. A `$` line
// and a title block close the sheet. Progress 0..1 (see anim.ts); facts from the project's config and fact sheet.

const SHELF_AT: [number, number] = [24, 30]
const STACK_AT: [number, number] = [446, 28]
const CASE = bookcase(252, 200)
const STACK = stack(5, 170, 212)

const LAYERS = [
  { name: 'ui', tech: 'React 19 · shadcn/ui' },
  { name: 'app', tech: 'Next.js 16 · App Router' },
  { name: 'data', tech: 'TanStack Query · Table' },
  { name: 'state', tech: 'Redux Toolkit · Zustand' },
  { name: 'forms', tech: 'React Hook Form · Zod' },
]

const BARS = [0, 4, 7, 9, 13, 16, 18, 22, 25, 27, 31, 34, 36, 40, 43, 45]
const FIELDS = [['isbn', 78], ['title', 108], ['author', 92], ['publisher', 84], ['ddc', 40]] as const
const DATES = ['borrow', 'due', 'return']
const COMMAND = 'npx playwright test borrow.spec.ts'

const CH = 7 // one 11px mono character (the typed line is forced to this advance)
const tenth = (v: number) => Math.round(v * 10) / 10

// A kit solid in the sheet's tones: paper fill, the shaded faces, a hairline edge.
function Solid ({ paths, tone = 'mid', style }: { paths: SolidPaths, tone?: 'hi' | 'mid' | 'lo', style?: CSSProperties }) {
  return (
    <g style={style}>
      <path className='iso-fill' d={paths.fill} />
      {paths.shades.map((d, i) => (d ? <path key={i} className='iso-shade' data-shade={i} d={d} /> : null))}
      <path className='iso-top' d={paths.top} />
      {paths.crease && <path className='iso-line' data-tone='faint' d={paths.crease} style={{ strokeWidth: 0.7 }} />}
      {paths.bevel && <path className='iso-line' data-tone='faint' d={paths.bevel} style={{ strokeWidth: 0.7 }} />}
      <path className='iso-line' data-tone={tone} d={paths.outline} style={{ strokeWidth: 0.8 }} />
    </g>
  )
}

// `+` crosshairs on the corners of a rect.
function Marks ({ x, y, w, h }: { x: number, y: number, w: number, h: number }) {
  const cross = (cx: number, cy: number) => `M${cx - 4} ${cy}H${cx + 4}M${cx} ${cy - 4}V${cy + 4}`
  return <path d={cross(x, y) + cross(x + w, y) + cross(x, y + h) + cross(x + w, y + h)} className='dg-line' style={{ strokeWidth: 0.9 }} />
}

// A numbered balloon: paper circle, the number, nothing else (the leader is the caller's).
function Balloon ({ x, y, n, small }: { x: number, y: number, n: string, small?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={small ? 6 : 7} className='dg-fill' style={{ stroke: 'var(--anatomy-mid)' }} />
      <text x={x} y={y} textAnchor='middle' className='dg-small' style={{ fontWeight: 500 }}>{n}</text>
    </g>
  )
}

// A sub-panel of the sheet: a card with crosshair corners, a dim header and a balloon tag at its top right.
function Panel ({ x, y, w, h, title, tag, style, children }: { x: number, y: number, w: number, h: number, title: string, tag: string, style: CSSProperties, children: ReactNode }) {
  return (
    <g style={style}>
      <rect x={x} y={y} width={w} height={h} className='dg-fill' />
      <Marks x={x} y={y} w={w} h={h} />
      <text x={x + 12} y={y + 16} className='dg-dim dg-small'>{title}</text>
      <Balloon x={x + w - 14} y={y + 16} n={tag} small />
      {children}
    </g>
  )
}

function Bookcase () {
  const { posts, boards, waves, newCopy, copyAt, ticks, labels } = CASE
  const [sx, sy] = SHELF_AT
  const waveStyle = (i: number) => rise(0.05 + i * 0.018, 0.11 + i * 0.018, 0, 6)
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <Solid paths={posts[0]} style={fade(0, 0.06)} />
      {[0, 1].map(bay => (
        <g key={bay}>
          <Solid paths={boards[bay]!} tone='hi' style={fade(0.01 + bay * 0.03, 0.07 + bay * 0.03)} />
          {waves.map((wave, i) => wave.bay === bay && (
            <g key={i} style={waveStyle(i)}>
              {wave.books.map((book, j) => <Solid key={j} paths={book} />)}
            </g>
          ))}
          {bay === 1 && (
            <g style={rise(0.74, 0.8, 0, 8)}>
              <Solid paths={newCopy} tone='hi' />
              <path d={newCopy.fill} className='dg-wash' />
              <path d={newCopy.outline} className='dg-accent' style={{ strokeWidth: 0.9 }} />
            </g>
          )}
        </g>
      ))}
      <Solid paths={boards[2]!} tone='hi' style={fade(0.07, 0.13)} />
      <Solid paths={posts[1]} style={fade(0.08, 0.14)} />
      <g style={fade(0.14, 0.2)}>
        <path d={ticks.minor} className='iso-line' data-tone='mid' style={{ strokeWidth: 0.6 }} />
        <path d={ticks.major} className='iso-line' data-tone='hi' style={{ strokeWidth: 0.7 }} />
      </g>
      {labels.map(({ bay, at }, i) => (
        <text key={bay} x={tenth(at[0]) + 2} y={tenth(at[1]) + (i ? 12 : -9)} textAnchor={i ? 'end' : 'start'} className='dg-small' style={fade(0.16 + i * 0.03, 0.22 + i * 0.03)}>{bay}</text>
      ))}
      <circle cx={tenth(copyAt[0])} cy={tenth(copyAt[1])} r={1.6} className='dg-solid' style={fade(0.76, 0.8)} />
    </g>
  )
}

function Stack () {
  const { plates, axis, foot } = STACK
  const [sx, sy] = STACK_AT
  return (
    <g transform={`translate(${sx} ${sy})`}>
      {plates.map((plate, i) => {
        const k = plates.length - 1 - i
        const { name, tech } = LAYERS[k]!
        const [bx, by] = plate.balloon
        const a = 0.3 + k * 0.025
        return (
          <g key={i} style={settle(0.24, 0.4, 0, plate.rest)}>
            <g style={fade(0.18, 0.24)}>
              <Solid paths={plate.paths} tone={k === 0 ? 'hi' : 'mid'} />
            </g>
            <g style={fade(a, a + 0.06)}>
              <path d={`M${tenth(plate.root[0])} ${tenth(plate.root[1])}L${tenth(bx)} ${tenth(by)}`} className='iso-line' data-tone='mid' style={{ strokeWidth: 0.8 }} />
              <circle cx={tenth(plate.root[0])} cy={tenth(plate.root[1])} r={1.1} style={{ fill: 'var(--anatomy-mid)' }} />
              <Balloon x={tenth(bx)} y={tenth(by)} n={String(k + 1)} />
              <text x={tenth(bx) - 11} y={tenth(by) - 6} textAnchor='end'>{name}</text>
              <text x={tenth(bx) - 11} y={tenth(by) + 7} textAnchor='end' className='dg-dim dg-small'>{tech}</text>
            </g>
          </g>
        )
      })}
      {/* the chain-line axis through the open stack, then the loan card's leader from the bottom plate's front corner */}
      <path
        d={`M${tenth(axis.x)} ${tenth(axis.y1)}V${tenth(axis.y2)}`}
        className='iso-line'
        data-tone='mid'
        style={{ ...grow(0.26, 0.42, axis.x, axis.y1), strokeDasharray: '9 2.5 1.5 2.5', strokeWidth: 0.8 }}
      />
      {/* the loan card below hangs its leader from the bottom plate's front corner */}
      <path d={`M${tenth(foot[0])} ${tenth(foot[1]) + 3}V${256 - sy}`} pathLength={1} className='dg-accent dg-dash' style={draw(0.86, 0.9)} />
      <circle cx={tenth(foot[0])} cy={tenth(foot[1]) + 3} r={1.6} className='dg-solid' style={fade(0.86, 0.89)} />
    </g>
  )
}

export function LibraryDiagram () {
  const copy: [number, number] = [tenth(SHELF_AT[0] + CASE.copyAt[0]), tenth(SHELF_AT[1] + CASE.copyAt[1])]
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='Library: an axonometric bookcase with floor and shelf labels, the app stack exploded into ui, app, data, state and forms layers with numbered balloons, a barcode read by a scan beam, the ISBN lookup filling the entry form, the new copy filed on its shelf, and a loan card whose borrow, due and return dates pass the due check' className='dg'>
      <Bookcase />
      <Stack />

      {/* camera and barcode */}
      <Panel x={24} y={256} w={172} h={184} title='camera · barcode' tag='s' style={rise(0.44, 0.5, 0, 10)}>
        <text x={36} y={428} className='dg-dim dg-small'>zxing-wasm · in the browser</text>
      </Panel>
      <g style={fade(0.48, 0.53)}>
        <rect x={42} y={290} width={136} height={92} className='dg-edge' style={{ fill: 'none' }} />
        <path d={BARS.map((o, i) => `M${50 + o * 2.6} 298h${i % 3 === 0 ? 4 : 2.4}v72h${i % 3 === 0 ? -4 : -2.4}z`).join('')} className='dg-ink' />
        <path d='M50 390V396M171 390V396M50 393H171' className='dg-edge' />
        <text x={110} y={404} textAnchor='middle' className='dg-dim dg-small'>EAN-13 · isbn</text>
      </g>
      <rect x={42} y={290} width={136} height={92} className='dg-wash' style={fade(0.6, 0.64)} />
      <rect x={38} y={289} width={144} height={2} className='dg-solid' style={{ ...travel(0.52, 0.62, 0, 90), ...pulse(0.5, 0.64) }} />
      <path d='M196 296H206M203 293L206 296L203 299' pathLength={1} className='dg-accent' style={draw(0.6, 0.64)} />

      {/* the entry form: the scan gives the isbn, the lookup fills the rest, the copy goes to its shelf */}
      <Panel x={212} y={256} w={196} h={184} title='entry form · isbn lookup' tag='2' style={rise(0.56, 0.62, 10, 0)}>
        {FIELDS.map(([name, len], i) => {
          const y = 288 + i * 24
          const a = i ? 0.68 + i * 0.025 : 0.62
          return (
            <g key={name}>
              <text x={226} y={y + 8} className='dg-small'>{name}</text>
              <rect x={286} y={y} width={110} height={16} className='dg-fill' />
              <rect x={291} y={y + 5} height={6} className='dg-solid' style={{ width: `calc(${seg(a, a + 0.04)} * ${len}px)` }} />
            </g>
          )
        })}
        <text x={226} y={428} className='dg-dim dg-small' style={pulse(0.56, 0.78)}>lookup fills title → ddc</text>
      </Panel>
      <text x={226} y={428} className='dg-small' style={{ ...fade(0.76, 0.8), fill: 'hsl(var(--primary))' }}>copy → floor 2 · shelf B</text>
      <path d={`M282 256V${copy[1]}H${copy[0] + 4}`} pathLength={1} className='dg-accent dg-dash' style={draw(0.72, 0.78)} />

      {/* the loan card: three dates, the due check */}
      <Panel x={424} y={256} w={192} h={184} title='loan card · borrow order' tag='5' style={rise(0.8, 0.85, 0, 10)}>
        {DATES.map((name, i) => {
          const y = 290 + i * 28
          const a = 0.84 + i * 0.03
          return (
            <g key={name}>
              <text x={438} y={y + 8} className='dg-small'>{name}</text>
              <rect x={498} y={y} width={104} height={16} className={i === 1 ? 'dg-wash dg-accent' : 'dg-fill'} />
              {[0, 1, 2].map(j => (
                <rect key={j} x={504 + j * 32} y={y + 5} height={6} className='dg-solid' style={{ width: `calc(${seg(a + j * 0.01, a + 0.02 + j * 0.01)} * ${j ? 14 : 26}px)` }} />
              ))}
              {[1, 2].map(j => <text key={j} x={501 + j * 32} y={y + 8} textAnchor='middle' className='dg-dim dg-small'>·</text>)}
            </g>
          )
        })}
        <path d='M438 378H602' className='dg-edge' />
      </Panel>
      {['due ≥ borrow', 'return ≥ borrow'].map((rule, i) => {
        const a = 0.9 + i * 0.03
        const y = 396 + i * 22
        return (
          <g key={rule} style={fade(a, a + 0.03)}>
            <circle cx={445} cy={y} r={6.5} className='dg-fill dg-accent' />
            <path d={`M441.5 ${y}L444 ${y + 2.5}L448.5 ${y - 2.5}`} pathLength={1} className='dg-accent' style={draw(a, a + 0.04)} />
            <text x={458} y={y} className='dg-small'>{rule}</text>
            <text x={602} y={y} textAnchor='end' className='dg-small' style={{ fill: 'hsl(var(--primary))' }}>{i ? 'valid' : 'ok'}</text>
          </g>
        )
      })}

      {/* the terminal line and the title block */}
      <defs>
        <mask id='lib-typed' maskUnits='userSpaceOnUse'>
          <rect x={24 + 2 * CH} y={448} height={20} fill='#fff' style={typed(0.92, 0.975, COMMAND.length, CH)} />
        </mask>
      </defs>
      <g style={fade(0.9, 0.93)}>
        <text x={24} y={458} style={{ fill: 'hsl(var(--primary))' }}>$</text>
        <text x={24 + 2 * CH} y={458} mask='url(#lib-typed)' textLength={COMMAND.length * CH} lengthAdjust='spacing'>{COMMAND}</text>
        <rect x={24 + 2 * CH} y={451} width={CH} height={14} className='dg-solid' style={travel(0.92, 0.975, COMMAND.length * CH)} />
      </g>
      <g style={fade(0.975, 1)}>
        <text x={616} y={458} textAnchor='end' className='dg-small' style={{ fill: 'hsl(var(--primary))' }}>passed</text>
        <text x={548} y={458} textAnchor='end' className='dg-dim dg-small'>e2e · Playwright</text>
      </g>
      <g style={fade(0.94, 1)}>
        <rect x={24} y={478} width={592} height={30} className='dg-fill' />
        <Marks x={24} y={478} w={592} h={30} />
        <path d='M214 478V508M344 478V508M450 478V508M532 478V508' className='dg-edge' />
        <text x={36} y={493} style={{ fontFamily: 'var(--font-doto)', fontSize: 13, fontWeight: 800 }}>LIBRARY · CATALOG</text>
        {[[226, 'sheet', 'Fig 4 / 8'], [356, 'scale', '1:1'], [462, 'rev', 'A'], [544, 'view', 'exploded']].map(([x, key, value]) => (
          <g key={key}>
            <text x={x} y={486} className='dg-dim dg-small'>{key}</text>
            <text x={x} y={500} className='dg-small'>{value}</text>
          </g>
        ))}
      </g>
    </svg>
  )
}
