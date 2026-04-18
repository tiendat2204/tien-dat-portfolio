import assert from 'node:assert/strict'
import test from 'node:test'

import { indexPostsBySlug, sortPostsNewestFirst } from '../../src/lib/blog/post-index'
import type { Post } from '../../src/types/blog'

const postsFixture: Post[] = [
  {
    slug: 'z-post',
    content: 'post z',
    metadata: {
      title: 'Post Z',
      summary: 'Summary Z',
      description: 'Description Z',
      publishedAt: '2024-06-01',
      tags: ['nextjs'],
    },
  },
  {
    slug: 'old-post',
    content: 'old post',
    metadata: {
      title: 'Old Post',
      summary: 'Summary old',
      description: 'Description old',
      publishedAt: '2023-05-10',
      tags: ['react'],
    },
  },
  {
    slug: 'a-post',
    content: 'post a',
    metadata: {
      title: 'Post A',
      summary: 'Summary A',
      description: 'Description A',
      publishedAt: '2024-06-01',
      tags: ['typescript'],
    },
  },
]

test('sortPostsNewestFirst sorts by newest date and slug for ties', () => {
  const sorted = sortPostsNewestFirst(postsFixture)

  assert.deepEqual(
    sorted.map((post) => post.slug),
    ['a-post', 'z-post', 'old-post']
  )
})

test('sortPostsNewestFirst does not mutate the input array order', () => {
  const originalOrder = postsFixture.map((post) => post.slug)

  sortPostsNewestFirst(postsFixture)

  assert.deepEqual(postsFixture.map((post) => post.slug), originalOrder)
})

test('indexPostsBySlug builds a slug lookup map', () => {
  const bySlug = indexPostsBySlug(postsFixture)

  assert.equal(bySlug.get('a-post'), postsFixture[2])
  assert.equal(bySlug.get('z-post'), postsFixture[0])
  assert.equal(bySlug.get('missing-post'), undefined)
})

test('sortPostsNewestFirst handles invalid dates deterministically', () => {
  const sorted = sortPostsNewestFirst([
    {
      slug: 'invalid-b',
      content: 'invalid b',
      metadata: {
        title: 'Invalid B',
        summary: 'Summary invalid b',
        description: 'Description invalid b',
        publishedAt: 'not-a-date',
        tags: [],
      },
    },
    {
      slug: 'valid-post',
      content: 'valid',
      metadata: {
        title: 'Valid',
        summary: 'Summary valid',
        description: 'Description valid',
        publishedAt: '2025-01-01',
        tags: [],
      },
    },
    {
      slug: 'invalid-a',
      content: 'invalid a',
      metadata: {
        title: 'Invalid A',
        summary: 'Summary invalid a',
        description: 'Description invalid a',
        publishedAt: 'also-not-a-date',
        tags: [],
      },
    },
  ])

  assert.deepEqual(
    sorted.map((post) => post.slug),
    ['valid-post', 'invalid-a', 'invalid-b']
  )
})
