// Shared types and default labels of the infinite selects.

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
