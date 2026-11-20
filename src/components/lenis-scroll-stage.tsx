'use client'

import { useLenis } from 'lenis/react'
import { useCallback, type ReactNode } from 'react'

import { ScrollStageScroller } from '@/registry/ScrollStage/scroll-stage'

// The site scrolls with Lenis, which rewrites the page position every frame while it glides. Scroll Stage's chapter
// jumps go through it, otherwise a jump started mid-glide would be undone. Without Lenis they fall back to native.
export function LenisScrollStage ({ children }: { children: ReactNode }) {
  const lenis = useLenis()
  const scrollTo = useCallback((top: number) => lenis?.scrollTo(top), [lenis])

  return <ScrollStageScroller value={lenis ? scrollTo : undefined}>{children}</ScrollStageScroller>
}
