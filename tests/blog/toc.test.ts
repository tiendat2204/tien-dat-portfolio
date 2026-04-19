import assert from 'node:assert/strict'
import test from 'node:test'

import type { TOCItemType } from 'fumadocs-core/server'

import { filterBlogTOCItems } from '../../src/lib/blog/toc'

const tocFixture: TOCItemType[] = [
  { title: 'Intro', url: '#intro', depth: 2 },
  { title: 'Details', url: '#details', depth: 3 },
  { title: 'Skip h4', url: '#skip-h4', depth: 4 },
  { title: '', url: '#empty-title', depth: 2 },
  { title: 'No Hash', url: '/external', depth: 2 },
]

test('filterBlogTOCItems keeps only valid H2 and H3 heading links', () => {
  const result = filterBlogTOCItems(tocFixture)

  assert.deepEqual(
    result.map((item) => ({ title: item.title, url: item.url, depth: item.depth })),
    [
      { title: 'Intro', url: '#intro', depth: 2 },
      { title: 'Details', url: '#details', depth: 3 },
    ]
  )
})

test('filterBlogTOCItems returns empty list when no eligible headings exist', () => {
  const result = filterBlogTOCItems([{ title: 'Deep', url: '#deep', depth: 4 }])

  assert.equal(result.length, 0)
})
