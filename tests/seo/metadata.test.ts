import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCanonicalUrl, buildMissingPostMetadata, buildOgImageUrl, buildPageMetadata } from '../../src/lib/seo/metadata'

test('buildCanonicalUrl joins base URL and route path with trailing slash', () => {
  assert.equal(
    buildCanonicalUrl('https://tiendatdev.me/', '/blog/my-post'),
    'https://tiendatdev.me/blog/my-post/'
  )
})

test('buildCanonicalUrl normalizes missing leading slash', () => {
  assert.equal(
    buildCanonicalUrl('https://tiendatdev.me', 'blog'),
    'https://tiendatdev.me/blog/'
  )
})

test('buildCanonicalUrl handles root path', () => {
  assert.equal(buildCanonicalUrl('https://tiendat.work/', '/'), 'https://tiendat.work/')
})

test('buildCanonicalUrl keeps existing trailing slash and query strings intact', () => {
  assert.equal(buildCanonicalUrl('https://tiendat.work', '/blog/'), 'https://tiendat.work/blog/')
  assert.equal(
    buildCanonicalUrl('https://tiendat.work', '/og/simple/?title=x'),
    'https://tiendat.work/og/simple/?title=x'
  )
})

test('buildOgImageUrl falls back to generated OG endpoint', () => {
  assert.equal(
    buildOgImageUrl(undefined, 'Hello Next'),
    '/og/simple/?title=Hello%20Next'
  )
})

test('buildMissingPostMetadata marks missing slugs as noindex', () => {
  const metadata = buildMissingPostMetadata('missing-slug')
  assert.equal(metadata.robots?.index, false)
  assert.equal(metadata.robots?.follow, false)
})

type OgShape = { url?: string, title?: string, type?: string, siteName?: string, locale?: string, images: { url: string, width?: number }[] }
type TwitterShape = { card?: string, images?: string[] }
const base = { siteUrl: 'https://tiendat.work/', siteName: 'Tien Dat' }

test('buildPageMetadata sets self canonical and og:url', () => {
  const m = buildPageMetadata({ ...base, path: '/blog', title: 'Blog', description: 'd' })
  assert.equal(m.alternates?.canonical, 'https://tiendat.work/blog/')
  assert.equal((m.openGraph as OgShape).url, 'https://tiendat.work/blog/')
  assert.equal(m.title, 'Blog')
  assert.equal((m.openGraph as OgShape).title, 'Blog – Tien Dat')
})

test('buildPageMetadata absoluteTitle', () => {
  const m = buildPageMetadata({ ...base, path: '/', title: 'Tien Dat – Fullstack Developer', description: 'd', absoluteTitle: true, type: 'profile' })
  assert.deepEqual(m.title, { absolute: 'Tien Dat – Fullstack Developer' })
  assert.equal((m.openGraph as OgShape).title, 'Tien Dat – Fullstack Developer')
  assert.equal((m.openGraph as OgShape).type, 'profile')
})

test('buildPageMetadata always includes rss alternate, siteName and locale', () => {
  const m = buildPageMetadata({ ...base, path: '/uses', title: 'Uses', description: 'd' })
  assert.deepEqual(m.alternates?.types, { 'application/rss+xml': 'https://tiendat.work/rss.xml' })
  assert.equal((m.openGraph as OgShape).siteName, 'Tien Dat')
  assert.equal((m.openGraph as OgShape).locale, 'en_US')
})

test('buildPageMetadata falls back to generated OG image and mirrors it to twitter', () => {
  const m = buildPageMetadata({ ...base, path: '/uses', title: 'Uses', description: 'd' })
  assert.equal((m.openGraph as OgShape).images[0].url, '/og/simple/?title=Uses')
  assert.equal((m.twitter as TwitterShape).card, 'summary_large_image')
  assert.deepEqual((m.twitter as TwitterShape).images, ['/og/simple/?title=Uses'])
})

test('buildPageMetadata declares 1200x630 only for generated images', () => {
  const m = buildPageMetadata({ ...base, path: '/blog/x', title: 'X', description: 'd', image: '/blog/x.png', type: 'article' })
  assert.equal((m.openGraph as OgShape).images[0].width, undefined)
})
