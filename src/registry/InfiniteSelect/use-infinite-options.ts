'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

import {
  createInfiniteOptionsState,
  deriveView,
  getMissingIds,
  infiniteOptionsReducer,
  type PageRequest,
} from './infinite-options-state'
import type { InfiniteOptionsView, InfiniteSource, QueryFn, SelectItemType } from './infinite-select-types'

// The pieces live in smaller files; this module stays the one import path for the selects and for callers.
export * from './infinite-options-state'
export * from './infinite-select-types'

// ============================================
// Hooks
// ============================================

export function useDebouncedValue<V> (value: V, delay: number): V {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

interface UseInfiniteOptionsArgs<T> {
  queryFn?: QueryFn<T>
  /** Already debounced search term. */
  search: string
  enabled: boolean
  /** Ids to resolve to items through the first page's `selected`, so labels show before those rows are paged in. */
  selectedIds: string[]
}

/**
 * Cursor paging over a plain `queryFn`, with a per-search cache, stale-request
 * aborting and selected-item preloading — the parts of `useInfiniteQuery` a select needs.
 */
export function useInfiniteOptions<T extends SelectItemType> ({
  queryFn,
  search,
  enabled: enabledArg,
  selectedIds,
}: UseInfiniteOptionsArgs<T>): InfiniteOptionsView<T> {
  const enabled = enabledArg && Boolean(queryFn)
  const [state, dispatch] = useReducer(
    infiniteOptionsReducer<T>,
    undefined,
    createInfiniteOptionsState<T>
  )

  const queryFnRef = useRef(queryFn)
  const seqRef = useRef(0)
  const pageControllerRef = useRef<AbortController | null>(null)
  const selectedControllersRef = useRef(new Set<AbortController>())
  // Ids already asked for, so an id the server does not know is not requested forever.
  const requestedIdsRef = useRef(new Set<string>())

  useEffect(() => {
    queryFnRef.current = queryFn
  }, [queryFn])

  useEffect(() => {
    const controllers = selectedControllersRef.current

    return () => {
      pageControllerRef.current?.abort()
      controllers.forEach(controller => controller.abort())
    }
  }, [])

  const loadPage = useCallback((pageSearch: string, cursor: string | null, ids?: string[]) => {
    const fn = queryFnRef.current

    if (!fn) return

    // One page request at a time: a newer one (other search, retry) makes the old response useless.
    pageControllerRef.current?.abort()

    const controller = new AbortController()
    const request: PageRequest = { id: ++seqRef.current, search: pageSearch, cursor }

    pageControllerRef.current = controller
    dispatch({ type: 'start', request })
    fn(cursor, pageSearch, ids, controller.signal).then(
      page => dispatch({ type: 'success', request, page }),
      error => {
        ids?.forEach(id => requestedIdsRef.current.delete(id))
        dispatch(controller.signal.aborted ? { type: 'cancel', request } : { type: 'failure', request, error })
      }
    )
  }, [])

  const loadSelected = useCallback((selectedSearch: string, ids: string[]) => {
    const fn = queryFnRef.current

    if (!fn) return

    const controller = new AbortController()

    selectedControllersRef.current.add(controller)
    dispatch({ type: 'selected-start' })
    fn(null, selectedSearch, ids, controller.signal)
      .then(
        page => page.selected ?? [],
        () => [] as T[]
      )
      .then(items => {
        selectedControllersRef.current.delete(controller)
        dispatch({ type: 'selected-done', items })
      })
  }, [])

  const hasEntry = Boolean(state.entries[search])
  const firstPagePending = state.pending?.search === search && state.pending.cursor === null
  const failedHere = state.error?.search === search
  const missingIds = useMemo(() => getMissingIds(state, selectedIds), [state, selectedIds])

  // First page for the current search, carrying any selected ids still unresolved.
  useEffect(() => {
    if (!enabled || hasEntry || firstPagePending || failedHere) return

    const ids = missingIds.filter(id => !requestedIdsRef.current.has(id))

    ids.forEach(id => requestedIdsRef.current.add(id))
    loadPage(search, null, ids.length > 0 ? ids : undefined)
  }, [enabled, hasEntry, firstPagePending, failedHere, missingIds, search, loadPage])

  // A value set after the list loaded (form reset, auto-select) resolves its label
  // without throwing away the pages already scrolled.
  useEffect(() => {
    if (!enabled || !hasEntry) return

    const ids = missingIds.filter(id => !requestedIdsRef.current.has(id))

    if (ids.length === 0) return

    ids.forEach(id => requestedIdsRef.current.add(id))
    loadSelected(search, ids)
  }, [enabled, hasEntry, missingIds, search, loadSelected])

  const view = deriveView(state, search, enabled)
  const { hasNextPage, nextCursor } = view
  const isBusy = state.pending !== null

  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isBusy) return

    loadPage(search, nextCursor)
  }, [hasNextPage, isBusy, loadPage, nextCursor, search])

  const failed = state.error

  const retry = useCallback(() => {
    if (!failed) return

    requestedIdsRef.current.clear()
    loadPage(failed.search, failed.cursor, failed.cursor === null && missingIds.length > 0 ? missingIds : undefined)
  }, [failed, loadPage, missingIds])

  return {
    items: view.items,
    selected: view.selected,
    hasNextPage,
    fetchNextPage,
    isLoading: view.isLoading,
    isFetching: view.isFetching,
    isFetchingNextPage: view.isFetchingNextPage,
    isFetchingSelected: view.isFetchingSelected,
    isError: view.isError,
    error: view.error,
    retry,
  }
}

const SEARCH_DEBOUNCE_MS = 350

const noop = () => undefined

/**
 * Normalises both data modes into one view and owns the debounce, so the two
 * selects never branch on where their options come from.
 */
export function useInfiniteSelectData<T extends SelectItemType> ({
  queryFn,
  source,
  inputSearch,
  enabled,
  selectedIds,
}: {
  queryFn?: QueryFn<T>
  source?: InfiniteSource<T>
  inputSearch: string
  enabled: boolean
  selectedIds: string[]
}): InfiniteOptionsView<T> & { search: string } {
  const search = useDebouncedValue(inputSearch, SEARCH_DEBOUNCE_MS)
  const internal = useInfiniteOptions<T>({ queryFn, search, enabled: enabled && !source, selectedIds })
  const onSearchChange = source?.onSearchChange

  useEffect(() => {
    onSearchChange?.(search)
  }, [onSearchChange, search])

  // Stable across renders: the select-all effect depends on fetchNextPage, and a fresh function each render re-ran it in a loop.
  const sourceRef = useRef(source)
  useEffect(() => {
    sourceRef.current = source
  })
  const sourceFetchNextPage = useCallback(() => {
    sourceRef.current?.fetchNextPage()
  }, [])
  const sourceRetry = useCallback(() => {
    sourceRef.current?.retry?.()
  }, [])

  if (!source) return { ...internal, search }

  return {
    search,
    items: source.items,
    selected: source.selected ?? [],
    hasNextPage: source.hasNextPage,
    fetchNextPage: sourceFetchNextPage,
    isLoading: source.isLoading,
    isFetching: source.isFetching ?? (source.isLoading || source.isFetchingNextPage),
    isFetchingNextPage: source.isFetchingNextPage,
    isFetchingSelected: false,
    isError: source.isError ?? false,
    error: source.error,
    retry: source.retry ? sourceRetry : noop,
  }
}
