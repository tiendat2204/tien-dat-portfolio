'use client'

import { useCallback, useMemo, useState, type MouseEvent, type ReactNode, type UIEvent } from 'react'
import { Check, ChevronDown, Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import {
  defaultInfiniteSelectLabels,
  mergeById,
  useInfiniteSelectData,
  type InfiniteDataProps,
  type InfiniteSelectLabels,
  type SelectItemType,
} from './use-infinite-options'

export type { InfiniteQueryResult, InfiniteSource, QueryFn, SelectItemType } from './use-infinite-options'

type SelectSingleInfiniteScrollProps<T extends SelectItemType> = InfiniteDataProps<T> & {
  value?: string | null
  onChange: (value: string) => void
  onChangeItem?: (item: T | undefined) => void
  error?: boolean
  /**
   * What the field is called. The trigger's own text is the chosen value or a
   * placeholder, so without it a screen reader hears "Select…" with no idea
   * which field that is.
   */
  'aria-label'?: string
  'aria-describedby'?: string
  labels?: Partial<InfiniteSelectLabels>
  disabled?: boolean
  className?: string
  isEqualWidthPopoverContent?: boolean
  /** Max height of the list in px. */
  maxHeight?: number
  enabled?: boolean
  renderItem?: (item: T, isSelected: boolean) => ReactNode
  clearable?: boolean
  /**
   * Rendered under the list and inside the empty state — the way out when what
   * someone needs is not in the list yet, instead of a dead end.
   */
  footerAction?: ReactNode
  /** Message for a failed load, for a caller that knows its API's errors. Returning undefined keeps the default. */
  getErrorMessage?: (error: unknown) => string | undefined
  /** Contextual empty state, e.g. to tell an empty source from a search with no matches. */
  getEmptyMessage?: (search: string) => string
  /** Controls the open state from outside, e.g. to open the next picker after a choice. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SCROLL_THRESHOLD = 20

export function SelectSingleInfiniteScroll<T extends SelectItemType> ({
  queryFn,
  source,
  value,
  onChange,
  onChangeItem,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  labels: labelsProp,
  disabled = false,
  className,
  maxHeight = 256,
  enabled = true,
  renderItem,
  error = false,
  isEqualWidthPopoverContent = true,
  clearable = false,
  footerAction,
  getErrorMessage,
  getEmptyMessage,
  open: controlledOpen,
  onOpenChange,
}: SelectSingleInfiniteScrollProps<T>) {
  const labels = useMemo(() => ({ ...defaultInfiniteSelectLabels, ...labelsProp }), [labelsProp])
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = useCallback((next: boolean) => {
    setInternalOpen(next)
    onOpenChange?.(next)
  }, [onOpenChange])
  const [inputSearch, setInputSearch] = useState('')
  // Items the user picked, so the trigger keeps its label after the search that found them is gone.
  const [picked, setPicked] = useState<T[]>([])

  const selectedIds = useMemo(() => (value ? [value] : []), [value])

  const data = useInfiniteSelectData<T>({
    queryFn,
    source,
    inputSearch,
    // A preset value loads even while closed, otherwise the trigger shows the raw id.
    enabled: enabled && (isOpen || selectedIds.length > 0),
    selectedIds,
  })
  const { items, hasNextPage, isFetchingNextPage, fetchNextPage, isError, isFetching, isLoading } = data

  const selectedItem = useMemo(() => {
    if (!value) return undefined

    return [...items, ...data.selected, ...picked].find(item => item.id === value)
  }, [value, items, data.selected, picked])

  const handleRetry = data.retry

  // A failed load is not an empty list: saying "No results" sends people looking for a record that is there.
  const errorMessage = isError ? getErrorMessage?.(data.error) || labels.error : null
  const errorState = errorMessage
    ? (
      <div role='alert' className='space-y-2 py-3 text-center'>
        <p className='text-destructive text-xs'>{errorMessage}</p>
        <Button type='button' variant='outline' size='sm' disabled={isFetching} onClick={handleRetry}>
          {isFetching ? labels.loading : labels.retry}
        </Button>
      </div>
      )
    : null

  const emptyMessage = getEmptyMessage
    ? getEmptyMessage(data.search)
    : data.search ? labels.noResults : labels.empty

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - SCROLL_THRESHOLD

    if (isNearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleSelect = useCallback((item: T) => {
    const nextItem = item.id === value ? undefined : item

    if (nextItem) setPicked(prev => mergeById(prev, [nextItem], true))
    onChange(nextItem?.id ?? '')
    onChangeItem?.(nextItem)
    setIsOpen(false)
  }, [onChange, onChangeItem, setIsOpen, value])

  const handleClear = useCallback((e: MouseEvent) => {
    e.stopPropagation()
    onChange('')
    onChangeItem?.(undefined)
  }, [onChange, onChangeItem])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error || undefined}
          aria-expanded={isOpen}
          className={cn(
            'w-full justify-between px-3 py-2 font-normal',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          disabled={disabled}
        >
          <span className={cn('flex-1 truncate text-left', !selectedItem && 'text-muted-foreground')}>
            {selectedItem ? selectedItem.name : value || labels.placeholder}
          </span>
          <span className='ml-2 flex shrink-0 items-center gap-1'>
            {clearable && value && (
              <X
                aria-label={labels.clear}
                className='size-3.5 cursor-pointer text-muted-foreground hover:text-destructive'
                onClick={handleClear}
              />
            )}
            <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className={cn(
          'p-0 gap-0',
          isEqualWidthPopoverContent
            ? 'w-(--radix-popover-trigger-width) max-w-[calc(100vw-1rem)]'
            : 'min-w-(--radix-popover-trigger-width) max-w-[calc(100vw-1rem)]'
        )}
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder={labels.search} value={inputSearch} onValueChange={setInputSearch} />
          <CommandList
            onScroll={handleScroll}
            data-lenis-prevent
            className='scroll-fade no-scrollbar'
            style={{ maxHeight }}
          >
            <CommandEmpty>
              {isLoading
                ? (
                  <div className='flex items-center justify-center py-4 text-xs text-muted-foreground'>
                    <Loader2 className='mr-2 size-3.5 animate-spin' aria-hidden='true' />
                    {labels.loading}
                  </div>
                  )
                : (errorState ?? (
                  <div className='space-y-2 py-3 text-center'>
                    <p className='text-muted-foreground text-xs'>{emptyMessage}</p>
                    {footerAction}
                  </div>
                  ))}
            </CommandEmpty>

            <CommandGroup>
              {items.map(item => {
                const isSelected = item.id === value

                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className='my-0.5 cursor-pointer text-xs'
                  >
                    {renderItem
                      ? renderItem(item, isSelected)
                      : (
                        <div className='flex w-full items-center'>
                          <Check className={cn('mr-2 size-3.5', isSelected ? 'text-primary opacity-100' : 'opacity-0')} />
                          <span className='flex-1 truncate'>{item.name}</span>
                        </div>
                        )}
                  </CommandItem>
                )
              })}

              {isFetchingNextPage && (
                <div className='flex items-center justify-center py-2 text-xs text-muted-foreground'>
                  <Loader2 className='mr-2 size-3 animate-spin' aria-hidden='true' />
                  {labels.loadingMore}
                </div>
              )}

              {/* A later page that failed leaves the loaded ones in place. */}
              {items.length > 0 && errorState}

              {!hasNextPage && !isError && items.length > 0 && (
                <div className='border-t py-1.5 text-center text-xs text-muted-foreground/60'>
                  {labels.end}
                </div>
              )}
            </CommandGroup>

            {footerAction && items.length > 0 && <div className='border-t p-2'>{footerAction}</div>}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default SelectSingleInfiniteScroll
