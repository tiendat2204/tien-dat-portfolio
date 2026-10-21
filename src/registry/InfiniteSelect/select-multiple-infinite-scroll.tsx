'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode, type UIEvent } from 'react'
import { Check, ChevronDown, Loader2, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
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

type RenderItemFn<T> = (item: T, isSelected: boolean, order?: number) => ReactNode
type RenderBadgeFn<T> = (item: T) => ReactNode

type SelectMultipleInfiniteScrollProps<T extends SelectItemType> = InfiniteDataProps<T> & {
  value: string[]
  onChange: (value: string[]) => void
  error?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
  labels?: Partial<InfiniteSelectLabels>
  disabled?: boolean
  className?: string
  isEqualWidthPopoverContent?: boolean
  /** Max height of the list in px. */
  maxHeight?: number
  enabled?: boolean
  renderItem?: RenderItemFn<T>
  renderBadge?: RenderBadgeFn<T>
  showSelectAll?: boolean
  showClearAll?: boolean
  showSelectedCount?: boolean
  showSelectionOrder?: boolean
  /** Show the first choice plus "+N more" instead of one badge per choice. */
  collapseBadges?: boolean
}

const SCROLL_THRESHOLD = 20

function useItemSelection<T extends SelectItemType> (value: string[], onChange: (value: string[]) => void) {
  const selectedIds = useMemo(() => new Set(value), [value])

  const isSelected = useCallback((item: T) => selectedIds.has(item.id), [selectedIds])

  const getSelectionOrder = useCallback((item: T): number | undefined => {
    const index = value.indexOf(item.id)

    return index >= 0 ? index + 1 : undefined
  }, [value])

  const toggle = useCallback((item: T) => {
    onChange(selectedIds.has(item.id) ? value.filter(id => id !== item.id) : [...value, item.id])
  }, [value, onChange, selectedIds])

  const clearAll = useCallback(() => onChange([]), [onChange])

  const addItems = useCallback((items: T[]) => {
    const newIds = items.filter(item => !selectedIds.has(item.id)).map(item => item.id)

    if (newIds.length > 0) onChange([...value, ...newIds])
  }, [value, onChange, selectedIds])

  return { isSelected, getSelectionOrder, toggle, clearAll, addItems }
}

interface BadgeDisplayProps<T extends SelectItemType> {
  value: string[]
  itemsById: Map<string, T>
  collapseBadges: boolean
  labels: InfiniteSelectLabels
  renderBadge?: RenderBadgeFn<T>
  onClear: () => void
  onRemove: (id: string) => void
}

function BadgeDisplay<T extends SelectItemType> ({
  value,
  itemsById,
  collapseBadges,
  labels,
  renderBadge,
  onClear,
  onRemove,
}: BadgeDisplayProps<T>) {
  const renderLabel = (id: string) => {
    const item = itemsById.get(id)

    // Until the item resolves, the id is the only honest label.
    if (!item) return id

    return renderBadge ? renderBadge(item) : item.name
  }

  if (value.length === 0) {
    return <span className='text-muted-foreground'>{labels.placeholder}</span>
  }

  if (collapseBadges) {
    return (
      <Badge variant='secondary' className='flex max-w-full items-center gap-1 text-xs'>
        <span className='block truncate'>
          {renderLabel(value[0])}
          {value.length > 1 && (
            <span className='ml-1 font-semibold text-muted-foreground'>{labels.more(value.length - 1)}</span>
          )}
        </span>
        <X
          aria-label={labels.clearAll}
          className='size-3 shrink-0 cursor-pointer hover:text-destructive'
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
        />
      </Badge>
    )
  }

  return (
    <>
      {value.map(id => (
        <Badge key={id} variant='secondary' className='flex items-center gap-1 text-xs'>
          {renderLabel(id)}
          <X
            aria-label={labels.clear}
            className='size-3 cursor-pointer hover:text-destructive'
            onClick={(e) => {
              e.stopPropagation()
              onRemove(id)
            }}
          />
        </Badge>
      ))}
    </>
  )
}

interface SelectItemRowProps<T extends SelectItemType> {
  item: T
  isSelected: boolean
  order?: number
  showSelectionOrder: boolean
  renderItem?: RenderItemFn<T>
  onSelect: () => void
}

function SelectItemRow<T extends SelectItemType> ({
  item,
  isSelected,
  order,
  showSelectionOrder,
  renderItem,
  onSelect,
}: SelectItemRowProps<T>) {
  return (
    <CommandItem value={item.id} onSelect={onSelect} className='my-0.5 cursor-pointer text-xs'>
      {renderItem
        ? renderItem(item, isSelected, order)
        : (
          <div className='flex w-full items-center'>
            <Check className={cn('mr-2 size-3.5', isSelected ? 'text-primary opacity-100' : 'opacity-0')} />
            <span className='flex-1 truncate'>{item.name}</span>
            {showSelectionOrder && isSelected && order && (
              <Badge variant='default' className='ml-2 text-xs'>{order}</Badge>
            )}
          </div>
          )}
    </CommandItem>
  )
}

export function SelectMultipleInfiniteScroll<T extends SelectItemType> ({
  queryFn,
  source,
  value,
  onChange,
  labels: labelsProp,
  disabled = false,
  className,
  maxHeight = 256,
  enabled = true,
  renderItem,
  error = false,
  renderBadge,
  isEqualWidthPopoverContent = true,
  showSelectAll = true,
  showClearAll = true,
  showSelectedCount = true,
  showSelectionOrder = true,
  collapseBadges = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: SelectMultipleInfiniteScrollProps<T>) {
  const labels = useMemo(() => ({ ...defaultInfiniteSelectLabels, ...labelsProp }), [labelsProp])
  const [isOpen, setIsOpen] = useState(false)
  const [inputSearch, setInputSearch] = useState('')
  const [isAutoFetching, setIsAutoFetching] = useState(false)
  // Items the user picked, so badges keep their labels after the search that found them is gone.
  const [picked, setPicked] = useState<T[]>([])

  const { isSelected, getSelectionOrder, toggle, clearAll, addItems } = useItemSelection<T>(value, onChange)

  const data = useInfiniteSelectData<T>({
    queryFn,
    source,
    inputSearch,
    // Preset values load while closed so badges show names; a form reset to new ids does the same.
    enabled: enabled && (isOpen || value.length > 0),
    selectedIds: value,
  })
  const { items, hasNextPage, isFetchingNextPage, fetchNextPage, isFetching, isLoading, isError } = data

  const itemsById = useMemo(() => {
    const map = new Map<string, T>()

    for (const item of [...picked, ...items, ...data.selected]) map.set(item.id, item)

    return map
  }, [picked, items, data.selected])

  const allCurrentSelected = items.length > 0 && items.every(isSelected)
  const hasUnresolved = value.some(id => !itemsById.has(id))
  const isLoadingSelected = hasUnresolved && (isLoading || data.isFetchingSelected)

  const remember = useCallback((next: T[]) => setPicked(prev => mergeById(prev, next, true)), [])

  const handleSelectAll = useCallback(() => {
    addItems(items)
    remember(items)
    if (hasNextPage) setIsAutoFetching(true)
  }, [addItems, items, remember, hasNextPage])

  const handleClearAll = useCallback(() => {
    clearAll()
    setIsAutoFetching(false)
  }, [clearAll])

  const handleOpenChange = useCallback((next: boolean) => {
    setIsOpen(next)
    if (!next) {
      setInputSearch('')
      setIsAutoFetching(false)
    }
  }, [])

  const handleSearchChange = useCallback((next: string) => {
    setInputSearch(next)
    // "Select all" means all results of the search it was pressed on.
    setIsAutoFetching(false)
  }, [])

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (isAutoFetching) return

    const target = e.currentTarget
    const isNearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - SCROLL_THRESHOLD

    if (isNearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isAutoFetching])

  const handleRetry = data.retry

  const handleRemoveItem = useCallback((id: string) => {
    onChange(value.filter(v => v !== id))
  }, [value, onChange])

  // "Select all" walks every remaining page, adding each one as it lands.
  useEffect(() => {
    if (!isAutoFetching) return

    addItems(items)
    // Each page lands asynchronously, so there is no event to hang these on; keeps badge labels once the search moves on.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    remember(items)

    if (isError || !hasNextPage) {
      setIsAutoFetching(false)
    } else if (!isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isAutoFetching, items, hasNextPage, isFetchingNextPage, isError, fetchNextPage, addItems, remember])

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-expanded={isOpen}
          aria-invalid={error || undefined}
          className={cn(
            'h-auto min-h-8 w-full justify-between px-3 py-1.5 font-normal',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          disabled={disabled}
        >
          <span className='flex flex-1 flex-wrap gap-1 overflow-hidden'>
            {isLoadingSelected
              ? (
                <span className='flex flex-wrap gap-1'>
                  <Skeleton className='h-5 w-20' />
                  {value.length > 1 && <Skeleton className='h-5 w-16' />}
                </span>
                )
              : (
                <BadgeDisplay
                  value={value}
                  itemsById={itemsById}
                  collapseBadges={collapseBadges}
                  labels={labels}
                  renderBadge={renderBadge}
                  onClear={handleClearAll}
                  onRemove={handleRemoveItem}
                />
                )}
          </span>
          <ChevronDown className={cn('ml-2 size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className={cn(
          'p-0 gap-0',
          isEqualWidthPopoverContent
            ? 'w-(--radix-popover-trigger-width) min-w-72 max-w-[calc(100vw-1rem)]'
            : 'min-w-(--radix-popover-trigger-width) max-w-[calc(100vw-1rem)]'
        )}
      >
        <Command shouldFilter={false}>
          <div className='flex items-center border-b [&_[data-slot=command-input-wrapper]]:border-b-0'>
            <div className='min-w-0 flex-1'>
              <CommandInput placeholder={labels.search} value={inputSearch} onValueChange={handleSearchChange} />
            </div>

            {(showSelectAll || showClearAll) && (
              <div className='flex shrink-0 items-center gap-1 pr-1'>
                {showSelectAll && items.length > 0 && (
                  isAutoFetching
                    ? (
                      <div className='flex items-center gap-1'>
                        <Button type='button' variant='ghost' size='sm' onClick={() => setIsAutoFetching(false)}>
                          <X className='size-3' aria-hidden='true' />
                          {labels.cancel}
                        </Button>
                        <Loader2 className='size-4 animate-spin text-primary' aria-hidden='true' />
                      </div>
                      )
                    : (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={isFetching || (allCurrentSelected && !hasNextPage)}
                        onClick={handleSelectAll}
                      >
                        {labels.selectAll}
                      </Button>
                      )
                )}

                {showClearAll && value.length > 0 && (
                  <Button type='button' variant='ghost' size='sm' onClick={handleClearAll} disabled={isAutoFetching}>
                    {labels.clearAll}
                  </Button>
                )}
              </div>
            )}
          </div>

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
                : isError
                  ? (
                    <div role='alert' className='space-y-2 py-3 text-center'>
                      <p className='text-destructive text-xs'>{labels.error}</p>
                      <Button type='button' variant='outline' size='sm' disabled={isFetching} onClick={handleRetry}>
                        {isFetching ? labels.loading : labels.retry}
                      </Button>
                    </div>
                    )
                  : (
                    <p className='py-3 text-center text-xs text-muted-foreground'>
                      {data.search ? labels.noResults : labels.empty}
                    </p>
                    )}
            </CommandEmpty>

            <CommandGroup>
              {showSelectedCount && value.length > 0 && (
                <div className='mb-1 border-b bg-primary/10 px-2 py-1 text-xs text-primary'>
                  {labels.selectedCount(value.length)}
                </div>
              )}

              {items.map(item => (
                <SelectItemRow
                  key={item.id}
                  item={item}
                  isSelected={isSelected(item)}
                  order={getSelectionOrder(item)}
                  showSelectionOrder={showSelectionOrder}
                  renderItem={renderItem}
                  onSelect={() => {
                    if (!isSelected(item)) remember([item])
                    toggle(item)
                  }}
                />
              ))}

              {isFetchingNextPage && (
                <div className='flex items-center justify-center py-2 text-xs text-muted-foreground'>
                  <Loader2 className='mr-2 size-3 animate-spin' aria-hidden='true' />
                  {labels.loadingMore}
                </div>
              )}

              {items.length > 0 && isError && (
                <div role='alert' className='space-y-2 py-3 text-center'>
                  <p className='text-destructive text-xs'>{labels.error}</p>
                  <Button type='button' variant='outline' size='sm' disabled={isFetching} onClick={handleRetry}>
                    {isFetching ? labels.loading : labels.retry}
                  </Button>
                </div>
              )}

              {!hasNextPage && !isError && items.length > 0 && (
                <div className='border-t py-1.5 text-center text-xs text-muted-foreground/60'>
                  {labels.end}
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default SelectMultipleInfiniteScroll
