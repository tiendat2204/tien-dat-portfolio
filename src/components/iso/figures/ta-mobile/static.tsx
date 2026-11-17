import type { Ref } from 'react'

import { HEIGHT, PARTS, WIDTH, movesOf, type Item, type Mark, type Move } from '@/components/iso/figures/ta-mobile/geometry'
import { poseOf, SETTLED_STATE, taMobileModel } from '@/components/iso/figures/ta-mobile/model'
import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'

import '@/components/iso/figures/ta-mobile/ta-mobile.css'

export const LABEL =
  'A field journal station on a heavy base: a rugged handheld logger with a camera stands in a cradle with its stylus, a stamp press prints a photo mark on a journal card, the card drops into a slotted outbox, and a belt carries it to a bin in front of a server rack once the uplink mast beside the outbox has a signal. A plot tray with crop pegs and a weather vane stand at the front.'

// The settled pose: the card stamped, synced and resting in the rack bin, the outbox empty, the signal up.
const SETTLED = poseOf(SETTLED_STATE)
const SETTLED_MOVES = movesOf(SETTLED)
export const SETTLED_READOUT = taMobileModel.readout(SETTLED_STATE)

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

type Moving = Exclude<Move, 'still'>

type DrawingProps = {
  moves: Record<Moving, string>
  stamped: boolean
  slotRef?: (move: Moving) => Ref<SVGGElement>
}

// The whole station in painter's order. Static passes the settled pose; Live passes refs and writes poses itself.
export function StationDrawing ({ moves, stamped, slotRef }: DrawingProps) {
  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
      {PARTS.map((slot) => {
        const items = slot.items.map((part, index) => <ItemView key={index} item={part} />)
        if (slot.move === 'still') return <g key={slot.key}>{items}</g>
        return (
          <g
            key={slot.key}
            ref={slotRef?.(slot.move)}
            data-move={slot.move}
            transform={moves[slot.move]}
            visibility={slot.move === 'mark' && !stamped ? 'hidden' : undefined}
          >
            {items}
          </g>
        )
      })}
    </IsoFigure>
  )
}

// Reduced motion: the card synced into the rack bin. No hooks, safe to render anywhere.
export function TaMobileStatic () {
  return <StationDrawing moves={SETTLED_MOVES} stamped />
}
