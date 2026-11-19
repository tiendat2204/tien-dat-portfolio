import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { InfiniteSelectLabels } from './infinite-select-types'

type Labels = Pick<InfiniteSelectLabels, 'loading' | 'loadingMore' | 'end' | 'retry'>

/** The first page is on its way. */
export function InfiniteListLoading ({ labels }: { labels: Pick<Labels, 'loading'> }) {
  return (
    <div className='flex items-center justify-center py-4 text-xs text-muted-foreground'>
      <Loader2 className='mr-2 size-3.5 animate-spin' aria-hidden='true' />
      {labels.loading}
    </div>
  )
}

/** A later page is on its way. */
export function InfiniteListLoadingMore ({ labels }: { labels: Pick<Labels, 'loadingMore'> }) {
  return (
    <div className='flex items-center justify-center py-2 text-xs text-muted-foreground'>
      <Loader2 className='mr-2 size-3 animate-spin' aria-hidden='true' />
      {labels.loadingMore}
    </div>
  )
}

interface InfiniteListErrorProps {
  message: string
  labels: Pick<Labels, 'loading' | 'retry'>
  isFetching: boolean
  onRetry: () => void
}

/** A failed load is not an empty list: saying "No results" sends people looking for a record that is there. */
export function InfiniteListError ({ message, labels, isFetching, onRetry }: InfiniteListErrorProps) {
  return (
    <div role='alert' className='space-y-2 py-3 text-center'>
      <p className='text-destructive text-xs'>{message}</p>
      <Button type='button' variant='outline' size='sm' disabled={isFetching} onClick={onRetry}>
        {isFetching ? labels.loading : labels.retry}
      </Button>
    </div>
  )
}

/** Every page has been loaded. */
export function InfiniteListEnd ({ labels }: { labels: Pick<Labels, 'end'> }) {
  return <div className='border-t py-1.5 text-center text-xs text-muted-foreground/60'>{labels.end}</div>
}
