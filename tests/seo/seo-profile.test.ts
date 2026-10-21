import assert from 'node:assert/strict'
import test from 'node:test'
import { SEO_PROFILE } from '../../src/data/seo'

test('SEO_PROFILE description is one sentence under 160 chars', () => {
  assert.ok(SEO_PROFILE.description.length <= 160)
  assert.match(SEO_PROFILE.description, /fullstack/i)
})

test('SEO_PROFILE alternateNames excludes primary name', () => {
  assert.deepEqual(SEO_PROFILE.alternateNames, ['Triệu Tiến Đạt', 'Trieu Tien Dat', 'Tiến Đạt', 'tiendat2204', 'tiendat.work'])
  assert.equal(SEO_PROFILE.keywords[0], 'Tien Dat')
})
