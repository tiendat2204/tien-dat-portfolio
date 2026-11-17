import assert from 'node:assert/strict'
import test from 'node:test'
import { layout, plateOffset } from '../../src/components/iso/stack/geometry'

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
