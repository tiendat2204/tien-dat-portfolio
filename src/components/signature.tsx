'use client'

import { useEffect, useId, useRef } from 'react'

import { SIGNATURE_BOUNDS as B, SIGNATURE_PATH } from '@/components/signature-path'

const PAD = 6

// The owner's pen signature, written out left to right once the footer row scrolls into view; with reduced motion
// the finished signature shows at once.
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
  const h = B.h + PAD * 2

  return (
    <svg ref={ref} viewBox={`${x} ${y} ${w} ${h}`} role='img' aria-label='Signature of Tien Dat' className={`signature ${className ?? ''}`}>
      <defs>
        <linearGradient id={`${maskId}-edge`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0.94' stopColor='#fff' />
          <stop offset='1' stopColor='#000' />
        </linearGradient>
        <mask id={maskId} maskUnits='userSpaceOnUse' x={x} y={y} width={w} height={h}>
          <rect className='signature-wipe' x={x} y={y} height={h} width={w} fill={`url(#${maskId}-edge)`} />
        </mask>
      </defs>
      <path d={SIGNATURE_PATH} fill='currentColor' fillRule='evenodd' mask={`url(#${maskId})`} />
    </svg>
  )
}
