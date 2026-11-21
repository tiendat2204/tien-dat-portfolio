import assert from 'node:assert/strict'
import { test } from 'node:test'

import { sectionAt } from '../../src/lib/agent-cursors-plan'

const rect = (top: number, height: number) => ({ top, bottom: top + height })

test('sectionAt finds the section under a viewport y', () => {
  const rects = [rect(-500, 600), rect(100, 400), rect(500, 400)]
  assert.equal(sectionAt(rects, 400), 1)
  assert.equal(sectionAt(rects, 500), 2)
  assert.equal(sectionAt(rects, 2000), -1)
})
