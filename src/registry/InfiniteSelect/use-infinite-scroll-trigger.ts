'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseInfiniteScrollTriggerArgs {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  /** Set to false to pause loading, e.g. while "select all" is already walking the pages. */
  enabled?: boolean
  /** How far before the end of the list the next page starts loading. */
  rootMargin?: string
}

/**
 * Loads the next page when a sentinel at the end of a scrollable list comes into view.
 *
 * Unlike a scroll listener this also fires when the first page is too short to scroll, and again
 * after every page while the sentinel is still visible, so a list always fills its viewport.
 * Render `<div ref={sentinelRef} aria-hidden />` after the last item.
 */
export function useInfiniteScrollTrigger ({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  enabled = true,
  rootMargin = '0px 0px 48px 0px',
}: UseInfiniteScrollTriggerArgs) {
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null)
  const sentinelRef = useCallback((node: HTMLElement | null) => setSentinel(node), [])
  const active = enabled && hasNextPage && !isFetchingNextPage

  // Re-observing after each page makes the observer report the current state again, which is what chains the loads.
  useEffect(() => {
    if (!sentinel || !active) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) fetchNextPage()
      },
      { rootMargin }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [sentinel, active, fetchNextPage, rootMargin])

  return { sentinelRef }
}
