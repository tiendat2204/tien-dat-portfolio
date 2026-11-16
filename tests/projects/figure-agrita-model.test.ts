import assert from 'node:assert/strict'
import test from 'node:test'
import { agritaModel, PRINT_POINT, type AgritaState } from '../../src/components/iso/figures/agrita/model'
import type { FigureInput } from '../../src/components/iso/figure-contract'

const NO_QR = 'lot 1 · no QR yet'
const QR = 'lot 1 · QR active'

function run (inputs: FigureInput[], dt = 0.016) {
  let state = agritaModel.init()
  const readouts: string[] = []
  for (const input of inputs) {
    state = agritaModel.step(state, dt, input)
    readouts.push(agritaModel.readout(state))
  }
  return { state, readouts }
}

const hold = (progress: number, count: number, pointer: FigureInput['pointer'] = null): FigureInput[] =>
  Array.from({ length: count }, () => ({ progress, pointer }))

test('a fresh lot has no QR yet', () => {
  const state = agritaModel.step(agritaModel.init(), 0.016, { progress: 0, pointer: null })
  assert.equal(agritaModel.readout(state), NO_QR)
})

test('holding progress at 1 prints and stamps the QR label', () => {
  const { state } = run(hold(1, 600))
  assert.equal(agritaModel.readout(state), QR)
})

test('the QR is never active while progress is below the print point', () => {
  const inputs: FigureInput[] = []
  for (let index = 0; index <= 400; index++) inputs.push(...hold(index / 400, 3))
  const { readouts } = run(inputs)
  readouts.forEach((text, index) => {
    if (inputs[index].progress < PRINT_POINT) assert.equal(text, NO_QR, `active at progress ${inputs[index].progress}`)
  })
  assert.equal(readouts[readouts.length - 1], QR)
})

test('once active, the QR stays active while progress holds at 1', () => {
  const { readouts } = run(hold(1, 900))
  const first = readouts.indexOf(QR)
  assert.ok(first > 0, 'turns active after a while')
  assert.ok(readouts.slice(first).every(text => text === QR))
})

test('a lot short of the print point never shows a QR, however long it waits', () => {
  const { readouts } = run(hold(PRINT_POINT - 0.02, 900))
  assert.ok(readouts.every(text => text === NO_QR))
})

test('a pointer jogs the lot without printing it', () => {
  const { readouts } = run(hold(0.3, 300, { x: 1, y: 0 }))
  assert.ok(readouts.every(text => text === NO_QR))
})

test('the same inputs give the same states', () => {
  const inputs: FigureInput[] = [
    ...hold(0.3, 40),
    ...hold(0.7, 30, { x: -0.5, y: 0.2 }),
    ...hold(1, 120),
  ]
  const first = run(inputs)
  const second = run(inputs)
  assert.deepEqual(first.state, second.state)
  assert.deepEqual(first.readouts, second.readouts)
})

test('step leaves its input state untouched', () => {
  const before: AgritaState = agritaModel.step(agritaModel.init(), 0.016, { progress: 0.2, pointer: null })
  const copy = structuredClone(before)
  agritaModel.step(before, 0.016, { progress: 0.9, pointer: { x: 1, y: 0 } })
  assert.deepEqual(before, copy)
})
