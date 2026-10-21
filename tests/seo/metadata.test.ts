import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCanonicalUrl, buildMissingPostMetadata, buildOgImageUrl } from '../../src/lib/seo/metadata'

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
