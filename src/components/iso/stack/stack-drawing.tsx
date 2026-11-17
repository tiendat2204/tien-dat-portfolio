import type { CSSProperties, Ref } from 'react'

import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'
import type { Item, Mark, StackArt } from '@/components/iso/stack/geometry'
import type { StackLayer } from '@/components/iso/stack/types'

// The view of one moment: what the drawing and the chips show. Built by `viewAt` from the pure engine.
export type StackView = {
  explode: number
  packetY: number
  // The config's layer index under the packet (0 is the top board) and whether the scan sweeps it now.
  layer: number
  scan: boolean
  sweep: number
}

// Live passes a ref callback per moving group (keyed `board<i>`, `scan<i>`, `packet`) and writes poses itself.
export type GroupRef = (key: string) => Ref<SVGGElement>

function MarkView ({ mark, lit }: { mark: Mark, lit: boolean }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} className={mark.className} lit={lit && mark.className === 'stack-board'} inner={inner} />
  }
  if (mark.kind === 'line') return <Line d={mark.d} tone={mark.tone} free={mark.free} />
  if (mark.kind === 'dots') return <Dots points={mark.points} size={mark.size} tone={mark.tone} />
  if (mark.kind === 'beam') return <path className='stack-beam' d={mark.d} />
  return <path className='iso-halo' d={mark.d} />
}

function ItemView ({ item, lit = false }: { item: Item, lit?: boolean }) {
  return (
    <g data-part={item.name}>
      {item.marks.map((mark, index) => <MarkView key={index} mark={mark} lit={lit} />)}
    </g>
  )
}

type DrawingProps = { art: StackArt, view: StackView, label: string, groupRef?: GroupRef }

// The plate stack in painter's order. Static passes one view; Live passes refs and moves the groups itself.
export function StackDrawing ({ art, view, label, groupRef }: DrawingProps) {
  const activePlate = art.count - 1 - view.layer
  return (
    <IsoFigure width={art.width} height={art.height} label={label}>
      {art.groups.map((group) => {
        if (group.move === 'still') return <g key={group.key}>{group.items.map((item, index) => <ItemView key={index} item={item} />)}</g>
        if (group.move === 'packet') {
          return (
            <g key={group.key} ref={groupRef?.('packet')} transform={art.packetMove(view.packetY, view.explode)}>
              {group.items.map((item, index) => <ItemView key={index} item={item} />)}
            </g>
          )
        }
        const active = group.plate === activePlate
        return (
          <g
            key={group.key}
            ref={groupRef?.(`board${group.plate}`)}
            className='stack-plate'
            data-active={active ? '' : undefined}
            transform={art.plateMove(group.plate, view.explode)}
          >
            {group.items.map((item, index) => <ItemView key={index} item={item} lit={active} />)}
            <g ref={groupRef?.(`scan${group.plate}`)} className='stack-scan' transform={art.scanMove(view.sweep)} opacity={active && view.scan ? undefined : 0}>
              {group.scan.map((item, index) => <ItemView key={index} item={item} />)}
            </g>
            {group.top.map((item, index) => <ItemView key={index} item={item} />)}
          </g>
        )
      })}
    </IsoFigure>
  )
}

function TechChip ({ name }: { name: string }) {
  return <span className='stack-tech'>{name}</span>
}

function LayerChip ({ layer, active, y, dim }: { layer: StackLayer, active: boolean, y: number, dim?: boolean }) {
  return (
    <li
      className='stack-chip'
      data-layer={layer.id}
      data-active={active ? '' : undefined}
      data-dim={dim ? '' : undefined}
      style={{ '--y': y.toFixed(4) } as CSSProperties}
      title={[layer.label, ...layer.tech].join(' · ')}
    >
      <span aria-hidden='true' className='stack-chip-tick' />
      {layer.icon && (
        // eslint-disable-next-line @next/next/no-img-element -- tiny decorative skill icon, no optimisation needed
        <img className='stack-chip-icon' src={`/icons/skills/${layer.icon}`} alt='' width={12} height={12} loading='lazy' />
      )}
      <span className='stack-chip-label'>{layer.label}</span>
      <span className='stack-chip-tech'>
        {layer.tech.map(name => <TechChip key={name} name={name} />)}
      </span>
    </li>
  )
}

type ChipsProps = { art: StackArt, layers: StackLayer[], side: StackLayer[], view: StackView }

// DOM labels beside the drawing, one per board at its open height, then the side modules. Below `sm` they fall back
// to a plain list under the drawing (stack.css).
export function StackChips ({ art, layers, side, view }: ChipsProps) {
  return (
    <div className='stack-chips' style={{ opacity: chipOpacity(view.explode) } as CSSProperties}>
      <ol className='stack-chip-list' aria-label='Layers, top to bottom'>
        {layers.map((layer, k) => (
          <LayerChip key={layer.id} layer={layer} active={k === view.layer} y={art.chipShare(art.count - 1 - k)} />
        ))}
      </ol>
      {side.length > 0 && (
        <ul className='stack-chip-side' aria-label='Side modules'>
          {side.map(layer => <LayerChip key={layer.id} layer={layer} active={false} y={1} dim />)}
        </ul>
      )}
    </div>
  )
}

// The chips sit at the open stack's heights, so they fade in as the stack opens instead of floating off the boards.
export function chipOpacity (explode: number): string {
  const share = Number.isFinite(explode) ? Math.min(1, Math.max(0, explode)) : 0
  return (0.3 + 0.7 * share).toFixed(2)
}
