import assert from 'node:assert/strict'
import test from 'node:test'
import { betatruyenModel, poseOf, stageOf } from '../../src/components/iso/figures/betatruyen/model'
import type { FigureInput } from '../../src/components/iso/figure-contract'

const STAGES = ['reading', 'commented', 'rating', 'ranked up']

function hold (input: FigureInput, frames: number, dt = 0.016) {
  let state = betatruyenModel.init()
  for (let frame = 0; frame < frames; frame++) state = betatruyenModel.step(state, dt, input)
  return state
}

test('a fresh desk is reading', () => {
  const state = betatruyenModel.step(betatruyenModel.init(), 0.016, { progress: 0, pointer: null })
  assert.equal(betatruyenModel.readout(state), 'reading · 10,000+ users')
})

test('holding progress at 1 ranks the story up', () => {
  const state = hold({ progress: 1, pointer: null }, 600)
  assert.equal(betatruyenModel.readout(state), 'ranked up · 10,000+ users')
})

test('the readout names each stage at its share of progress', () => {
  const at = (progress: number) => betatruyenModel.readout(hold({ progress, pointer: null }, 900))
  assert.equal(at(0.2), 'reading · 10,000+ users')
  assert.equal(at(0.5), 'commented · 10,000+ users')
  assert.equal(at(0.8), 'rating · 10,000+ users')
  assert.equal(at(0.97), 'ranked up · 10,000+ users')
})

test('the stage never goes backwards and the rank never rises before the comment is pinned', () => {
  let stage = 0
  for (let index = 0; index <= 1000; index++) {
    const run = index / 1000
    const next = stageOf(run)
    assert.ok(next >= stage, `stage fell at ${run}`)
    stage = next
    const pose = poseOf({ run, nudge: 0 })
    if (pose.rank > 0) assert.equal(pose.pin, 1, `rank moved before the pin at ${run}`)
  }
  assert.equal(stage, STAGES.length - 1)
})

test('stepping toward a rising progress never lowers the stage', () => {
  let state = betatruyenModel.init()
  let stage = 0
  for (let frame = 0; frame < 900; frame++) {
    state = betatruyenModel.step(state, 0.016, { progress: Math.min(1, frame / 600), pointer: null })
    const now = STAGES.indexOf(betatruyenModel.readout(state).split(' · ')[0])
    assert.ok(now >= stage)
    stage = now
  }
  assert.equal(stage, 3)
})

test('a pointer nudges the lever, and only the pointer x is read', () => {
  const left = hold({ progress: 0.5, pointer: { x: -1, y: 0.3 } }, 300)
  const other = hold({ progress: 0.5, pointer: { x: -1, y: -0.9 } }, 300)
  assert.ok(left.nudge < 0)
  assert.deepEqual(left, other)
  assert.equal(betatruyenModel.readout(left), 'commented · 10,000+ users')
})

test('the model is deterministic and does not mutate its input', () => {
  const input: FigureInput = { progress: 0.7, pointer: { x: 0.5, y: 0 } }
  const start = betatruyenModel.init()
  const frozen = Object.freeze({ ...start })
  const a = betatruyenModel.step(frozen, 0.016, input)
  const b = betatruyenModel.step(frozen, 0.016, input)
  assert.deepEqual(a, b)
  assert.deepEqual(frozen, start)
  assert.deepEqual(input, { progress: 0.7, pointer: { x: 0.5, y: 0 } })
})
