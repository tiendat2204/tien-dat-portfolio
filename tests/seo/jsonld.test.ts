import assert from 'node:assert/strict'
import test from 'node:test'
import dayjs from 'dayjs'

import { buildBlogPostingJsonLd } from '../../src/lib/seo/jsonld'

test('buildBlogPostingJsonLd builds schema.org BlogPosting payload', () => {
  const result = buildBlogPostingJsonLd({
    slug: 'hello-world',
    title: 'Hello World',
    description: 'My first blog post',
    publishedAt: '2024-06-01',
    siteUrl: 'https://tiendatdev.me/',
    author: {
      name: 'Tiến Đạt',
      identifier: 'tiendat2204',
      image: 'https://assets.tiendatdev/images/avatar.jpeg',
    },
  })

  assert.equal(result['@context'], 'https://schema.org')
  assert.equal(result['@type'], 'BlogPosting')
  assert.equal(result.headline, 'Hello World')
  assert.equal(result.description, 'My first blog post')
  assert.equal(result.image, '/og/simple?title=Hello%20World')
  assert.equal(result.url, 'https://tiendatdev.me/blog/hello-world')
  assert.equal(result.datePublished, dayjs('2024-06-01').toISOString())
  assert.equal(result.dateModified, dayjs('2024-06-01').toISOString())
  assert.deepEqual(result.author, {
    '@type': 'Person',
    name: 'Tiến Đạt',
    identifier: 'tiendat2204',
    image: 'https://assets.tiendatdev/images/avatar.jpeg',
  })
})
