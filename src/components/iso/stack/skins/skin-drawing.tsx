'use client'

import { useEffect, useMemo, useRef } from 'react'

import { skinPaths, skinViewBox } from '@/components/iso/stack/skins/index'
import type { SkinKind } from '@/components/iso/stack/skins/index'
import '@/components/iso/stack/skins/skin.css'

// The share of path `index` (of `count`) drawn at `draw` 0..1: each path draws over its own equal slice, in order.
function drawn (draw: number, index: number, count: number): number {
  const value = Number.isFinite(draw) ? draw * count - index : 0
  return Math.min(1, Math.max(0, value))
}

// The line-art skin: hairline wireframe paths that draw themselves in as `draw` goes 0 to 1.
// The hairline is kept by dividing the stroke width by the rendered scale (`--skin-k`) rather than by
// `vector-effect: non-scaling-stroke`, which makes Chrome lay `pathLength` dashes out in screen space (at 2x every path
// would stop half drawn).
export function SkinDrawing ({ kind, draw }: { kind: SkinKind, draw: number }) {
  const paths = useMemo(() => skinPaths(kind), [kind])
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || typeof ResizeObserver === 'undefined') return
    const measure = (): void => {
      const width = svg.getBoundingClientRect().width
      if (width > 0) svg.style.setProperty('--skin-k', String(width / skinViewBox[2]))
    }
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    measure()
    return () => observer.disconnect()
  }, [])

  return (
    <svg ref={svgRef} className='skin-svg' viewBox={skinViewBox.join(' ')} aria-hidden='true' focusable='false' data-skin={kind}>
      {paths.map((d, index) => {
        const share = drawn(draw, index, paths.length)
        return (
          <path
            key={index}
            className='skin-line'
            d={d}
            pathLength={1}
            strokeDashoffset={1 - share}
            opacity={share > 0 ? undefined : 0}
          />
        )
      })}
    </svg>
  )
}
