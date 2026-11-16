import assert from 'node:assert/strict'
import test from 'node:test'
import { portfolioModel, type PortfolioState } from '../../src/components/iso/figures/portfolio/model'
import type { FigureInput } from '../../src/components/iso/figure-contract'

const STILL: FigureInput = { progress: 0, pointer: null }
const DONE: FigureInput = { progress: 1, pointer: null }

function run (inputs: FigureInput[], dt = 0.016) {
  let state = portfolioModel.init()
  const readouts: string[] = []
  for (const input of inputs) {
    state = portfolioModel.step(state, dt, input)
    readouts.push(portfolioModel.readout(state))
  }
  return { state, readouts }
}

test('a fresh sheet reads 0%', () => {
  const state = portfolioModel.step(portfolioModel.init(), 0.016, STILL)
  assert.equal(portfolioModel.readout(state), 'sheet 0%')
})

test('holding progress at 1 drafts the whole sheet', () => {
  const { state } = run(Array.from({ length: 600 }, () => DONE))
  assert.equal(portfolioModel.readout(state), 'sheet 100%')
})

test('the sheet fills monotonically on the way to 100%', () => {
  const { readouts } = run(Array.from({ length: 240 }, () => DONE))
  const percents = readouts.map(text => Number(/sheet (\d+)%/.exec(text)?.[1]))
  assert.ok(percents.every(Number.isFinite))
  for (let index = 1; index < percents.length; index++) assert.ok(percents[index] >= percents[index - 1])
  assert.ok(percents.some(value => value > 0 && value < 100), 'passes through partial sheets')
})

test('a pointer lifts the pen and the readout says so', () => {
  const hover: FigureInput = { progress: 0.5, pointer: { x: 0.4, y: 0 } }
  const { state } = run(Array.from({ length: 200 }, () => hover))
  assert.match(portfolioModel.readout(state), /^sheet \d+% · pen up$/)
})

test('the same inputs give the same states', () => {
  const inputs: FigureInput[] = [
    ...Array.from({ length: 40 }, () => ({ progress: 0.3, pointer: null })),
    ...Array.from({ length: 30 }, () => ({ progress: 0.7, pointer: { x: -0.5, y: 0.2 } })),
    ...Array.from({ length: 50 }, () => DONE),
  ]
  const first = run(inputs)
  const second = run(inputs)
  assert.deepEqual(first.state, second.state)
  assert.deepEqual(first.readouts, second.readouts)
})

test('step leaves its input state untouched', () => {
  const before: PortfolioState = portfolioModel.step(portfolioModel.init(), 0.016, { progress: 0.2, pointer: null })
  const copy = structuredClone(before)
  portfolioModel.step(before, 0.016, { progress: 0.9, pointer: { x: 1, y: 0 } })
  assert.deepEqual(before, copy)
})
