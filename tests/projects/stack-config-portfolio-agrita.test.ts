import assert from 'node:assert/strict'
import test from 'node:test'

import { agritaConfig } from '../../src/components/iso/figures/agrita/config'
import { portfolioConfig } from '../../src/components/iso/figures/portfolio/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import type { StackConfig } from '../../src/components/iso/stack/types'
import { assertSafeConfig, stepRows, TERMINAL_COLS, TERMINAL_ROWS } from './stack-config-guard'

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

test('each config names its generic skin', () => {
  assert.equal(portfolioConfig.skin, 'web')
  assert.equal(agritaConfig.skin, 'dashboard')
})

test('agrita follows the real AgriTA web apps', () => {
  assert.deepEqual(agritaConfig.layers.map(layer => layer.label), ['ui', 'routes', 'data', 'forms', 'api'])
  assert.deepEqual(agritaConfig.side.map(tier => tier.label), ['map', 'market', 'tests'])
  const tech = [...agritaConfig.layers, ...agritaConfig.side].flatMap(tier => tier.tech)
  for (const name of ['Vite', 'TanStack Router', 'TanStack Query', 'React Hook Form', 'Zod', 'Axios', 'Leaflet', 'Geoman', 'Next.js 16']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.ok(!tech.some(name => /NestJS|Drizzle/.test(name)))
  assert.equal(agritaConfig.steps.length, 5)
  assert.deepEqual(agritaConfig.steps.map(step => step.layer), [0, 1, 2, 3, 4])
  const steps = agritaConfig.steps.flatMap(step => [step.prompt, ...step.lines]).join('\n')
  for (const word of [/landLot/, /season/i, /harvest/i, /trace/i]) assert.match(steps, word)
})

// The API and its database belong to a separate backend team; the figure shows the frontend only.
test('agrita claims no backend or database layer', () => {
  const db = /postgres|mysql|mongo|sqlite|database|\bdb\b/i
  for (const tier of [...agritaConfig.layers, ...agritaConfig.side]) {
    assert.ok(!db.test(tier.label), `label ${tier.label}`)
    for (const tech of tier.tech) assert.ok(!db.test(tech), `tech ${tech}`)
  }
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
    assert.match(readoutAt(config, 0.5), /^STEP \d+\/\d+ · \S/)
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
  assert.throws(() => assertSafeConfig({ ...portfolioConfig, title: 'a'.repeat(61) }), /longer than 60/)
  const badSkin = { ...portfolioConfig, skin: 'kiosk' } as unknown as StackConfig
  assert.throws(() => assertSafeConfig(badSkin), /unknown skin 'kiosk'/)
})

test('terminal text fits the notes column (TERMINAL_COLS)', () => {
  assert.equal(TERMINAL_COLS, 44)
  const step = (prompt: string, lines: string[], result: string): StackConfig => ({ ...portfolioConfig, steps: [{ layer: 0, prompt, lines, result }] })
  assert.throws(() => assertSafeConfig(step('x', ['a'.repeat(45)], 'ok')), /exceeds 44 terminal columns/)
  assert.doesNotThrow(() => assertSafeConfig(step('x', ['a'.repeat(44)], 'ok')))
  // The prompt is rendered after `$ `, so it has two columns fewer.
  assert.doesNotThrow(() => assertSafeConfig(step('p'.repeat(42), ['a'], 'ok')))
  assert.throws(() => assertSafeConfig(step('p'.repeat(43), ['a'], 'ok')), /exceeds 44 terminal columns/)
  assert.throws(() => assertSafeConfig(step('x', ['a'], 'r'.repeat(45))), /exceeds 44 terminal columns/)
  for (const config of CONFIGS) {
    for (const step of config.steps) {
      assert.ok(step.prompt.length + 2 <= TERMINAL_COLS, `${config.id}: ${step.prompt}`)
      for (const text of [...step.lines, step.result]) assert.ok(text.length <= TERMINAL_COLS, `${config.id}: ${text}`)
    }
  }
})
