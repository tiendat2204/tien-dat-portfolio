import type { Ref } from 'react'

import { HEIGHT, PARTS, WIDTH, movesOf, type Item, type Mark, type Show } from '@/components/iso/figures/agrita/geometry'
import { agritaModel, poseOf } from '@/components/iso/figures/agrita/model'
import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'

import '@/components/iso/figures/agrita/agrita.css'

const LABEL =
  'A traceability line on a bench: a harvest-lot crate rides a belt conveyor from a plot tray and a crop bed, under a recording arch with a status lamp, past a three-slot warehouse shelf, to the parcel stage. There a label printer, fed from a roll and wired to the arch, stamps a QR label onto the lid of the recorded lot. A drive motor with its lead to a control box, a market parcel and a label plate sit on the base.'

// The settled pose: the lot docked at the parcel stage, recorded, its QR label stamped and the pad back up.
const SETTLED_STATE = { ...agritaModel.init(), run: 1 }
const SETTLED = poseOf(SETTLED_STATE)
export const SETTLED_READOUT = agritaModel.readout(SETTLED_STATE)

type Moves = ReturnType<typeof movesOf>
export type Shown = Record<Show, boolean>

const SETTLED_MOVES = movesOf(SETTLED.x, SETTLED.press)
const SETTLED_SHOWN: Shown = { label: SETTLED.label, lamp: SETTLED.recorded }

function MarkView ({ mark }: { mark: Mark }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} lit={mark.lit} inner={inner} />
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

type DrawingProps = {
  moves: Moves
  shown: Shown
  // Live passes refs for every moving or fading slot, keyed by the slot's key, and writes their poses itself.
  slotRef?: (key: string) => Ref<SVGGElement>
}

// The whole line in painter's order. Static passes the settled pose; Live passes refs and writes poses itself.
export function LineDrawing ({ moves, shown, slotRef }: DrawingProps) {
  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
      {PARTS.map((slot) => {
        const items = slot.items.map((part, index) => <ItemView key={index} item={part} />)
        if (slot.move === 'still' && !slot.show) return <g key={slot.key}>{items}</g>
        return (
          <g
            key={slot.key}
            ref={slotRef?.(slot.key)}
            data-move={slot.move}
            data-show={slot.show}
            transform={slot.move === 'still' ? undefined : moves[slot.move]}
            opacity={slot.show && !shown[slot.show] ? 0 : undefined}
          >
            {items}
          </g>
        )
      })}
    </IsoFigure>
  )
}

// Reduced motion: the lot docked and labelled. No hooks, safe to render anywhere.
export function AgritaStatic () {
  return <LineDrawing moves={SETTLED_MOVES} shown={SETTLED_SHOWN} />
}
