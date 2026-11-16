import assert from 'node:assert/strict'
import test from 'node:test'
import { sectionHref } from '../../src/lib/nav'

test('sectionHref sends projects to its own page', () => {
  assert.equal(sectionHref('projects'), '/projects')
})

test('sectionHref anchors other sections on the home page', () => {
  assert.equal(sectionHref('about'), '/#about')
})
