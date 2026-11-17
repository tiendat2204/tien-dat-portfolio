import assert from 'node:assert/strict'
import test from 'node:test'

import { libraryConfig } from '../../src/components/iso/figures/library/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import { assertSafeConfig } from './stack-config-guard'

test('library config passes the content guard', () => {
  assertSafeConfig(libraryConfig)
})

test('library card identity', () => {
  assert.equal(libraryConfig.id, 'library')
  assert.equal(libraryConfig.fig, 4)
  assert.equal(libraryConfig.skin, 'web')
  assert.equal(libraryConfig.title, 'Library stack')
  assert.equal(libraryConfig.hint, 'scroll to check a book out')
})

test('library follows the real web app stack', () => {
  assert.deepEqual(libraryConfig.layers.map(layer => layer.label), ['ui', 'app', 'data', 'state', 'forms'])
  assert.deepEqual(libraryConfig.side.map(tier => tier.label), ['scan', 'editor', 'tests'])
  const tech = [...libraryConfig.layers, ...libraryConfig.side].flatMap(tier => tier.tech)
  for (const name of ['React 19', 'Next.js 16', 'TanStack Query', 'TanStack Table', 'Redux Toolkit', 'Zustand', 'React Hook Form', 'Zod', 'zxing-wasm', 'Tiptap', 'Playwright']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.equal(libraryConfig.steps.length, 5)
  assert.deepEqual(libraryConfig.steps.map(step => step.layer), [0, 1, 2, 3, 4])
})

// The backend stack is unknown and the CV scale numbers are not figure content.
test('library claims no backend, database or CV scale numbers', () => {
  const texts = [
    libraryConfig.title, libraryConfig.hint,
    ...[...libraryConfig.layers, ...libraryConfig.side].flatMap(tier => [tier.label, ...tier.tech]),
    ...libraryConfig.steps.flatMap(step => [step.prompt, ...step.lines, step.result]),
  ]
  const banned = /postgres|mysql|mongo|sqlite|database|nest|express|django|spring|laravel|40,?000|1,?000/i
  for (const text of texts) assert.ok(!banned.test(text), text)
})

test('mid-scroll readout and settled terminal', () => {
  assert.match(readoutAt(libraryConfig, 0.5), /^STEP \d+\/\d+ · \S/)
  const settled = terminalAt(libraryConfig, 1)
  assert.ok(settled.blocks.length > 0)
  assert.ok(settled.blocks.every(block => block.done && block.result !== null))
})
