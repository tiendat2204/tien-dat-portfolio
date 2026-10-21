'use client'

import { useState } from 'react'
import { SelectMultipleInfiniteScroll } from '../InfiniteSelect/select-multiple-infinite-scroll'
import { SelectSingleInfiniteScroll } from '../InfiniteSelect/select-single-infinite-scroll'
import type { InfiniteQueryResult, SelectItemType } from '../InfiniteSelect/use-infinite-options'

const ADJECTIVES = ['Amber', 'Brisk', 'Cobalt', 'Dusky', 'Ember', 'Frosty', 'Golden', 'Hazel', 'Ivory', 'Jade']
const NOUNS = ['Harbor', 'Valley', 'Summit', 'Meadow', 'Canyon', 'Delta', 'Grove', 'Ridge', 'Bay', 'Field']
const SUFFIXES = ['City', 'Town', 'Port', 'Falls', 'Springs']

// 10 × 10 × 5 = 500 unique place names.
const ALL_ITEMS: SelectItemType[] = ADJECTIVES.flatMap(adjective =>
  NOUNS.flatMap(noun => SUFFIXES.map(suffix => `${adjective} ${noun} ${suffix}`))
).map((name, index) => ({ id: String(index + 1), name }))

const PAGE_SIZE = 20
const LATENCY_MS = 400

function wait (ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)

    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

// Stands in for GET /api/cities?cursor=&search=&selectedIds=
async function fetchCities (
  cursor: string | null,
  search: string,
  selectedIds?: string[],
  signal?: AbortSignal
): Promise<InfiniteQueryResult<SelectItemType>> {
  await wait(LATENCY_MS, signal)

  const term = search.trim().toLowerCase()
  const matches = term ? ALL_ITEMS.filter(item => item.name.toLowerCase().includes(term)) : ALL_ITEMS
  const start = cursor ? Number(cursor) : 0
  const end = start + PAGE_SIZE

  return {
    items: matches.slice(start, end),
    nextCursor: end < matches.length ? String(end) : null,
    selected: selectedIds ? ALL_ITEMS.filter(item => selectedIds.includes(item.id)) : undefined,
  }
}

export default function InfiniteSelectDemo () {
  const [city, setCity] = useState('')
  // Preset ids far beyond page one: their names still show, preloaded through selectedIds.
  const [cities, setCities] = useState<string[]>(['137', '402'])

  return (
    <div className='grid w-full max-w-2xl grid-cols-1 gap-6 p-4 md:grid-cols-2'>
      <div className='flex flex-col gap-2'>
        <span className='text-xs font-medium'>Single</span>
        <SelectSingleInfiniteScroll
          aria-label='City'
          queryFn={fetchCities}
          value={city}
          onChange={setCity}
          clearable
          labels={{ placeholder: 'Pick a city…' }}
        />
        <code className='text-xs text-muted-foreground'>value: {JSON.stringify(city)}</code>
      </div>

      <div className='flex flex-col gap-2'>
        <span className='text-xs font-medium'>Multiple</span>
        <SelectMultipleInfiniteScroll
          aria-label='Cities'
          queryFn={fetchCities}
          value={cities}
          onChange={setCities}
          labels={{ placeholder: 'Pick cities…' }}
        />
        <code className='break-all text-xs text-muted-foreground'>value: {JSON.stringify(cities)}</code>
      </div>
    </div>
  )
}
