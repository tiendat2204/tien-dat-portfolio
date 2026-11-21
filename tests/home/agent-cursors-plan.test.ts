import assert from 'node:assert/strict'
import { test } from 'node:test'

import { edgeInView, sectionAt, toLocalBox } from '../../src/lib/agent-cursors-plan'

const rect = (top: number, height: number, left = 100, width = 600) => ({ top, bottom: top + height, left, width })

test('edgeInView picks the first section whose top edge has room for a character', () => {
  // The first edge is under the header, the second is on screen, the third is too.
  assert.equal(edgeInView([rect(40, 300), rect(340, 300), rect(640, 300)], 800), 1)
  // An edge too close to the bottom of the view does not count.
  assert.equal(edgeInView([rect(-900, 1600), rect(700, 300)], 800), -1)
  assert.equal(edgeInView([], 800), -1)
})

test('sectionAt finds the section under a viewport y', () => {
  const rects = [rect(-500, 600), rect(100, 400), rect(500, 400)]
  assert.equal(sectionAt(rects, 400), 1)
  assert.equal(sectionAt(rects, 500), 2)
  assert.equal(sectionAt(rects, 2000), -1)
})

test('toLocalBox clips to the viewport and converts to overlay coordinates', () => {
  const root = rect(-500, 4000, 80, 768)
  assert.deepEqual(toLocalBox(rect(-200, 1500), root, 800), { x: 20, y: 572, w: 600, h: 704 })
  assert.deepEqual(toLocalBox(rect(200, 100), root, 800), { x: 20, y: 700, w: 600, h: 100 })
})
