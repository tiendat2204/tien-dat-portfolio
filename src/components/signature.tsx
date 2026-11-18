'use client'

import { useEffect, useRef } from 'react'

// Hand-drawn "ĐẠT" signature as open strokes. Each stroke is drawn in turn (stroke-dashoffset) once the footer row
// scrolls into view; with reduced motion the finished signature shows at once.
const STROKES = [
  // Đ: stem, bowl, crossbar
  'M34 14C32 36 30 60 27 80',
  'M30 18C66 6 88 30 78 54C70 72 50 80 27 78',
  'M14 44C28 42 42 41 58 39',
  // Ạ: tent, crossbar, dot below
  'M96 76C104 56 112 36 120 18C124 40 130 62 138 76',
  'M106 56C116 54 128 54 138 55',
  'M117 87L121 91',
  // T: bar and stem
  'M150 22C170 18 192 18 214 20',
  'M182 20C180 42 180 62 186 76C190 82 198 80 204 72',
  // flourish underline
  'M10 92C66 98 150 96 232 84',
]

export function Signature ({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)

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

  return (
    <svg ref={ref} viewBox='0 0 244 104' role='img' aria-label='Signature: Đạt' className={`signature ${className ?? ''}`}>
      {STROKES.map((d, index) => (
        <path key={d} d={d} pathLength={1} style={{ '--i': index } as React.CSSProperties} />
      ))}
    </svg>
  )
}
