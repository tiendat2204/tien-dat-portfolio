'use client'

import { useLayoutEffect, useMemo, useRef, type Ref } from 'react'

import { skinPaths, skinShare, skinViewBox } from '@/components/iso/stack/skins/index'
import type { SkinKind } from '@/components/iso/stack/types'
import '@/components/iso/stack/skins/skin.css'

type SkinProps = {
  kind: SkinKind
  // 0..1: how much of the skin is drawn on the first render. A live caller then writes each path's
  // `stroke-dashoffset` itself through `pathRef` with the same slice (`skinShare`), without re-rendering.
  draw: number
  pathRef?: (index: number) => Ref<SVGPathElement>
}

// The line-art skin: hairline wireframe paths that draw themselves in as `draw` goes 0 to 1. The svg fills its box
// (`meet`), and the hairline is kept by dividing the stroke width by the rendered scale (`--skin-k`, measured before
// the first paint) rather than by `vector-effect: non-scaling-stroke`, which makes Chrome lay `pathLength` dashes out
// in screen space (at 2x every path would stop half drawn). The skin is never put under a transform, so its box is
// its layout size.
export function SkinDrawing ({ kind, draw, pathRef }: SkinProps) {
  const paths = useMemo(() => skinPaths(kind), [kind])
  const svgRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const measure = (): void => {
      const { width, height } = svg.getBoundingClientRect()
      const k = Math.min(width / skinViewBox[2], height > 0 ? height / skinViewBox[3] : Infinity)
      if (k > 0 && Number.isFinite(k)) svg.style.setProperty('--skin-k', k.toFixed(4))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  return (
    <svg ref={svgRef} className='skin-svg' viewBox={skinViewBox.join(' ')} aria-hidden='true' focusable='false' data-skin={kind}>
      {paths.map((d, index) => {
        const share = skinShare(draw, index, paths.length)
        return (
          <path
            key={index}
            ref={pathRef?.(index)}
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
