import assert from 'node:assert/strict'
import test from 'node:test'
import { buildSitemapEntries } from '../../src/lib/seo/sitemap'

test('buildSitemapEntries lists static pages then posts with trailing slashes', () => {
  const r = buildSitemapEntries('https://tiendat.work/', [{ slug: 'a', publishedAt: '2025-07-05' }], new Date('2026-10-21'))
  assert.deepEqual(r.map(e => e.url), ['https://tiendat.work/', 'https://tiendat.work/blog/', 'https://tiendat.work/uses/', 'https://tiendat.work/blog/a/'])
  assert.equal((r[3].lastModified as Date).toISOString().slice(0, 10), '2025-07-05')
})

test('buildSitemapEntries omits lastModified for invalid dates', () => {
  const r = buildSitemapEntries('https://tiendat.work', [{ slug: 'b', publishedAt: 'nope' }], new Date())
  assert.equal(r[3].lastModified, undefined)
})
