import assert from 'node:assert/strict'
import test from 'node:test'

import { agritaConfig } from '../../src/components/iso/figures/agrita/config'
import { portfolioConfig } from '../../src/components/iso/figures/portfolio/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import type { StackConfig } from '../../src/components/iso/stack/types'
import { assertSafeConfig, stepRows, TERMINAL_ROWS } from './stack-config-guard'

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
  // Step text may use Drizzle's `db.query`, but names no database product.
  const product = /postgres|mysql|mongo|sqlite|mariadb/i
  for (const step of agritaConfig.steps) {
    for (const text of [step.prompt, ...step.lines, step.result]) assert.ok(!product.test(text), `step text ${text}`)
  }
})

test('every step fits the terminal viewport', () => {
  for (const config of CONFIGS) {
    for (const step of config.steps) assert.ok(stepRows(step) <= TERMINAL_ROWS, `${config.id}: ${step.prompt}`)
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
  const step = (lines: string[], layer = 0): StackConfig => ({ ...portfolioConfig, steps: [{ layer, prompt: 'x', lines, result: 'ok' }] })
  assert.throws(() => assertSafeConfig(step(['fetch(\'http://x\')'])), /banned text 'http'/)
  assert.throws(() => assertSafeConfig(step(['ping 10.0.0.1'])), /IPv4/)
  assert.throws(() => assertSafeConfig(step(['open localhost'])), /banned text 'localhost'/)
  assert.throws(() => assertSafeConfig(step(['a', 'b', 'c'])), /needs 6 terminal rows/)
  assert.doesNotThrow(() => assertSafeConfig(step(['a', 'b'])))
  assert.throws(() => assertSafeConfig(step(['a'], 99)), /layer 99 out of range/)
  assert.throws(() => assertSafeConfig({ ...portfolioConfig, side: [{ id: 'x', label: 'x', tech: ['x'], icon: 'nope.svg' }] }), /missing icon 'nope.svg'/)
  assert.throws(() => assertSafeConfig(step(['a'.repeat(61)])), /longer than 60/)
})
