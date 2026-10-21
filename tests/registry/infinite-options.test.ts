import assert from 'node:assert/strict'
import test from 'node:test'
import {
  appendPage,
  createInfiniteOptionsState,
  deriveView,
  getMissingIds,
  infiniteOptionsReducer,
  mergeById,
  type InfiniteOptionsState,
  type InfiniteQueryResult,
  type PageRequest,
} from '../../src/registry/InfiniteSelect/use-infinite-options'

interface Item { id: string, name: string }

const item = (id: string): Item => ({ id, name: `Item ${id}` })
const page = (ids: string[], nextCursor: string | null, selected?: Item[]): InfiniteQueryResult<Item> => ({
  items: ids.map(item),
  nextCursor,
  selected,
})

function run (state: InfiniteOptionsState<Item>, request: PageRequest, result: InfiniteQueryResult<Item>) {
  const started = infiniteOptionsReducer(state, { type: 'start', request })

  return infiniteOptionsReducer(started, { type: 'success', request, page: result })
}

test('paging appends the next page to the same search entry', () => {
  let state = createInfiniteOptionsState<Item>()

  state = run(state, { id: 1, search: '', cursor: null }, page(['1', '2'], '2'))
  state = run(state, { id: 2, search: '', cursor: '2' }, page(['3', '4'], '4'))

  const view = deriveView(state, '', true)

  assert.deepEqual(view.items.map(i => i.id), ['1', '2', '3', '4'])
  assert.equal(view.hasNextPage, true)
  assert.equal(view.nextCursor, '4')
})

test('a page that does not continue the cached cursor is dropped', () => {
  const entries = appendPage<Item>({}, '', null, page(['1'], '1'))
  const same = appendPage(entries, '', 'stale-cursor', page(['9'], null))

  assert.equal(same, entries)
})

test('a new search uses its own cache entry and leaves the old one intact', () => {
  let state = createInfiniteOptionsState<Item>()

  state = run(state, { id: 1, search: '', cursor: null }, page(['1', '2'], '2'))
  state = run(state, { id: 2, search: 'ab', cursor: null }, page(['7'], null))

  assert.deepEqual(deriveView(state, 'ab', true).items.map(i => i.id), ['7'])
  assert.deepEqual(deriveView(state, '', true).items.map(i => i.id), ['1', '2'])
  assert.equal(deriveView(state, 'other', true).isLoading, true)
  assert.equal(deriveView(state, 'other', false).isLoading, false)
})

test('a stale response for a search the user already left is ignored', () => {
  let state = createInfiniteOptionsState<Item>()
  const old: PageRequest = { id: 1, search: 'a', cursor: null }
  const current: PageRequest = { id: 2, search: 'ab', cursor: null }

  state = infiniteOptionsReducer(state, { type: 'start', request: old })
  state = infiniteOptionsReducer(state, { type: 'start', request: current })

  const afterStale = infiniteOptionsReducer(state, { type: 'success', request: old, page: page(['x'], null) })

  assert.equal(afterStale, state)
  assert.equal(afterStale.entries.a, undefined)

  const afterStaleError = infiniteOptionsReducer(state, { type: 'failure', request: old, error: new Error('boom') })

  assert.equal(afterStaleError, state)

  const done = infiniteOptionsReducer(state, { type: 'success', request: current, page: page(['y'], null) })

  assert.deepEqual(deriveView(done, 'ab', true).items.map(i => i.id), ['y'])
  assert.equal(done.pending, null)
})

test('a failure marks only its search as errored and a cancel clears pending', () => {
  let state = createInfiniteOptionsState<Item>()
  const request: PageRequest = { id: 1, search: 'q', cursor: null }

  state = infiniteOptionsReducer(state, { type: 'start', request })
  const failed = infiniteOptionsReducer(state, { type: 'failure', request, error: 'nope' })

  assert.equal(deriveView(failed, 'q', true).isError, true)
  assert.equal(deriveView(failed, 'q', true).isLoading, false)
  assert.equal(deriveView(failed, 'q', true).error, 'nope')
  assert.equal(deriveView(failed, '', true).isError, false)

  const cancelled = infiniteOptionsReducer(state, { type: 'cancel', request })

  assert.equal(cancelled.pending, null)
  assert.equal(cancelled.error, null)
})

test('selected items are merged across pages and deduped by id', () => {
  let state = createInfiniteOptionsState<Item>()

  state = run(state, { id: 1, search: '', cursor: null }, page(['1'], '1', [item('50'), item('60')]))
  state = infiniteOptionsReducer(state, { type: 'selected-start' })
  state = infiniteOptionsReducer(state, { type: 'selected-done', items: [{ id: '60', name: 'Fresh 60' }, item('70')] })

  assert.deepEqual(state.selected.map(i => i.id), ['50', '60', '70'])
  assert.equal(state.selected[1].name, 'Fresh 60')
  assert.equal(state.selectedPending, 0)
})

test('getMissingIds only reports ids not known from pages or selected', () => {
  let state = createInfiniteOptionsState<Item>()

  state = run(state, { id: 1, search: 'x', cursor: null }, page(['1', '2'], null, [item('9')]))

  assert.deepEqual(getMissingIds(state, ['1', '9', '42']), ['42'])
  assert.deepEqual(getMissingIds(state, []), [])
})

test('mergeById keeps order, drops duplicates within a page, and only overrides when asked', () => {
  assert.deepEqual(mergeById([], [item('1'), item('1'), item('2')]).map(i => i.id), ['1', '2'])

  const base = [{ id: '1', name: 'old' }]

  assert.equal(mergeById(base, [{ id: '1', name: 'new' }])[0].name, 'old')
  assert.equal(mergeById(base, [{ id: '1', name: 'new' }], true)[0].name, 'new')
})

test('nextCursor null means there are no more pages', () => {
  let state = createInfiniteOptionsState<Item>()

  state = run(state, { id: 1, search: '', cursor: null }, page(['1'], null))

  const view = deriveView(state, '', true)

  assert.equal(view.hasNextPage, false)
  assert.equal(view.isFetchingNextPage, false)
  assert.equal(view.isLoading, false)
})

test('mergeById returns the same array when nothing changes, so state setters can bail out', () => {
  const a = { id: '1', name: 'A' }
  const base = [a]
  assert.equal(mergeById(base, [a], true), base)
  assert.equal(mergeById(base, [a]), base)
  assert.notEqual(mergeById(base, [{ id: '1', name: 'A2' }], true), base)
  assert.notEqual(mergeById(base, [{ id: '2', name: 'B' }]), base)
})
