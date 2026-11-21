import assert from 'node:assert/strict'
import { test } from 'node:test'

import { sectionAt, wallSlots } from '../../src/lib/agent-cursors-plan'

const rect = (top: number, height: number) => ({ top, bottom: top + height })

test('sectionAt finds the section under a viewport y', () => {
  const rects = [rect(-500, 600), rect(100, 400), rect(500, 400)]
  assert.equal(sectionAt(rects, 400), 1)
  assert.equal(sectionAt(rects, 500), 2)
  assert.equal(sectionAt(rects, 2000), -1)
})

test('wallSlots lays courses bottom-up and shifts every other one half a brick', () => {
  const slots = wallSlots(3, 2, { w: 18, rise: 11 }, 100, 50)
  assert.deepEqual(slots, [
    { x: 100, y: 50 }, { x: 118, y: 50 }, { x: 136, y: 50 },
    { x: 109, y: 39 }, { x: 127, y: 39 }, { x: 145, y: 39 },
  ])
  assert.deepEqual(wallSlots(0, 3, { w: 18, rise: 11 }, 0, 0), [])
})
