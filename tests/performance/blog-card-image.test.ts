import assert from 'node:assert/strict'
import test from 'node:test'

import { getBlogCardImageProps } from '../../src/lib/performance/blog-card-image'

test('getBlogCardImageProps returns lazy loading and responsive sizes', () => {
  const result = getBlogCardImageProps()

  assert.equal(result.loading, 'lazy')
  assert.equal(result.sizes, '(max-width: 768px) 100vw, 50vw')
})