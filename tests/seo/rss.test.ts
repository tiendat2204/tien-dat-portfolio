import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRssXml } from '../../src/lib/seo/rss'

const base = { siteUrl: 'https://tiendat.work/', title: 'Tien Dat', description: 'd', authorName: 'Tien Dat' }

test('buildRssXml lists posts with canonical links', () => {
  const xml = buildRssXml({ ...base, posts: [{ slug: 'a', title: 'A', description: 'x', publishedAt: '2025-07-05' }] })
  assert.match(xml, /<link>https:\/\/tiendat\.work\/blog\/a\/<\/link>/)
  assert.match(xml, /<pubDate>Sat, 05 Jul 2025/)
  assert.match(xml, /href="https:\/\/tiendat\.work\/rss\.xml"/)
})

test('buildRssXml escapes XML special characters', () => {
  const xml = buildRssXml({ ...base, posts: [{ slug: 'b', title: 'Dev\'s <Retreat> & "Fun"', description: 'x', publishedAt: '2025-05-20' }] })
  assert.match(xml, /Dev&apos;s &lt;Retreat&gt; &amp; &quot;Fun&quot;/)
})

test('buildRssXml omits pubDate for invalid dates', () => {
  const xml = buildRssXml({ ...base, posts: [{ slug: 'c', title: 'C', description: 'x', publishedAt: 'nope' }] })
  assert.doesNotMatch(xml, /<pubDate>/)
})

test('buildRssXml emits dc:creator per item', () => {
  const xml = buildRssXml({ ...base, posts: [{ slug: 'a', title: 'A', description: 'x', publishedAt: '2025-07-05' }] })
  assert.match(xml, /xmlns:dc="http:\/\/purl\.org\/dc\/elements\/1\.1\/"/)
  assert.match(xml, /<dc:creator>Tien Dat<\/dc:creator>/)
})
