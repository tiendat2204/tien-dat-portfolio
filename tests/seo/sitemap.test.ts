import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSitemapEntries } from '../../src/lib/seo/sitemap'

test('buildSitemapEntries lists static pages then posts with trailing slashes', () => {
  const r = buildSitemapEntries('https://tiendat.work/', [{ slug: 'a', publishedAt: '2025-07-05' }], new Date('2026-10-21'))
  assert.deepEqual(r.map(e => e.url), ['https://tiendat.work/', 'https://tiendat.work/blog/', 'https://tiendat.work/uses/', 'https://tiendat.work/components/', 'https://tiendat.work/blog/a/'])
  assert.equal((r[4].lastModified as Date).toISOString().slice(0, 10), '2025-07-05')
})

test('buildSitemapEntries omits lastModified for invalid dates', () => {
  const r = buildSitemapEntries('https://tiendat.work', [{ slug: 'b', publishedAt: 'nope' }], new Date())
  assert.equal(r[4].lastModified, undefined)
})

test('buildSitemapEntries omits lastModified for compact dates that Date cannot parse', () => {
  const r = buildSitemapEntries('https://tiendat.work', [{ slug: 'c', publishedAt: '20250705' }], new Date())
  assert.equal(r[4].lastModified, undefined)
})

test('buildSitemapEntries lists component docs under /components after posts', () => {
  const r = buildSitemapEntries('https://tiendat.work', [{ slug: 'a', publishedAt: '2025-07-05' }], new Date(), [{ slug: 'sticker-animation', publishedAt: '2024-12-06' }])
  assert.equal(r[5].url, 'https://tiendat.work/components/sticker-animation/')
  assert.equal((r[5].lastModified as Date).toISOString().slice(0, 10), '2024-12-06')
})
