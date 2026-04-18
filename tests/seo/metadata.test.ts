import assert from 'node:assert/strict'
import test from 'node:test'
import { buildCanonicalUrl, buildMissingPostMetadata, buildOgImageUrl } from '../../src/lib/seo/metadata'

test('buildCanonicalUrl joins base URL and route path', () => {
  assert.equal(
    buildCanonicalUrl('https://tiendatdev.me/', '/blog/my-post'),
    'https://tiendatdev.me/blog/my-post'
  )
})

test('buildCanonicalUrl normalizes missing leading slash', () => {
  assert.equal(
    buildCanonicalUrl('https://tiendatdev.me', 'blog'),
    'https://tiendatdev.me/blog'
  )
})

test('buildOgImageUrl falls back to generated OG endpoint', () => {
  assert.equal(
    buildOgImageUrl(undefined, 'Hello Next'),
    '/og/simple?title=Hello%20Next'
  )
})

test('buildMissingPostMetadata marks missing slugs as noindex', () => {
  const metadata = buildMissingPostMetadata('missing-slug')
  assert.equal(metadata.robots?.index, false)
  assert.equal(metadata.robots?.follow, false)
})
