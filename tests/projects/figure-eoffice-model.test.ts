import assert from 'node:assert/strict'
import test from 'node:test'
import { eofficeModel, poseOf, type EofficeState } from '../../src/components/iso/figures/eoffice/model'
import type { FigureInput } from '../../src/components/iso/figure-contract'

const START: FigureInput = { progress: 0, pointer: null }
const DONE: FigureInput = { progress: 1, pointer: null }

function run (inputs: FigureInput[], dt = 0.016, from = eofficeModel.init()) {
  let state = from
  const states: EofficeState[] = []
  const readouts: string[] = []
  for (const input of inputs) {
    state = eofficeModel.step(state, dt, input)
    states.push(state)
    readouts.push(eofficeModel.readout(state))
  }
  return { state, states, readouts }
}

const hold = (input: FigureInput, count: number) => Array.from({ length: count }, () => input)

test('a fresh document reads step 1/3', () => {
  assert.equal(eofficeModel.readout(eofficeModel.init()), 'step 1/3')
  const state = eofficeModel.step(eofficeModel.init(), 0.016, START)
  assert.equal(eofficeModel.readout(state), 'step 1/3')
})

test('holding progress at 1 routes the document to step 3/3', () => {
  const { state } = run(hold(DONE, 600))
  assert.equal(eofficeModel.readout(state), 'step 3/3')
  const pose = poseOf(state)
  assert.deepEqual(pose.stamped, [true, true, true])
  assert.ok(pose.gates.every(open => Math.abs(open - 1) < 1e-9), 'every gate stands open')
})

test('readouts only ever say step 1/3, 2/3 or 3/3, and pass through each', () => {
  const { readouts } = run([...hold({ progress: 0.5, pointer: null }, 300), ...hold(DONE, 300)])
  assert.ok(readouts.every(text => /^step [123]\/3$/.test(text)))
  for (const text of ['step 1/3', 'step 2/3', 'step 3/3']) assert.ok(readouts.includes(text), `passes ${text}`)
})

test('a gate is never open while its station has not stamped', () => {
  const sweep: FigureInput[] = []
  for (let index = 0; index <= 100; index++) sweep.push(...hold({ progress: index / 100, pointer: null }, 12))
  for (let index = 100; index >= 0; index -= 5) sweep.push(...hold({ progress: index / 100, pointer: { x: 0, y: 0 } }, 8))
  const { states } = run(sweep)
  let checked = 0
  for (const state of states) {
    const pose = poseOf(state)
    pose.gates.forEach((open, station) => {
      assert.ok(open >= 0 && open <= 1)
      if (open > 0) assert.ok(pose.stamped[station], `gate ${station + 1} open at travel ${state.travel} before its stamp`)
    })
    checked++
  }
  assert.ok(checked > 1000)
  for (let index = 0; index <= 1000; index++) {
    const pose = poseOf({ ...eofficeModel.init(), travel: index / 1000 })
    pose.gates.forEach((open, station) => {
      if (open > 0) assert.ok(pose.stamped[station])
    })
  }
})

test('stamps, gates and the stage only grow as the document moves on', () => {
  let last = poseOf(eofficeModel.init())
  for (let index = 1; index <= 1000; index++) {
    const pose = poseOf({ ...eofficeModel.init(), travel: index / 1000 })
    assert.ok(pose.x >= last.x - 1e-9)
    assert.ok(pose.stage >= last.stage)
    pose.gates.forEach((open, station) => assert.ok(open >= last.gates[station] - 1e-9))
    pose.stamped.forEach((made, station) => assert.ok(made || !last.stamped[station]))
    last = pose
  }
})

test('the same inputs give the same states', () => {
  const inputs: FigureInput[] = [
    ...hold({ progress: 0.3, pointer: null }, 40),
    ...hold({ progress: 0.7, pointer: { x: -0.5, y: 0.2 } }, 30),
    ...hold(DONE, 50),
  ]
  const first = run(inputs)
  const second = run(inputs)
  assert.deepEqual(first.state, second.state)
  assert.deepEqual(first.readouts, second.readouts)
})

test('step leaves its input state untouched', () => {
  const before: EofficeState = eofficeModel.step(eofficeModel.init(), 0.016, { progress: 0.2, pointer: null })
  const copy = structuredClone(before)
  eofficeModel.step(before, 0.016, { progress: 0.9, pointer: { x: 1, y: 0 } })
  assert.deepEqual(before, copy)
})
