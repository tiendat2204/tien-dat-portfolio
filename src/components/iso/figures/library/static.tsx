import type { Ref } from 'react'

import { cardOf, HEIGHT, hookOf, movesOf, PARTS, WIDTH, type CardDraw, type CardSlot, type HookDraw, type HookSlot, type Item, type Mark, type Move } from '@/components/iso/figures/library/geometry'
import { cardAt, drawerOpen, hookAt, libraryModel, stampPress, type LibraryState } from '@/components/iso/figures/library/model'
import type { SolidPaths } from '@/components/iso/kit/iso-kit'
import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'

import '@/components/iso/figures/library/library.css'

const LABEL =
  'A library card catalog beside a loan desk, on a base plate on feet. The cabinet has three columns of drawers, each with a pull and a label holder; the middle top drawer slides out on two rails, and a hook on a hoist cable, hung from a trolley that runs along an overhead beam, lifts a catalog card out of it and carries it to the desk, where a date stamp on a carriage presses it to record the loan. The desk also holds an ink pad and a key-card reader with a status lamp, wired to a terminal block; a short stack of books with a ribbon lies on the cabinet.'

type Moving = Exclude<Move, 'still'>
export type Moves = Record<Moving, string>
export type CardKey = CardSlot['key']
export type HookKey = HookSlot['key']

// The card's paths in a fixed order, so the live loop writes the same elements every frame.
export const CARD_PATHS = ['fill', 'shade0', 'shade1', 'shade2', 'shade3', 'top', 'crease', 'outline', 'rules', 'hole', 'mark', 'date'] as const
type CardPaths = Record<(typeof CARD_PATHS)[number], string>

const NO_CARD: CardPaths = Object.fromEntries(CARD_PATHS.map(name => [name, ''])) as CardPaths

// The hook's paths in a fixed order: the clip, its pin and the cable.
export const HOOK_PATHS = ['clipFill', 'clipShade0', 'clipShade1', 'clipShade2', 'clipShade3', 'clipTop', 'clipCrease', 'clipOutline', 'pin', 'cableFill', 'cableShade0', 'cableShade1', 'cableShade2', 'cableShade3', 'cableTop', 'cableOutline'] as const
type HookPaths = Record<(typeof HOOK_PATHS)[number], string>

const NO_SOLID: SolidPaths = { fill: '', shades: [], top: '', crease: '', outline: '' }

// The hook's paths in one of its slots: the clip and its pin when the hook is in that slot, and the cable's length
// that slot draws (the low slot the length below the cabinet top, the high slot the rest).
function hookPathsOf ({ clip: solid, pin: ring, low, high }: HookDraw, slot: HookKey, clear: boolean): HookPaths {
  const own = (slot === 'hook.high') === clear
  const clip = own ? solid : NO_SOLID
  const pin = own ? ring : ''
  const cable = (slot === 'hook.high' ? high : low) ?? NO_SOLID
  return {
    clipFill: clip.fill,
    clipShade0: clip.shades[0] ?? '',
    clipShade1: clip.shades[1] ?? '',
    clipShade2: clip.shades[2] ?? '',
    clipShade3: clip.shades[3] ?? '',
    clipTop: clip.top,
    clipCrease: clip.crease,
    clipOutline: clip.outline,
    pin,
    cableFill: cable.fill,
    cableShade0: cable.shades[0] ?? '',
    cableShade1: cable.shades[1] ?? '',
    cableShade2: cable.shades[2] ?? '',
    cableShade3: cable.shades[3] ?? '',
    cableTop: cable.top,
    cableOutline: cable.outline,
  }
}

function cardPathsOf (draw: CardDraw): CardPaths {
  const { paths } = draw
  return {
    fill: paths.fill,
    shade0: paths.shades[0] ?? '',
    shade1: paths.shades[1] ?? '',
    shade2: paths.shades[2] ?? '',
    shade3: paths.shades[3] ?? '',
    top: paths.top,
    crease: paths.crease,
    outline: paths.outline,
    rules: draw.rules,
    hole: draw.hole,
    mark: draw.mark,
    date: draw.date,
  }
}

// Everything the drawing needs from a state: the slot transforms and the card's and the hook's paths in their slots.
export function poseOf (state: LibraryState) {
  const card = cardAt(state.flow)
  const hook = hookAt(state.flow)
  const paths = cardPathsOf(cardOf(card, state.recorded))
  const hooked = hookOf(hook.at, hook.clear)
  return {
    moves: movesOf(drawerOpen(state.flow), state.peek, stampPress(state.flow), hook.at[0]),
    cards: { 'card.low': card.clear ? NO_CARD : paths, 'card.high': card.clear ? paths : NO_CARD } satisfies Record<CardKey, CardPaths>,
    hooks: { 'hook.low': hookPathsOf(hooked, 'hook.low', hook.clear), 'hook.high': hookPathsOf(hooked, 'hook.high', hook.clear) } satisfies Record<HookKey, HookPaths>,
  }
}

// The settled pose: the drawer out, the card lying stamped on the desk, the stamp and the hook lifted, the loan recorded.
const SETTLED_STATE: LibraryState = { flow: 1, peek: 0, recorded: true }
const SETTLED = poseOf(SETTLED_STATE)
export const SETTLED_READOUT = libraryModel.readout(SETTLED_STATE)

function MarkView ({ mark }: { mark: Mark }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} lit={mark.lit} flat={mark.flat} inner={inner} />
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

type PathRef = (name: (typeof CARD_PATHS)[number]) => Ref<SVGPathElement>
type HookRef = (name: (typeof HOOK_PATHS)[number]) => Ref<SVGPathElement>

// The catalog card: the one lit part. Its paths are always present; a slot the card is not in has them all empty.
function CardView ({ paths, pathRef }: { paths: CardPaths, pathRef?: PathRef }) {
  const shade = (index: 0 | 1 | 2 | 3) => (
    <path ref={pathRef?.(`shade${index}`)} className='iso-shade' data-shade={index} d={paths[`shade${index}`]} />
  )
  return (
    <g data-part='card'>
      <g className='iso-solid' data-lit=''>
        <path ref={pathRef?.('fill')} className='iso-fill' d={paths.fill} />
        {shade(0)}
        {shade(1)}
        {shade(2)}
        {shade(3)}
        <path ref={pathRef?.('top')} className='iso-top' d={paths.top} />
        <path ref={pathRef?.('crease')} className='iso-line iso-crease' data-tone='lo' d={paths.crease} />
        <path ref={pathRef?.('outline')} className='iso-line iso-edge' data-tone='hi' d={paths.outline} />
      </g>
      <path ref={pathRef?.('rules')} className='iso-line' data-tone='lo' data-free='' d={paths.rules} />
      <path ref={pathRef?.('hole')} className='iso-line' data-tone='lo' d={paths.hole} />
      <path ref={pathRef?.('mark')} className='iso-line' data-tone='hi' d={paths.mark} />
      <path ref={pathRef?.('date')} className='iso-line' data-tone='hi' data-free='' d={paths.date} />
    </g>
  )
}

// The hoist's hook: a clip beside the card's far end, its pin, and its length of the cable up to the trolley. Like the
// card, its paths are always present, and empty where that slot draws nothing.
function HookView ({ paths, pathRef }: { paths: HookPaths, pathRef?: HookRef }) {
  const solid = (part: 'clip' | 'cable', crease: boolean) => (
    <g className='iso-solid'>
      <path ref={pathRef?.(`${part}Fill`)} className='iso-fill' d={paths[`${part}Fill`]} />
      {([0, 1, 2, 3] as const).map(index => (
        <path key={index} ref={pathRef?.(`${part}Shade${index}`)} className='iso-shade' data-shade={index} d={paths[`${part}Shade${index}`]} />
      ))}
      <path ref={pathRef?.(`${part}Top`)} className='iso-top' d={paths[`${part}Top`]} />
      {crease && <path ref={pathRef?.('clipCrease')} className='iso-line iso-crease' data-tone='faint' d={paths.clipCrease} />}
      <path ref={pathRef?.(`${part}Outline`)} className='iso-line iso-edge' data-tone='mid' d={paths[`${part}Outline`]} />
    </g>
  )
  return (
    <g data-part='hook'>
      {solid('clip', true)}
      <path ref={pathRef?.('pin')} className='iso-line' data-tone='lo' d={paths.pin} />
      {solid('cable', false)}
    </g>
  )
}

type DrawingProps = {
  moves: Moves
  cards: Record<CardKey, CardPaths>
  hooks: Record<HookKey, HookPaths>
  slotRef?: (move: Moving) => Ref<SVGGElement>
  cardRef?: (key: CardKey) => PathRef
  hookRef?: (key: HookKey) => HookRef
}

// The whole catalog in painter's order. Static passes the settled pose; Live passes refs and writes poses itself.
export function CatalogDrawing ({ moves, cards, hooks, slotRef, cardRef, hookRef }: DrawingProps) {
  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label={LABEL}>
      {PARTS.map((slot) => {
        if (slot.move === 'card') return <CardView key={slot.key} paths={cards[slot.key]} pathRef={cardRef?.(slot.key)} />
        if (slot.move === 'hook') return <HookView key={slot.key} paths={hooks[slot.key]} pathRef={hookRef?.(slot.key)} />
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

// Reduced motion: the loan recorded and the card on the desk. No hooks, safe to render anywhere.
export function LibraryStatic () {
  return <CatalogDrawing moves={SETTLED.moves} cards={SETTLED.cards} hooks={SETTLED.hooks} />
}
