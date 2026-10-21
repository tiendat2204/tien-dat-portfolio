import assert from 'node:assert/strict'
import test from 'node:test'
import dayjs from 'dayjs'

import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildProfilePageJsonLd,
  buildWebSiteJsonLd,
} from '../../src/lib/seo/jsonld'

test('buildBlogPostingJsonLd uses absolute image URL when image is omitted', () => {
  const result = buildBlogPostingJsonLd({
    slug: 'hello-world',
    title: 'Hello World',
    description: 'My first blog post',
    publishedAt: '2024-06-01',
    siteUrl: 'https://tiendatdev.me',
    authorName: 'Tien Dat',
  })

  assert.equal(result.image, 'https://tiendatdev.me/og/simple/?title=Hello%20World')
})

test('buildBlogPostingJsonLd normalizes trailing slash in site URL', () => {
  const result = buildBlogPostingJsonLd({
    slug: 'hello-world',
    title: 'Hello World',
    description: 'My first blog post',
    publishedAt: '2024-06-01',
    siteUrl: 'https://tiendatdev.me/',
    authorName: 'Tien Dat',
  })

  assert.equal(result.image, 'https://tiendatdev.me/og/simple/?title=Hello%20World')
})

test('buildBlogPostingJsonLd keeps explicit absolute image input', () => {
  const result = buildBlogPostingJsonLd({
    slug: 'hello-world',
    title: 'Hello World',
    description: 'My first blog post',
    image: 'https://cdn.tiendatdev.me/hello-world.webp',
    publishedAt: '2024-06-01',
    siteUrl: 'https://tiendatdev.me',
    authorName: 'Tien Dat',
  })

  assert.equal(result.image, 'https://cdn.tiendatdev.me/hello-world.webp')
})

test('buildBlogPostingJsonLd converts explicit image path to absolute URL', () => {
  const result = buildBlogPostingJsonLd({
    slug: 'hello-world',
    title: 'Hello World',
    description: 'My first blog post',
    image: '/images/hello-world.webp',
    publishedAt: '2024-06-01',
    siteUrl: 'https://tiendatdev.me',
    authorName: 'Tien Dat',
  })

  assert.equal(result.image, 'https://tiendatdev.me/images/hello-world.webp')
})

test('buildBlogPostingJsonLd builds schema.org BlogPosting payload', () => {
  const result = buildBlogPostingJsonLd({
    slug: 'hello-world',
    title: 'Hello World',
    description: 'My first blog post',
    publishedAt: '2024-06-01',
    siteUrl: 'https://tiendatdev.me/',
    authorName: 'Tien Dat',
  })

  assert.equal(result['@context'], 'https://schema.org')
  assert.equal(result['@type'], 'BlogPosting')
  assert.equal(result.headline, 'Hello World')
  assert.equal(result.description, 'My first blog post')
  assert.equal(result.image, 'https://tiendatdev.me/og/simple/?title=Hello%20World')
  assert.equal(result.url, 'https://tiendatdev.me/blog/hello-world/')
  assert.equal(result.datePublished, dayjs('2024-06-01').toISOString())
  assert.equal(result.dateModified, dayjs('2024-06-01').toISOString())
  assert.deepEqual(result.author, { '@id': 'https://tiendatdev.me/#person' })
})

test('buildBlogPostingJsonLd does not throw on invalid publishedAt input', () => {
  let result: ReturnType<typeof buildBlogPostingJsonLd> | undefined

  assert.doesNotThrow(() => {
    result = buildBlogPostingJsonLd({
      slug: 'hello-world',
      title: 'Hello World',
      description: 'My first blog post',
      publishedAt: 'not-a-date',
      siteUrl: 'https://tiendatdev.me',
      authorName: 'Tien Dat',
    })
  })

  assert.equal(result?.datePublished, undefined)
  assert.equal(result?.dateModified, undefined)
})

test('buildBlogPostingJsonLd falls back to safe URLs when siteUrl is malformed', () => {
  let result: ReturnType<typeof buildBlogPostingJsonLd> | undefined

  assert.doesNotThrow(() => {
    result = buildBlogPostingJsonLd({
      slug: 'hello-world',
      title: 'Hello World',
      description: 'My first blog post',
      image: '/images/hello-world.webp',
      publishedAt: '2024-06-01',
      siteUrl: 'not-a-valid-url',
      authorName: 'Tien Dat',
    })
  })

  assert.equal(result?.image, 'https://example.com/images/hello-world.webp')
  assert.equal(result?.url, 'https://example.com/blog/hello-world/')
})

const validInput = {
  slug: 'hello-world',
  title: 'Hello World',
  description: 'My first blog post',
  publishedAt: '2024-06-01',
  siteUrl: 'https://tiendatdev.me',
  authorName: 'Tien Dat',
}

test('buildBlogPostingJsonLd links to blog and person', () => {
  const r = buildBlogPostingJsonLd({ ...validInput })
  assert.equal(r['@id'], 'https://tiendatdev.me/blog/hello-world/')
  assert.equal(r.mainEntityOfPage, 'https://tiendatdev.me/blog/hello-world/')
  assert.equal((r.isPartOf as any)['@id'], 'https://tiendatdev.me/blog/')
})

test('buildWebSiteJsonLd embeds person with sameAs and absolute image', () => {
  const r = buildWebSiteJsonLd({ siteUrl: 'https://tiendat.work/', name: 'Tien Dat', alternateName: ['Triệu Tiến Đạt'], jobTitle: 'Fullstack Developer', image: '/me.jpg', sameAs: ['https://github.com/tiendat2204'] })
  assert.equal(r['@id'], 'https://tiendat.work/#website')
  assert.equal((r.author as any)['@id'], 'https://tiendat.work/#person')
  assert.equal((r.author as any).image, 'https://tiendat.work/me.jpg')
  assert.deepEqual((r.author as any).sameAs, ['https://github.com/tiendat2204'])
})

test('buildProfilePageJsonLd references person', () => {
  const r = buildProfilePageJsonLd({ siteUrl: 'https://tiendat.work', dateCreated: '2024-06-01', dateModified: '2026-10-21' })
  assert.deepEqual(r.mainEntity, { '@id': 'https://tiendat.work/#person' })
})

test('buildBreadcrumbJsonLd numbers items from 1 with canonical urls', () => {
  const r = buildBreadcrumbJsonLd('https://tiendat.work', [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])
  assert.equal((r.itemListElement as any)[1].position, 2)
  assert.equal((r.itemListElement as any)[1].item, 'https://tiendat.work/blog/')
})
