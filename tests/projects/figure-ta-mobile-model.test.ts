import assert from 'node:assert/strict'
import test from 'node:test'
import { delivered, taMobileModel, type TaMobileState } from '../../src/components/iso/figures/ta-mobile/model'
import type { FigureInput } from '../../src/components/iso/figure-contract'

const DONE: FigureInput = { progress: 1, pointer: null }
const DROPPED: FigureInput = { progress: 1, pointer: { x: 0.9, y: 0 } }

function run (inputs: FigureInput[], dt = 0.016) {
  let state = taMobileModel.init()
  const states: TaMobileState[] = []
  const readouts: string[] = []
  for (const input of inputs) {
    state = taMobileModel.step(state, dt, input)
    states.push(state)
    readouts.push(taMobileModel.readout(state))
  }
  return { state, states, readouts }
}

const hold = (input: FigureInput, frames: number) => Array.from({ length: frames }, () => input)

test('a fresh card reads journal draft', () => {
  const state = taMobileModel.step(taMobileModel.init(), 0.016, { progress: 0, pointer: null })
  assert.equal(taMobileModel.readout(state), 'journal draft')
})

test('holding progress at 1 with a connection syncs the card into the rack', () => {
  const { state } = run(hold(DONE, 600))
  assert.equal(taMobileModel.readout(state), 'synced')
  assert.ok(delivered(state))
})

test('a card in the outbox with a connection but before the flush reads queued', () => {
  const { state } = run(hold({ progress: 0.5, pointer: null }, 300))
  assert.equal(taMobileModel.readout(state), 'queued · outbox 1')
  assert.ok(!delivered(state))
})

test('a dropped signal keeps the card queued in the outbox and never delivers it', () => {
  const { states, readouts } = run(hold(DROPPED, 600))
  assert.equal(readouts[readouts.length - 1], 'offline · outbox 1')
  assert.ok(states.every(state => state.flush === 0), 'the card never leaves the outbox')
  assert.ok(states.every(state => !delivered(state)))
})

test('a pointer within the tolerance keeps the connection', () => {
  const { state } = run(hold({ progress: 1, pointer: { x: 0.1, y: 0.8 } }, 600))
  assert.equal(taMobileModel.readout(state), 'synced')
})

test('synced is never shown while progress is under 0.9', () => {
  const inputs: FigureInput[] = [0, 0.2, 0.4, 0.5, 0.6, 0.75, 0.85, 0.89].flatMap(progress => hold({ progress, pointer: null }, 120))
  const { readouts } = run(inputs)
  assert.ok(readouts.every(text => text !== 'synced'))
})

test('the same inputs give the same states', () => {
  const inputs: FigureInput[] = [
    ...hold({ progress: 0.3, pointer: null }, 40),
    ...hold({ progress: 0.7, pointer: { x: -0.6, y: 0.2 } }, 30),
    ...hold(DONE, 50),
  ]
  const first = run(inputs)
  const second = run(inputs)
  assert.deepEqual(first.states, second.states)
  assert.deepEqual(first.readouts, second.readouts)
})

test('step leaves its input state untouched', () => {
  const before: TaMobileState = taMobileModel.step(taMobileModel.init(), 0.016, { progress: 0.6, pointer: null })
  const copy = structuredClone(before)
  taMobileModel.step(before, 0.016, { progress: 1, pointer: { x: 1, y: 0 } })
  assert.deepEqual(before, copy)
})
