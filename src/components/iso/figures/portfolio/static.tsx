import type { Ref } from 'react'

import { INK_FULL, HEIGHT, PARTS, WIDTH, movesOf, type Item, type Mark, type Move } from '@/components/iso/figures/portfolio/geometry'
import { poseOf, portfolioModel } from '@/components/iso/figures/portfolio/model'
import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'

import '@/components/iso/figures/portfolio/portfolio.css'

export const LABEL =
  'A drafting plotter on a heavy base: a gantry rides two railed tracks across a sheet clamped to the bed, a pen head runs along the gantry on a lead screw, and the pen drafts a web page wireframe (header, hero, three cards and footer). A stepper and belt drive the gantry, a second stepper turns the lead screw, and a rack beside the bed holds three spare pens.'

// The settled pose: the whole sheet drafted, the pen lifted and the gantry parked off the sheet.
export const SETTLED = poseOf({ ...portfolioModel.init(), draft: 1 })
export const SETTLED_MOVES = movesOf(SETTLED.at, SETTLED.lift, SETTLED.nudge)
export const SETTLED_READOUT = portfolioModel.readout({ ...portfolioModel.init(), draft: 1 })

function MarkView ({ mark }: { mark: Mark }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} lit={mark.lit} flat={mark.flat} className={mark.className} inner={inner} />
  }
  if (mark.kind === 'line') return <Line d={mark.d} tone={mark.tone} free={mark.free} />
  if (mark.kind === 'dots') return <Dots points={mark.points} size={mark.size} tone={mark.tone} />
  if (mark.kind === 'halo') return <path className='iso-halo' d={mark.d} />
  return (
    <g className='tb'>
      <path className='tb-body' d={mark.body} />
      {mark.wide && <path className='tb-shine' d={mark.shine} />}
      {mark.wide && <path className='tb-shade' d={mark.shade} />}
      <path className='iso-line tb-edge' data-tone={mark.tone} d={mark.edges} />
    </g>
  )
}

function ItemView ({ item }: { item: Item }) {
  return (
    <g data-part={item.name}>
      {item.marks.map((mark, index) => <MarkView key={index} mark={mark} />)}
    </g>
  )
}

type Moves = Record<Exclude<Move, 'still'>, string>

type DrawingProps = {
  moves: Moves
  ink: string[]
  slotRef?: (move: Exclude<Move, 'still'>) => Ref<SVGGElement>
  inkRef?: (index: number) => Ref<SVGPathElement>
}

// The whole plotter in painter's order. Static passes the settled pose; Live passes refs and writes poses itself.
export function PlotterDrawing ({ moves, ink, slotRef, inkRef }: DrawingProps) {
  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
      {PARTS.map((slot) => {
        if (slot.move === 'ink') {
          return (
            <g key='ink' className='plotter-ink'>
              {ink.map((d, index) => <path key={index} ref={inkRef?.(index)} className='iso-line' data-tone='hi' data-free='' d={d} />)}
            </g>
          )
        }
        const items = slot.items.map((part, index) => <ItemView key={index} item={part} />)
        if (slot.move === 'still') return <g key={slot.key}>{items}</g>
        return (
          <g key={slot.key} ref={slotRef?.(slot.move)} data-move={slot.move} transform={moves[slot.move]}>
            {items}
          </g>
        )
      })}
    </IsoFigure>
  )
}

// Reduced motion: the finished sheet with the gantry parked. No hooks, safe to render anywhere.
export function PortfolioStatic () {
  return <PlotterDrawing moves={SETTLED_MOVES} ink={INK_FULL} />
}
