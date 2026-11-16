import assert from 'node:assert/strict'
import test from 'node:test'
import { libraryModel, PRESS_AT, stampPress, type LibraryState } from '../../src/components/iso/figures/library/model'
import type { FigureInput } from '../../src/components/iso/figure-contract'

const BROWSING = '40,000+ books · browsing'
const RECORDED = '40,000+ books · loan recorded'

function run (inputs: FigureInput[], dt = 0.016, from: LibraryState = libraryModel.init()) {
  let state = from
  const readouts: string[] = []
  for (const input of inputs) {
    state = libraryModel.step(state, dt, input)
    readouts.push(libraryModel.readout(state))
  }
  return { state, readouts }
}

const hold = (progress: number, count = 600): FigureInput[] => Array.from({ length: count }, () => ({ progress, pointer: null }))

test('a closed catalog reads browsing at progress 0', () => {
  assert.equal(libraryModel.readout(libraryModel.init()), BROWSING)
  const { state } = run(hold(0, 60))
  assert.equal(libraryModel.readout(state), BROWSING)
})

test('holding progress at 1 records the loan', () => {
  const { state } = run(hold(1))
  assert.equal(libraryModel.readout(state), RECORDED)
})

test('the stamp reaches the card exactly at PRESS_AT and is up again at both ends', () => {
  assert.ok(Math.abs(stampPress(PRESS_AT) - 1) < 1e-9)
  assert.ok(stampPress(0) < 1e-9)
  assert.ok(stampPress(1) < 1e-9)
  assert.ok(stampPress(PRESS_AT - 0.05) < 1)
})

test('across a sweep of held progress values the loan is recorded only once the stamp has pressed', () => {
  for (let index = 0; index <= 100; index++) {
    const progress = index / 100
    const { state, readouts } = run(hold(progress, 400))
    const pressed = progress >= PRESS_AT
    assert.equal(libraryModel.readout(state), pressed ? RECORDED : BROWSING, `progress ${progress}`)
    if (!pressed) assert.ok(readouts.every(text => text === BROWSING), `never recorded on the way to ${progress}`)
  }
})

test('scrolling through records the loan no earlier than the stamp press, and keeps it', () => {
  let state = libraryModel.init()
  let pressedOnce = false
  let recordedOnce = false
  for (let index = 0; index <= 400; index++) {
    state = libraryModel.step(state, 0.016, { progress: index / 400, pointer: null })
    if (state.flow >= PRESS_AT) pressedOnce = true
    const recorded = libraryModel.readout(state) === RECORDED
    if (recorded) assert.ok(pressedOnce, `recorded before the stamp pressed at step ${index}`)
    if (recordedOnce) assert.ok(recorded, `the loan was dropped at step ${index}`)
    recordedOnce ||= recorded
  }
  assert.ok(recordedOnce)
})

test('a large frame that jumps past the press still records the loan', () => {
  const { state } = run([{ progress: 1, pointer: null }], 5)
  assert.equal(libraryModel.readout(state), RECORDED)
})

test('a pointer opens the neighbouring drawer without touching the loan', () => {
  const { state } = run(hold(0.2, 300).map(input => ({ ...input, pointer: { x: -1, y: 0 } })))
  assert.ok(state.peek > 0.9)
  assert.equal(libraryModel.readout(state), BROWSING)
  const back = run(hold(0.2, 300), 0.016, state)
  assert.equal(back.state.peek, 0)
})

test('the same inputs give the same states', () => {
  const inputs: FigureInput[] = [
    ...hold(0.3, 40),
    ...Array.from({ length: 30 }, () => ({ progress: 0.75, pointer: { x: 0.4, y: -0.2 } })),
    ...hold(1, 50),
  ]
  const first = run(inputs)
  const second = run(inputs)
  assert.deepEqual(first.state, second.state)
  assert.deepEqual(first.readouts, second.readouts)
})

test('step leaves its input state untouched', () => {
  const before: LibraryState = libraryModel.step(libraryModel.init(), 0.016, { progress: 0.6, pointer: null })
  const copy = structuredClone(before)
  libraryModel.step(before, 0.5, { progress: 1, pointer: { x: 1, y: 0 } })
  assert.deepEqual(before, copy)
})
