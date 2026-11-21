import assert from 'node:assert/strict'
import { test } from 'node:test'

import { nextVisible, toLocalBox } from '../../src/lib/agent-cursors-plan'

const rect = (top: number, height: number, left = 100, width = 600) => ({ top, bottom: top + height, left, width })

test('nextVisible walks the on-screen sections in order and wraps around', () => {
  const rects = [rect(-900, 400), rect(100, 300), rect(420, 300), rect(1400, 300)]
  assert.equal(nextVisible(rects, 800, -1), 1)
  assert.equal(nextVisible(rects, 800, 1), 2)
  assert.equal(nextVisible(rects, 800, 2), 1)
})

test('nextVisible skips a section with only a sliver on screen and reports none', () => {
  assert.equal(nextVisible([rect(740, 300)], 800, -1), -1)
  assert.equal(nextVisible([], 800, -1), -1)
})

test('toLocalBox clips to the viewport and converts to overlay coordinates', () => {
  const root = rect(-500, 4000, 80, 768)
  assert.deepEqual(toLocalBox(rect(-200, 1500), root, 800), { x: 20, y: 572, w: 600, h: 704 })
  assert.deepEqual(toLocalBox(rect(200, 100), root, 800), { x: 20, y: 700, w: 600, h: 100 })
})

test('rowPoints spreads a row across a slice of the box width', async () => {
  const { rowPoints } = await import('../../src/lib/agent-cursors-plan')
  const box = { x: 0, y: 0, w: 300, h: 40 }
  assert.deepEqual(rowPoints(box, 40, 3, 1 / 3, 2 / 3).map((p) => Math.round(p.x)), [100, 150, 200])
  assert.deepEqual(rowPoints(box, 40, 1), [{ x: 150, y: 40 }])
})

test('checkPoints draws a tick: down to the corner, then up to the top right', async () => {
  const { checkPoints } = await import('../../src/lib/agent-cursors-plan')
  const points = checkPoints({ x: 100, y: 100 }, 100, 9)
  assert.equal(points.length, 9)
  assert.deepEqual(points[0], { x: 50, y: 100 })
  assert.deepEqual(points[3], { x: 86, y: 136 })
  assert.deepEqual(points[8], { x: 150, y: 64 })
  assert.ok(points[1].y > points[0].y && points[5].y < points[4].y)
})
