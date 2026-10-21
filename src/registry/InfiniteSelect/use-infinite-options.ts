'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'

// ============================================
// Shared types
// ============================================

export interface SelectItemType {
  id: string
  name: string
}

export interface InfiniteQueryResult<T> {
  items: T[]
  nextCursor: string | null
  /** Items for the `selectedIds` the request asked for, so the trigger can show labels before they are paged in. */
  selected?: T[]
}

export type QueryFn<T> = (
  cursor: string | null,
  search: string,
  selectedIds?: string[],
  signal?: AbortSignal
) => Promise<InfiniteQueryResult<T>>

/**
 * Externally managed list state, e.g. mapped from TanStack `useInfiniteQuery`.
 * The select owns the search box and reports the debounced term through `onSearchChange`.
 */
export interface InfiniteSource<T> {
  items: T[]
  selected?: T[]
  hasNextPage: boolean
  fetchNextPage: () => unknown
  isLoading: boolean
  isFetchingNextPage: boolean
  isFetching?: boolean
  isError?: boolean
  error?: unknown
  retry?: () => unknown
  onSearchChange: (search: string) => void
}

/** `queryFn` and `source` are two ways to feed the same UI; pass exactly one. */
export type InfiniteDataProps<T> =
  | { queryFn: QueryFn<T>, source?: never }
  | { source: InfiniteSource<T>, queryFn?: never }

export interface InfiniteSelectLabels {
  placeholder: string
  search: string
  loading: string
  loadingMore: string
  end: string
  empty: string
  noResults: string
  error: string
  retry: string
  clear: string
  selectAll: string
  clearAll: string
  cancel: string
  selectedCount: (count: number) => string
  more: (count: number) => string
}

export const defaultInfiniteSelectLabels: InfiniteSelectLabels = {
  placeholder: 'Select…',
  search: 'Search…',
  loading: 'Loading…',
  loadingMore: 'Loading more…',
  end: 'No more results',
  empty: 'No options.',
  noResults: 'No results found.',
  error: "Couldn't load the list.",
  retry: 'Retry',
  clear: 'Clear',
  selectAll: 'Select all',
  clearAll: 'Clear all',
  cancel: 'Cancel',
  selectedCount: count => `${count} selected`,
  more: count => `+${count} more`,
}

/** What both selects render from, whichever data mode fed it. */
export interface InfiniteOptionsView<T> {
  items: T[]
  selected: T[]
  hasNextPage: boolean
  fetchNextPage: () => void
  isLoading: boolean
  isFetching: boolean
  isFetchingNextPage: boolean
  isFetchingSelected: boolean
  isError: boolean
  error: unknown
  retry: () => void
}

// ============================================
// Pure state logic (unit-tested, no React)
// ============================================

export interface CacheEntry<T> {
  items: T[]
  nextCursor: string | null
}

export interface PageRequest {
  id: number
  search: string
  cursor: string | null
}

export interface InfiniteOptionsState<T> {
  /** One entry per search term, kept while mounted so going back to a term is instant. */
  entries: Record<string, CacheEntry<T>>
  selected: T[]
  pending: PageRequest | null
  error: (PageRequest & { error: unknown }) | null
  selectedPending: number
}

export type InfiniteOptionsAction<T> =
  | { type: 'start', request: PageRequest }
  | { type: 'success', request: PageRequest, page: InfiniteQueryResult<T> }
  | { type: 'failure', request: PageRequest, error: unknown }
  | { type: 'cancel', request: PageRequest }
  | { type: 'selected-start' }
  | { type: 'selected-done', items: T[] }

export function createInfiniteOptionsState<T> (): InfiniteOptionsState<T> {
  return { entries: {}, selected: [], pending: null, error: null, selectedPending: 0 }
}

/** Appends `incoming` to `base`, dropping ids already present. `override` lets incoming win (fresher data). */
export function mergeById<T extends { id: string }> (base: T[], incoming: T[], override = false): T[] {
  if (incoming.length === 0) return base

  const map = new Map(base.map(item => [item.id, item]))
  let changed = false

  for (const item of incoming) {
    const current = map.get(item.id)
    if (current === undefined || (override && current !== item)) {
      map.set(item.id, item)
      changed = true
    }
  }

  // Same array back when nothing changed, so a state setter using this bails out instead of re-rendering.
  return changed ? Array.from(map.values()) : base
}

export function appendPage<T extends { id: string }> (
  entries: Record<string, CacheEntry<T>>,
  search: string,
  cursor: string | null,
  page: InfiniteQueryResult<T>
): Record<string, CacheEntry<T>> {
  const entry = entries[search]

  if (cursor === null) {
    return { ...entries, [search]: { items: mergeById([], page.items), nextCursor: page.nextCursor } }
  }

  // A page that does not continue the cached list (double fetch, reset in between) would duplicate or skip rows.
  if (!entry || entry.nextCursor !== cursor) return entries

  return { ...entries, [search]: { items: mergeById(entry.items, page.items), nextCursor: page.nextCursor } }
}

export function infiniteOptionsReducer<T extends { id: string }> (
  state: InfiniteOptionsState<T>,
  action: InfiniteOptionsAction<T>
): InfiniteOptionsState<T> {
  switch (action.type) {
    case 'start':
      return { ...state, pending: action.request, error: null }
    case 'success':
      // Only the latest page request may land: an older one belongs to a search the user already left.
      if (state.pending?.id !== action.request.id) return state

      return {
        ...state,
        pending: null,
        entries: appendPage(state.entries, action.request.search, action.request.cursor, action.page),
        selected: mergeById(state.selected, action.page.selected ?? [], true),
      }
    case 'failure':
      if (state.pending?.id !== action.request.id) return state

      return { ...state, pending: null, error: { ...action.request, error: action.error } }
    case 'cancel':
      if (state.pending?.id !== action.request.id) return state

      return { ...state, pending: null }
    case 'selected-start':
      return { ...state, selectedPending: state.selectedPending + 1 }
    case 'selected-done':
      return {
        ...state,
        selectedPending: Math.max(0, state.selectedPending - 1),
        selected: mergeById(state.selected, action.items, true),
      }
    default:
      return state
  }
}

/** Ids whose item is not known yet from any cached page or preloaded selection. */
export function getMissingIds<T extends { id: string }> (state: InfiniteOptionsState<T>, ids: string[]): string[] {
  if (ids.length === 0) return ids

  const known = new Set(state.selected.map(item => item.id))

  for (const entry of Object.values(state.entries)) {
    for (const item of entry.items) known.add(item.id)
  }

  return ids.filter(id => !known.has(id))
}

export function deriveView<T extends { id: string }> (state: InfiniteOptionsState<T>, search: string, enabled: boolean) {
  const entry = state.entries[search]
  const isError = state.error?.search === search
  const isFetching = state.pending !== null

  return {
    items: entry?.items ?? [],
    selected: state.selected,
    hasNextPage: entry ? entry.nextCursor !== null : false,
    nextCursor: entry?.nextCursor ?? null,
    isLoading: enabled && !entry && !isError,
    isFetching,
    isFetchingNextPage: state.pending?.search === search && state.pending.cursor !== null,
    isFetchingSelected: state.selectedPending > 0,
    isError,
    error: isError ? state.error?.error : undefined,
  }
}

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
