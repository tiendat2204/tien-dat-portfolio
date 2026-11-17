import type { Ref } from 'react'

import { flapPaths, HEIGHT, movesOf, PARTS, WIDTH, type Item, type Mark } from '@/components/iso/figures/eoffice/geometry'
import { eofficeModel, poseOf } from '@/components/iso/figures/eoffice/model'
import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'
import type { SolidPaths } from '@/components/iso/kit/iso-kit'

import '@/components/iso/figures/eoffice/eoffice.css'

const LABEL =
  'A document routing sorter on a bench base: a sheet from the in-tray rides a belt between two side rails past three stamp stations, draft, review and approved. Each station has a press column with a carriage, an arm and a stamp head, an ink pad and a status lamp, and a flap gate after it that swings up only once that station has stamped the sheet. Approved sheets collect in an out-tray under a clip; a control box at the back feeds two leads to the stations.'

const SETTLED_STATE = { ...eofficeModel.init(), travel: 1 }

// The settled pose: the sheet in the out-tray with all three stamps on it, every gate up, every press lifted.
const SETTLED = poseOf(SETTLED_STATE)
export const SETTLED_READOUT = eofficeModel.readout(SETTLED_STATE)

type Moves = ReturnType<typeof movesOf>

// A flap's paths by the `data-key` each carries, so the live loop can rewrite them in place.
export type FlapKey = 'fill' | 'shade0' | 'shade1' | 'shade2' | 'shade3' | 'top' | 'crease' | 'outline'

export function flapDs (paths: SolidPaths): Record<FlapKey, string> {
  return {
    fill: paths.fill,
    shade0: paths.shades[0],
    shade1: paths.shades[1],
    shade2: paths.shades[2],
    shade3: paths.shades[3],
    top: paths.top,
    crease: paths.crease,
    outline: paths.outline,
  }
}

// A gate flap: the kit's solid markup with every path always present, so a swing only rewrites `d` attributes.
function FlapView ({ index, open, flapRef }: { index: number, open: number, flapRef?: Ref<SVGGElement> }) {
  const d = flapDs(flapPaths(index, open))
  return (
    <g ref={flapRef} className='iso-solid' data-part={`gate.${index}.flap`}>
      <path className='iso-fill' data-key='fill' d={d.fill} />
      {([0, 1, 2, 3] as const).map(shade => <path key={shade} className='iso-shade' data-shade={shade} data-key={`shade${shade}`} d={d[`shade${shade}`]} />)}
      <path className='iso-top' data-key='top' d={d.top} />
      <path className='iso-line iso-crease' data-tone='faint' data-key='crease' d={d.crease} />
      <path className='iso-line iso-edge' data-tone='mid' data-key='outline' d={d.outline} />
    </g>
  )
}

function MarkView ({ mark, stamps, stampRef }: { mark: Mark, stamps: boolean[], stampRef?: (index: number) => Ref<SVGPathElement> }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} lit={mark.lit} className={mark.className} inner={inner} />
  }
  if (mark.kind === 'line') return <Line d={mark.d} tone={mark.tone} free={mark.free} />
  if (mark.kind === 'stamp') return <path ref={stampRef?.(mark.index)} className='iso-line sorter-stamp' data-tone='hi' d={stamps[mark.index] ? mark.d : ''} />
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

function ItemView ({ item, stamps, stampRef }: { item: Item, stamps: boolean[], stampRef?: (index: number) => Ref<SVGPathElement> }) {
  return (
    <g data-part={item.name}>
      {item.marks.map((mark, index) => <MarkView key={index} mark={mark} stamps={stamps} stampRef={stampRef} />)}
    </g>
  )
}

type DrawingProps = {
  moves: Moves
  stamps: boolean[]
  flaps: number[]
  sheetRef?: Ref<SVGGElement>
  pressRef?: (index: number) => Ref<SVGGElement>
  flapRef?: (index: number) => Ref<SVGGElement>
  stampRef?: (index: number) => Ref<SVGPathElement>
}

// The whole sorter in painter's order. Static passes the settled pose; Live passes refs and writes poses itself.
export function SorterDrawing ({ moves, stamps, flaps, sheetRef, pressRef, flapRef, stampRef }: DrawingProps) {
  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
      {PARTS.map((slot) => {
        if (slot.move === 'flap') return <FlapView key={slot.key} index={slot.index} open={flaps[slot.index]} flapRef={flapRef?.(slot.index)} />
        const items = slot.items.map((part, index) => <ItemView key={index} item={part} stamps={stamps} stampRef={stampRef} />)
        if (slot.move === 'still') return <g key={slot.key}>{items}</g>
        if (slot.move === 'sheet') return <g key={slot.key} ref={sheetRef} data-move='sheet' transform={moves.sheet}>{items}</g>
        return <g key={slot.key} ref={pressRef?.(slot.index)} data-move='press' transform={moves.press[slot.index]}>{items}</g>
      })}
    </IsoFigure>
  )
}

// Reduced motion: the routed sheet in the out-tray. No hooks, safe to render anywhere.
export function EofficeStatic () {
  return <SorterDrawing moves={movesOf(SETTLED.x, SETTLED.lift)} stamps={SETTLED.stamped} flaps={SETTLED.gates} />
}
