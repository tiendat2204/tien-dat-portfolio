import assert from 'node:assert/strict'
import { test } from 'node:test'

import { mostVisible, sectionAt } from '../../src/lib/agent-cursors-plan'

const rect = (top: number, height: number) => ({ top, bottom: top + height })

test('sectionAt finds the section under a viewport y', () => {
  const rects = [rect(-500, 600), rect(100, 400), rect(500, 400)]
  assert.equal(sectionAt(rects, 400), 1)
  assert.equal(sectionAt(rects, 500), 2)
  assert.equal(sectionAt(rects, 2000), -1)
})

test('mostVisible picks the section with the most on screen, and none when nothing shows', () => {
  // The last section shows 300px above a footer; the one before it only 40px.
  assert.equal(mostVisible([rect(-900, 400), rect(-360, 400), rect(40, 300)], 720), 2)
  // Under the header does not count.
  assert.equal(mostVisible([rect(-300, 350), rect(50, 40)], 720, 57), 1)
  assert.equal(mostVisible([rect(-900, 400), rect(900, 400)], 720), -1)
})
