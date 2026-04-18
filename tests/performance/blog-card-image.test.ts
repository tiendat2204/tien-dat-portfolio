import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { getBlogCardImageProps } from '../../src/lib/performance/blog-card-image'

test('getBlogCardImageProps returns lazy loading and responsive sizes', () => {
  const result = getBlogCardImageProps()

  assert.equal(result.loading, 'lazy')
  assert.equal(result.sizes, '(max-width: 768px) 100vw, 50vw')
})

test('BlogCard uses image loading and sizes from performance helper', () => {
  const testDir = dirname(fileURLToPath(import.meta.url))
  const blogCardPath = resolve(testDir, '../../src/app/section/blog/BlogCard.tsx')
  const source = readFileSync(blogCardPath, 'utf8')

  assert.match(source, /const imageProps = getBlogCardImageProps\(\)/)
  assert.match(source, /loading=\{imageProps\.loading\}/)
  assert.match(source, /sizes=\{imageProps\.sizes\}/)
})
