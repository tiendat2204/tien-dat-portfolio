import type { Ref } from 'react'

import { Dots, IsoFigure, Line, Solid } from '@/components/iso/kit/react/draw'
import { fadeLineSvg, translateAlong } from '@/components/iso/kit/iso-kit'
import { plateOffset, type Item, type Mark, type StackArt } from '@/components/iso/stack/geometry'
import { balloonAnchors, centerlines } from '@/components/iso/stack/sheet-parts'

// What the drawing shows at one moment: how far the stack is open, where the packet is, which board it lights
// (`plate`, -1 for none) and how far each balloon has drawn in (`lead` for its leader, `face` for its circle).
export type DrawingView = {
  explode: number
  packetY: number
  plate: number
  reveal: { lead: number, face: number }[]
}

// Live passes a ref callback per moving group (keyed `board<i>`, `packet`, `axis`, `balloon<k>`) and writes poses itself.
export type GroupRef = (key: string) => Ref<SVGGElement>

// The centerline's ramps: it fades in from the base and out past the top board instead of stopping on a bare face.
const AXIS_FADE: [number, number] = [10, 16]

function MarkView ({ mark, lit }: { mark: Mark, lit: boolean }) {
  if (mark.kind === 'solid') {
    const inner = mark.inner?.map((seam, index) => <Line key={index} d={seam.d} tone={seam.tone} />)
    return <Solid paths={mark.paths} tone={mark.tone} crease={mark.crease} className={mark.className} lit={lit && mark.className === 'stack-board'} inner={inner} />
  }
  if (mark.kind === 'line') return <Line d={mark.d} tone={mark.tone} free={mark.free} />
  if (mark.kind === 'dots') return <Dots points={mark.points} size={mark.size} tone={mark.tone} />
  return <path className='iso-halo' d={mark.d} />
}

function ItemView ({ item, lit = false }: { item: Item, lit?: boolean }) {
  return (
    <g data-part={item.name}>
      {item.marks.map((mark, index) => <MarkView key={index} mark={mark} lit={lit} />)}
    </g>
  )
}

const tenth = (value: number) => Math.round(value * 10) / 10

// The balloons are drawn where they sit on the open stack and moved with their board while it opens.
export function balloonMove (art: StackArt, plate: number, explode: number): string {
  return translateAlong(art.P, [0, 0, plateOffset(art.stack, plate, explode).z - plateOffset(art.stack, plate, 1).z])
}

// The centerline is drawn at its full length and grown from the base with the explode (centerlines() at any explode).
export function axisMove (art: StackArt, explode: number): string {
  const [{ x1, y1 }] = centerlines(art.stack, 1)
  const share = Math.min(1, Math.max(0, Number.isFinite(explode) ? explode : 0))
  return `translate(${tenth(x1)} ${tenth(y1)}) scale(1 ${share.toFixed(4)}) translate(${-tenth(x1)} ${-tenth(y1)})`
}

type DrawingProps = { art: StackArt, view: DrawingView, label: string, groupRef?: GroupRef }

// The exploded stack in painter's order, then the drawing language over it: the dashed centerline through the boards
// and one numbered balloon per board on a hairline leader that starts on the board (a dot) and ends under the balloon.
// The packet comes last: it rides the bus in front of the boards' corners, so it passes over the leaders' roots.
// Static passes one view; Live passes refs and moves the groups itself.
export function StackDrawing ({ art, view, label, groupRef }: DrawingProps) {
  const balloons = balloonAnchors(art.stack, 1)
  const packets = art.groups.filter(group => group.move === 'packet')
  const axis = centerlines(art.stack, 1).map(({ x1, y1, x2, y2 }) => fadeLineSvg([[x1, y1], [x2, y2]], { fade: AXIS_FADE, tone: 'mid', className: 'sheet-axis-line' })).join('')
  return (
    <IsoFigure width={art.width} height={art.height} label={label}>
      {art.groups.map((group) => {
        if (group.move === 'still') return <g key={group.key}>{group.items.map((item, index) => <ItemView key={index} item={item} />)}</g>
        if (group.move === 'packet') return null
        const active = group.plate === view.plate
        return (
          <g
            key={group.key}
            ref={groupRef?.(`board${group.plate}`)}
            className='stack-plate'
            data-active={active ? '' : undefined}
            transform={art.plateMove(group.plate, view.explode)}
          >
            {group.items.map((item, index) => <ItemView key={index} item={item} lit={active} />)}
            {group.top.map((item, index) => <ItemView key={index} item={item} />)}
          </g>
        )
      })}
      <g
        ref={groupRef?.('axis')}
        className='sheet-axis'
        transform={axisMove(art, view.explode)}
        opacity={view.explode > 0 ? undefined : 0}
        dangerouslySetInnerHTML={{ __html: axis }}
      />
      {balloons.map((balloon, k) => {
        const plate = art.count - 1 - k
        const reveal = view.reveal[k] ?? { lead: 1, face: 1 }
        return (
          <g
            key={balloon.n}
            ref={groupRef?.(`balloon${k}`)}
            className='sheet-balloon'
            data-active={plate === view.plate ? '' : undefined}
            transform={balloonMove(art, plate, view.explode)}
          >
            <path
              className='iso-line sheet-leader'
              data-tone='mid'
              d={`M${tenth(balloon.from[0])} ${tenth(balloon.from[1])} L${tenth(balloon.x)} ${tenth(balloon.y)}`}
              pathLength={1}
              strokeDashoffset={1 - reveal.lead}
              opacity={reveal.lead > 0 ? undefined : 0}
            />
            <circle className='sheet-leader-root' cx={tenth(balloon.from[0])} cy={tenth(balloon.from[1])} r={0.9} opacity={reveal.lead > 0 ? undefined : 0} />
            <g transform={`translate(${tenth(balloon.x)} ${tenth(balloon.y)})`}>
              <g className='sheet-balloon-face' opacity={reveal.face > 0 ? reveal.face.toFixed(2) : 0}>
                <circle r={6.5} />
                <text textAnchor='middle' dominantBaseline='central'>{balloon.n}</text>
              </g>
            </g>
          </g>
        )
      })}
      {packets.map(group => (
        <g key={group.key} ref={groupRef?.('packet')} transform={art.packetMove(view.packetY, view.explode)}>
          {group.items.map((item, index) => <ItemView key={index} item={item} />)}
        </g>
      ))}
    </IsoFigure>
  )
}
