import type { Ref } from 'react'

import { HEIGHT, PARTS, WIDTH, movesOf, turnPaths, type Item, type Mark, type Move, type Turning } from '@/components/iso/figures/betatruyen/geometry'
import { betatruyenModel, poseOf, type BetatruyenState } from '@/components/iso/figures/betatruyen/model'
import type { SolidPaths, Tone } from '@/components/iso/kit/iso-kit'
import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'

import '@/components/iso/figures/betatruyen/betatruyen.css'

export const LABEL =
  'A story forum desk on a heavy base: a lectern holds an open book whose page turns, with a bookmark ribbon over its ledge; a cork comment board on two posts takes a new comment card through a slot box and pins it; a beam balance tips as a rating is added; a ranking rack of four books on slider rails lifts the story one place by a lever on its side; a small drawer cabinet keeps the index of main characters, its dial turning as the page is read.'

const SETTLED_STATE: BetatruyenState = { ...betatruyenModel.init(), run: 1 }
const SETTLED_POSE = poseOf(SETTLED_STATE)
export const SETTLED_READOUT = betatruyenModel.readout(SETTLED_STATE)

export type Moving = Exclude<Move, 'still'>
export type Moves = Record<Moving, string>
type Turns = Record<Turning, SolidPaths>

function MarkView ({ mark }: { mark: Mark }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} lit={mark.lit} inner={inner} />
  }
  if (mark.kind === 'line') return <Line d={mark.d} tone={mark.tone} free={mark.free} />
  if (mark.kind === 'dots') return <Dots points={mark.points} size={mark.size} tone={mark.tone} />
  return <path className='iso-halo' d={mark.d} />
}

function ItemView ({ item }: { item: Item }) {
  return (
    <g data-part={item.name}>
      {item.marks.map((mark, index) => <MarkView key={index} mark={mark} />)}
    </g>
  )
}

// A solid whose shape is rebuilt each frame: every path is always present, so the live loop only rewrites `d`.
// Order of the children: fill, four shades, top, crease, edge.
function TurningSolid ({ name, paths, tone, solidRef }: { name: string, paths: SolidPaths, tone: Tone, solidRef?: Ref<SVGGElement> }) {
  return (
    <g ref={solidRef} className='iso-solid' data-part={name}>
      <path className='iso-fill' d={paths.fill} />
      {[0, 1, 2, 3].map(shade => <path key={shade} className='iso-shade' data-shade={shade} d={paths.shades[shade] ?? ''} />)}
      <path className='iso-top' d={paths.top} />
      <path className='iso-line iso-crease' data-tone='faint' d={paths.crease ?? ''} />
      <path className='iso-line iso-edge' data-tone={tone} d={paths.outline} />
    </g>
  )
}

type DrawingProps = {
  moves: Moves
  turns: Turns
  slotRef?: (move: Moving) => Ref<SVGGElement>
  turnRef?: (key: Turning) => Ref<SVGGElement>
}

// The whole desk in painter's order. Static passes the settled pose; Live passes refs and writes poses itself.
export function DeskDrawing ({ moves, turns, slotRef, turnRef }: DrawingProps) {
  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
      {PARTS.map((slot) => {
        if (slot.move === 'turn') return <TurningSolid key={slot.key} name={slot.name} paths={turns[slot.key]} tone={slot.tone} solidRef={turnRef?.(slot.key)} />
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

// Reduced motion: the comment pinned and the story ranked up. No hooks, safe to render anywhere.
export function BetatruyenStatic () {
  return <DeskDrawing moves={movesOf(SETTLED_POSE)} turns={turnPaths(SETTLED_POSE)} />
}
