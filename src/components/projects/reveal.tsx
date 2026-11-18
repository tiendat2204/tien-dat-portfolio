'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// Sets `data-in` once the card has scrolled into view (and keeps it): the diagram CSS draws in from that attribute.
export function Reveal ({ children, className, id }: { children: ReactNode, className?: string, id?: string }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return
      node.setAttribute('data-in', '')
      observer.disconnect()
    }, { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return <article ref={ref} id={id} className={className}>{children}</article>
}
