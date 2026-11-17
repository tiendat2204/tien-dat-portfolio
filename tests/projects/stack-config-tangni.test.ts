import assert from 'node:assert/strict'
import test from 'node:test'

import { tangniConfig } from '../../src/components/iso/figures/tangni/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import { assertSafeConfig } from './stack-config-guard'

test('tangni config passes the content guard', () => {
  assertSafeConfig(tangniConfig)
})

test('tangni identity', () => {
  assert.equal(tangniConfig.id, 'tangni')
  assert.equal(tangniConfig.fig, 6)
  assert.equal(tangniConfig.skin, 'dashboard')
  assert.equal(tangniConfig.title, 'TangNi stack')
})

test('tangni follows the real TangNi Web frontend', () => {
  assert.deepEqual(tangniConfig.layers.map(layer => layer.label), ['ui', 'routes', 'data', 'forms', 'api'])
  assert.deepEqual(tangniConfig.side.map(tier => tier.label), ['review', 'tests', 'a11y'])
  const tech = [...tangniConfig.layers, ...tangniConfig.side].flatMap(tier => tier.tech)
  for (const name of ['React 19', 'shadcn/ui', 'Vite', 'TanStack Router', 'TanStack Query', 'TanStack Table', 'Zustand', 'React Hook Form', 'Zod', 'Axios', 'Vitest', 'MSW', 'Playwright']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.equal(tangniConfig.steps.length, 5)
  assert.deepEqual(tangniConfig.steps.map(step => step.layer), [0, 1, 2, 3, 4])
})

// The backend and its databases are a separate API; the figure shows the frontend only, and the app is not Next.js.
test('tangni names no backend, database or Next.js', () => {
  const banned = /postgres|mysql|mongo|sqlite|database|\.net|next\.?js|redux/i
  for (const tier of [...tangniConfig.layers, ...tangniConfig.side]) {
    for (const text of [tier.label, ...tier.tech]) assert.ok(!banned.test(text), text)
  }
  for (const step of tangniConfig.steps) {
    for (const text of [step.prompt, ...step.lines, step.result]) assert.ok(!banned.test(text), text)
  }
})

test('mid-scroll readout is non-empty and the settled terminal is complete', () => {
  assert.match(readoutAt(tangniConfig, 0.5), /^STEP \d+\/\d+ · \S/)
  const settled = terminalAt(tangniConfig, 1)
  assert.ok(settled.blocks.length > 0)
  assert.ok(settled.blocks.every(block => block.done && block.result !== null))
})
