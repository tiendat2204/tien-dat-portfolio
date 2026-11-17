import assert from 'node:assert/strict'
import test from 'node:test'

import { agritaMobileConfig as config } from '../../src/components/iso/figures/agrita-mobile/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import { assertSafeConfig } from './stack-config-guard'

test('agrita-mobile passes the content guard', () => {
  assertSafeConfig(config)
})

test('agrita-mobile identity', () => {
  assert.equal(config.id, 'agrita-mobile')
  assert.equal(config.fig, 5)
  assert.equal(config.skin, 'phone')
  assert.equal(config.title, 'AgriTA Mobile stack')
})

test('agrita-mobile follows the real Flutter app', () => {
  assert.deepEqual(config.layers.map(layer => layer.label), ['ui', 'routes', 'state', 'forms', 'client', 'sync'])
  assert.deepEqual(config.side.map(tier => tier.label), ['charts', 'capture', 'crash'])
  const tech = [...config.layers, ...config.side].flatMap(tier => tier.tech)
  for (const name of ['Flutter', 'shadcn_ui', 'go_router', 'Riverpod', 'riverpod_generator', 'reactive_forms', 'freezed', 'dio', 'workmanager', 'fl_chart', 'image_picker', 'speech_to_text', 'Sentry']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.equal(config.steps.length, 6)
  assert.deepEqual(config.steps.map(step => step.layer), [0, 1, 2, 3, 4, 5])
})

test('agrita-mobile claims no backend or database product', () => {
  const backend = /postgres|mysql|mongo|nestjs|drizzle|prisma|firebase|supabase/i
  for (const tier of [...config.layers, ...config.side]) {
    assert.ok(!backend.test(tier.label), `label ${tier.label}`)
    for (const name of tier.tech) assert.ok(!backend.test(name), `tech ${name}`)
  }
  // Text chips only: no Flutter icon file exists.
  assert.ok([...config.layers, ...config.side].every(tier => tier.icon === undefined))
})

test('readout and settled terminal', () => {
  assert.match(readoutAt(config, 0.5), /^STEP \d+\/\d+ · \S/)
  const settled = terminalAt(config, 1)
  assert.ok(settled.blocks.length > 0)
  assert.ok(settled.blocks.every(block => block.done))
})
