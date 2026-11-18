import type { CSSProperties } from 'react'

import type { StackConfig } from '@/components/iso/stack/types'
import { diagramLayout, LEFT_BUS_X, VIEW_H, VIEW_W } from '@/components/projects/stack-diagram-layout'

import '@/components/projects/stack-diagram.css'

const delay = (step: number): CSSProperties => ({ '--d': `${step * 70}ms` } as CSSProperties)

// The small figure of a project card: its real stack as a node diagram (layers on the left bus, side modules on the
// right bus) with a packet running down. Pure SVG from the project's stack config; the card's reveal toggles `data-in`.
export function StackDiagram ({ config }: { config: StackConfig }) {
  const layout = diagramLayout(config)
  const { nodes, chips, leftBus, rightBus } = layout
  const midY = (leftBus.y1 + leftBus.y2) / 2
  const label = `${config.title}: ${nodes.map(node => node.label).join(', ')}${chips.length > 0 ? `, with ${chips.map(chip => chip.label).join(', ')}` : ''}`
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role='img' aria-label={label} className='stack-diagram'>
      <text x={12} y={22} className='sd-meta'>{layout.meta}</text>
      <path d={`M${leftBus.x} ${leftBus.y1}V${leftBus.y2}`} pathLength={1} className='sd-line' />
      {nodes.map((node, i) => (
        <g key={node.key} className='sd-node' style={delay(i + 1)}>
          <path d={`M${LEFT_BUS_X} ${node.y + node.h / 2}H${node.x}`} className='sd-tick' />
          <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={4} className='sd-box' />
          <text x={node.x + 10} y={node.y + node.h / 2} className='sd-index'>{node.index}</text>
          <text x={node.x + 32} y={node.y + node.h / 2} className='sd-label'>{node.label}</text>
          <text x={node.x + node.w - 10} y={node.y + node.h / 2} textAnchor='end' className='sd-tech'>{node.tech}</text>
        </g>
      ))}
      {rightBus && (
        <>
          <path d={`M${nodes[0].x + nodes[0].w} ${midY}H${rightBus.x}`} className='sd-tick' />
          <path d={`M${rightBus.x} ${Math.min(rightBus.y1, midY)}V${Math.max(rightBus.y2, midY)}`} pathLength={1} className='sd-line' />
          {chips.map((chip, i) => (
            <g key={chip.key} className='sd-node' style={delay(nodes.length + i + 1)}>
              <path d={`M${rightBus.x} ${chip.y + chip.h / 2}H${chip.x}`} className='sd-tick' />
              <rect x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={chip.h / 2} className='sd-chip' />
              <text x={chip.x + chip.w / 2} y={chip.y + chip.h / 2} textAnchor='middle' className='sd-label'>{chip.label}</text>
            </g>
          ))}
        </>
      )}
      <circle cx={leftBus.x} cy={leftBus.y1} r={3.5} className='sd-packet' style={{ '--travel': `${layout.travel}px` } as CSSProperties} />
    </svg>
  )
}
