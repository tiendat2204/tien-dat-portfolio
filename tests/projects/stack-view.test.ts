import assert from 'node:assert/strict'
import test from 'node:test'
import { layout, plateOffset } from '../../src/components/iso/stack/geometry'
import { balloonAnchors, bomRows, centerlines, scanClip, titleBlockOf } from '../../src/components/iso/stack/sheet-parts'
import type { StackConfig } from '../../src/components/iso/stack/types'

const COUNTS = [1, 4, 8]

function finite (offset: { x: number, y: number, z: number }): boolean {
  return [offset.x, offset.y, offset.z].every(Number.isFinite)
}

test('layout(n) gives one offset per plate with z strictly increasing', () => {
  for (const n of COUNTS) {
    const { plateOffsets } = layout(n)
    assert.equal(plateOffsets.length, n, `n = ${n}`)
    for (let i = 1; i < n; i++) assert.ok(plateOffsets[i].z > plateOffsets[i - 1].z, `n = ${n}, i = ${i}`)
  }
})

test('layout(n) gives a finite viewBox with a positive size', () => {
  for (const n of COUNTS) {
    const { viewBox } = layout(n)
    assert.equal(viewBox.length, 4)
    assert.ok(viewBox.every(Number.isFinite), `n = ${n}`)
    assert.ok(viewBox[2] > 0 && viewBox[3] > 0, `n = ${n}`)
  }
})

test('the viewBox is wide enough for the drawing to lead the card (5 layers at least 1.35 : 1)', () => {
  const [, , width, height] = layout(5).viewBox
  assert.ok(width / height >= 1.35, `ratio ${(width / height).toFixed(2)}`)
  const ratios = [1, 4, 5, 6, 8].map(n => layout(n).viewBox[2] / layout(n).viewBox[3])
  for (let i = 1; i < ratios.length; i++) assert.ok(ratios[i] < ratios[i - 1], 'taller with more layers')
})

test('plateOffset at explode 0 is the assembled position', () => {
  const stack = layout(5)
  for (let i = 0; i < 5; i++) assert.deepEqual(plateOffset(stack, i, 0), stack.plateOffsets[i])
})

test('plateOffset at explode 1 separates the plates more than at explode 0', () => {
  const stack = layout(5)
  for (let i = 1; i < 5; i++) {
    const assembled = plateOffset(stack, i, 0).z - plateOffset(stack, i - 1, 0).z
    const exploded = plateOffset(stack, i, 1).z - plateOffset(stack, i - 1, 1).z
    assert.ok(exploded > assembled, `gap ${i}: ${exploded} > ${assembled}`)
  }
})

test('plateOffset keeps z strictly increasing at every explode amount', () => {
  for (const n of COUNTS) {
    const stack = layout(n)
    for (const explode of [0, 0.25, 0.5, 1]) {
      for (let i = 1; i < n; i++) assert.ok(plateOffset(stack, i, explode).z > plateOffset(stack, i - 1, explode).z)
    }
  }
})

test('no offset is NaN, even for out-of-range explode values', () => {
  for (const n of COUNTS) {
    const stack = layout(n)
    assert.ok(stack.plateOffsets.every(finite))
    for (const explode of [-1, 0, 0.5, 1, 2, Number.NaN]) {
      for (let i = 0; i < n; i++) assert.ok(finite(plateOffset(stack, i, explode)), `n ${n} i ${i} explode ${explode}`)
    }
  }
})

// --- The spec sheet's pure parts ----------------------------------------------------------------------------------

const SHEET_CONFIG: StackConfig = {
  id: 'agrita',
  fig: 2,
  title: 'Sample stack',
  hint: 'scroll',
  skin: 'dashboard',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'Next.js', 'shadcn/ui'] },
    { id: 'api', label: 'api', tech: ['NestJS'] },
    { id: 'orm', label: 'orm', tech: [] },
  ],
  side: [{ id: 'map', label: 'map', tech: ['Leaflet'] }],
  steps: [],
}

const lengthOf = ({ x1, y1, x2, y2 }: { x1: number, y1: number, x2: number, y2: number }) => Math.hypot(x2 - x1, y2 - y1)

test('bomRows numbers the layers 1..N in layer order and joins their tech with a middle dot', () => {
  const rows = bomRows(SHEET_CONFIG)
  assert.deepEqual(rows, [
    { n: 1, label: 'ui', tech: 'React 19 · Next.js · shadcn/ui' },
    { n: 2, label: 'api', tech: 'NestJS' },
    { n: 3, label: 'orm', tech: '' },
  ])
})

test('balloonAnchors gives one balloon per layer, numbered 1..N, lower on the sheet as n grows', () => {
  for (const n of COUNTS) {
    const stack = layout(n)
    for (const explode of [0, 0.5, 1]) {
      const balloons = balloonAnchors(stack, explode)
      assert.equal(balloons.length, n)
      assert.deepEqual(balloons.map(balloon => balloon.n), Array.from({ length: n }, (_, k) => k + 1))
      for (const balloon of balloons) assert.ok([balloon.x, balloon.y, ...balloon.from].every(Number.isFinite))
      for (let k = 1; k < n; k++) assert.ok(balloons[k].y > balloons[k - 1].y, `n ${n} explode ${explode} k ${k}`)
    }
  }
})

test('balloons sit to the right of the part their leader starts on, inside the viewBox', () => {
  for (const n of COUNTS) {
    const stack = layout(n)
    const [, , width, height] = stack.viewBox
    for (const balloon of balloonAnchors(stack, 1)) {
      assert.ok(balloon.x > balloon.from[0], 'right of its part')
      assert.ok(balloon.x < width && balloon.y > 0 && balloon.y < height, 'inside the viewBox')
    }
  }
})

test('centerlines have zero length when assembled and grow as the stack opens', () => {
  for (const n of COUNTS) {
    const stack = layout(n)
    const closed = centerlines(stack, 0)
    const half = centerlines(stack, 0.5)
    const open = centerlines(stack, 1)
    assert.ok(open.length >= 1)
    closed.forEach((line, i) => {
      assert.ok(lengthOf(line) < 1e-9, `closed ${i}`)
      assert.ok(lengthOf(half[i]) > lengthOf(line))
      assert.ok(lengthOf(open[i]) > lengthOf(half[i]))
      assert.ok(Math.abs(open[i].x1 - open[i].x2) < 1e-9, 'vertical on the sheet')
    })
  }
})

test('titleBlockOf holds exactly title, sheet, view and drawn', () => {
  assert.deepEqual(titleBlockOf(SHEET_CONFIG, 'Tiến Đạt', 'assembly'), { title: 'Sample stack', sheet: 'Fig 2 / 8', view: 'Assembly', drawn: 'Tiến Đạt' })
  assert.equal(titleBlockOf(SHEET_CONFIG, 'Someone', 'skin').view, 'Skin')
  assert.equal(titleBlockOf(SHEET_CONFIG, 'Someone', 'skin').drawn, 'Someone')
})

test('scanClip hides the skeleton at 0, shows it all at 1 and opens monotonically', () => {
  const bottom = (value: string) => {
    const match = /^inset\(0(?:%|px)? 0(?:%|px)? ([\d.]+)% 0(?:%|px)?\)$/.exec(value)
    assert.ok(match, value)
    return Number(match[1])
  }
  assert.equal(bottom(scanClip(0)), 100)
  assert.equal(bottom(scanClip(1)), 0)
  let last = Infinity
  for (let i = 0; i <= 40; i++) {
    const value = bottom(scanClip(i / 40))
    assert.ok(value <= last, `scan ${i / 40}`)
    last = value
  }
  for (const odd of [-1, 2, Number.NaN]) assert.ok(Number.isFinite(bottom(scanClip(odd))))
})
