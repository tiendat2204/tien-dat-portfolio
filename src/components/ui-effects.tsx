'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { playSound } from '@/lib/sound'

const INTERACTIVE = 'a[href], button, [role="button"], input, summary, [cmdk-item]'

// Site-wide polish: click sounds, terminal-style scroll reveal and a pixel cursor.
export function UiEffects () {
  const pathname = usePathname()
  const cursorRef = useRef<HTMLDivElement>(null)

  // Click sounds (only when the visitor turned sound on).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(INTERACTIVE)) playSound('click')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // Sections below the fold fade up, and their headings type out like a terminal.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const sections = [...document.querySelectorAll<HTMLElement>('main > section')]
      .filter((s) => s.getBoundingClientRect().top > window.innerHeight)

    for (const section of sections) {
      section.dataset.reveal = ''
      section.querySelectorAll<HTMLElement>('h2.font-doto').forEach((h) => {
        h.style.setProperty('--chars', String(Math.max(h.textContent?.trim().length ?? 1, 1)))
      })
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        ;(entry.target as HTMLElement).dataset.revealed = ''
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -10% 0px' })
    sections.forEach((s) => observer.observe(s))

    return () => {
      observer.disconnect()
      sections.forEach((s) => {
        delete s.dataset.reveal
        delete s.dataset.revealed
      })
    }
  }, [pathname])

  // Pixel cursor that trails the pointer and frames links and buttons.
  useEffect(() => {
    const el = cursorRef.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let x = -100
    let y = -100
    let cx = x
    let cy = y
    let frame = 0

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      el.dataset.visible = ''
      el.dataset.active = (e.target as Element | null)?.closest?.(INTERACTIVE) ? 'true' : 'false'
    }
    const onLeave = () => { delete el.dataset.visible }
    const onDown = () => { el.dataset.pressed = '' }
    const onUp = () => { delete el.dataset.pressed }
    const tick = () => {
      cx += (x - cx) * 0.25
      cy += (y - cy) * 0.25
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div ref={cursorRef} aria-hidden='true' className='pixel-cursor'>
      <span />
    </div>
  )
}
