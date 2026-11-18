'use client'

import { useEffect, useId, useRef } from 'react'

import { SIGNATURE_BOUNDS as B, SIGNATURE_PATH } from '@/components/signature-path'

// The flourish under the name, in the same coordinates as the lettering.
const FLOURISH = 'M20 190C380 262 980 250 1400 170C1500 150 1600 120 1690 70'
const PAD = 40

// "Đạt" set in a formal script, written out left to right once the footer row scrolls into view and underlined with
// a pen stroke; with reduced motion the finished signature shows at once.
export function Signature ({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const maskId = useId()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      node.setAttribute('data-drawn', '')
      observer.disconnect()
    }, { threshold: 0.4 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const x = B.x - PAD
  const y = B.y - PAD
  const w = B.w + PAD * 2
  const h = B.h + PAD * 2 + 140

  return (
    <svg ref={ref} viewBox={`${x} ${y} ${w} ${h}`} role='img' aria-label='Signature: Đạt' className={`signature ${className ?? ''}`}>
      <defs>
        <linearGradient id={`${maskId}-edge`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0.94' stopColor='#fff' />
          <stop offset='1' stopColor='#000' />
        </linearGradient>
        <mask id={maskId} maskUnits='userSpaceOnUse' x={x} y={y} width={w} height={h}>
          <rect className='signature-wipe' x={x} y={y} height={h} width={w} fill={`url(#${maskId}-edge)`} />
        </mask>
      </defs>
      <path d={SIGNATURE_PATH} fill='currentColor' mask={`url(#${maskId})`} />
      <path className='signature-flourish' d={FLOURISH} pathLength={1} />
    </svg>
  )
}
