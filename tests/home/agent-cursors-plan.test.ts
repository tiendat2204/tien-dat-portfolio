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

test('facePoints centres the dots of a face on its middle', async () => {
  const { facePoints } = await import('../../src/lib/agent-cursors-plan')
  assert.deepEqual(facePoints(['#.#', '.#.', '...'], 4), [{ x: -4, y: -4 }, { x: 4, y: -4 }, { x: 0, y: 0 }])
})

test('perimeterPoints walks the edge clockwise from the top-left corner', async () => {
  const { perimeterPoints } = await import('../../src/lib/agent-cursors-plan')
  const box = { x: 10, y: 20, w: 100, h: 50 }
  assert.deepEqual(perimeterPoints(box, 6), [
    { x: 10, y: 20 }, { x: 60, y: 20 }, { x: 110, y: 20 },
    { x: 110, y: 70 }, { x: 60, y: 70 }, { x: 10, y: 70 },
  ])
})

test('rowPoints spreads a row across a slice of the box width', async () => {
  const { rowPoints } = await import('../../src/lib/agent-cursors-plan')
  const box = { x: 0, y: 0, w: 300, h: 40 }
  assert.deepEqual(rowPoints(box, 40, 3, 1 / 3, 2 / 3).map((p) => Math.round(p.x)), [100, 150, 200])
  assert.deepEqual(rowPoints(box, 40, 1), [{ x: 150, y: 40 }])
})
