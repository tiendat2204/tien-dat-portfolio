// Pure cursor-paging state of the infinite selects: no React, unit-tested in tests/registry/infinite-options.test.ts.

import type { InfiniteQueryResult } from './infinite-select-types'

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
