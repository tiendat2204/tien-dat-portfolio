import assert from 'node:assert/strict'
import test from 'node:test'

import { agritaConfig } from '../../src/components/iso/figures/agrita/config'
import { portfolioConfig } from '../../src/components/iso/figures/portfolio/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import type { StackConfig } from '../../src/components/iso/stack/types'
import { assertSafeConfig } from './stack-config-guard'

const CONFIGS = [portfolioConfig, agritaConfig]

test('both configs pass the content guard', () => {
  for (const config of CONFIGS) assertSafeConfig(config)
})

test('ids and fig numbers match the registry', () => {
  assert.equal(portfolioConfig.id, 'portfolio')
  assert.equal(portfolioConfig.fig, 1)
  assert.equal(agritaConfig.id, 'agrita')
  assert.equal(agritaConfig.fig, 2)
})

test('agrita names no database', () => {
  const db = /postgres|mysql|mongo|sqlite|database|\bdb\b/i
  for (const tier of [...agritaConfig.layers, ...agritaConfig.side]) {
    assert.ok(!db.test(tier.label), `label ${tier.label}`)
    for (const tech of tier.tech) assert.ok(!db.test(tech), `tech ${tech}`)
  }
})

test('mid-scroll readout is non-empty and the settled terminal is complete', () => {
  for (const config of CONFIGS) {
    assert.match(readoutAt(config, 0.5), /^→ \S/)
    const settled = terminalAt(config, 1)
    assert.ok(settled.blocks.length > 0)
    assert.ok(settled.blocks.every(block => block.done && block.result !== null))
  }
})

test('the guard is not vacuous', () => {
  const bad: StackConfig = { ...portfolioConfig, steps: [{ layer: 0, prompt: 'open', lines: ['fetch(\'http://x\')'], result: 'ok' }] }
  assert.throws(() => assertSafeConfig(bad))
  assert.throws(() => assertSafeConfig({ ...portfolioConfig, steps: [{ layer: 99, prompt: 'x', lines: [], result: 'ok' }] }))
  assert.throws(() => assertSafeConfig({ ...portfolioConfig, layers: [{ ...portfolioConfig.layers[0], icon: 'nope.svg' }] }))
  assert.throws(() => assertSafeConfig({ ...portfolioConfig, steps: [{ layer: 0, prompt: 'x', lines: ['a'.repeat(61)], result: 'ok' }] }))
})
