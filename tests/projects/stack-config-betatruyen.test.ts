import assert from 'node:assert/strict'
import test from 'node:test'

import { betatruyenConfig } from '../../src/components/iso/figures/betatruyen/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import { assertSafeConfig } from './stack-config-guard'

const tiers = [...betatruyenConfig.layers, ...betatruyenConfig.side]

test('betatruyen passes the content guard', () => {
  assertSafeConfig(betatruyenConfig)
})

test('betatruyen card identity', () => {
  assert.equal(betatruyenConfig.id, 'betatruyen')
  assert.equal(betatruyenConfig.fig, 8)
  assert.equal(betatruyenConfig.skin, 'forum')
  assert.equal(betatruyenConfig.title, 'BetaTruyen stack')
})

test('betatruyen follows the CV and the frontend repo', () => {
  assert.deepEqual(betatruyenConfig.layers.map(layer => layer.label), ['ui', 'hooks', 'data', 'auth', 'api'])
  assert.deepEqual(betatruyenConfig.side.map(tier => tier.label), ['ci', 'forms', 'state'])
  const tech = tiers.flatMap(tier => tier.tech)
  for (const name of ['Next.js SSR', 'shadcn/ui', 'Tailwind CSS', 'TanStack Query', 'JWT', 'Django REST Framework', 'GitHub Actions']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.equal(betatruyenConfig.steps.length, 5)
  assert.deepEqual(betatruyenConfig.steps.map(step => step.layer), [0, 1, 2, 3, 4])
})

test('mid-scroll readout is non-empty and the settled terminal is complete', () => {
  assert.match(readoutAt(betatruyenConfig, 0.5), /^STEP \S/)
  const settled = terminalAt(betatruyenConfig, 1)
  assert.ok(settled.blocks.length > 0)
  assert.ok(settled.blocks.every(block => block.done && block.result !== null))
})

// The owner led the frontend and the auth integration; the Django database, cache and queue belong to the backend,
// and the user count lives in the page text only.
test('betatruyen claims no database, cache or queue and shows no user count', () => {
  const backend = /postgres|dragonfly|celery|rabbitmq|redis|database|\bdb\b|10[,.]?000/i
  const texts = [
    betatruyenConfig.title,
    betatruyenConfig.hint,
    ...tiers.flatMap(tier => [tier.id, tier.label, ...tier.tech]),
    ...betatruyenConfig.steps.flatMap(step => [step.prompt, ...step.lines, step.result]),
  ]
  for (const text of texts) assert.ok(!backend.test(text), `text ${text}`)
})
