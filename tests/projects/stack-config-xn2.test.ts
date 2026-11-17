import assert from 'node:assert/strict'
import test from 'node:test'

import { xn2Config } from '../../src/components/iso/figures/xn2/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import { assertSafeConfig } from './stack-config-guard'

// Every technology named here is a dependency used in the XN2 frontend's src (package.json + imports).
const ALLOWED = [
  'React 19', 'Radix UI', 'Tailwind CSS',
  'Vite', 'React Router 7', 'nuqs',
  'Redux Toolkit', 'TanStack Query',
  'React Hook Form', 'Zod',
  'Axios', 'interceptors',
  'Tiptap editor', 'Excalidraw', 'KaTeX',
  'TanStack Table', 'dnd-kit', 'filter operators',
  'Recharts',
]

test('xn2 config passes the content guard', () => {
  assertSafeConfig(xn2Config)
})

test('xn2 card identity', () => {
  assert.equal(xn2Config.id, 'xn2')
  assert.equal(xn2Config.fig, 7)
  assert.equal(xn2Config.skin, 'dashboard')
  assert.equal(xn2Config.title, 'XN2 stack')
  assert.equal(xn2Config.hint, 'scroll to follow a record down the stack')
})

test('xn2 follows the real XN2 frontend', () => {
  assert.deepEqual(xn2Config.layers.map(layer => layer.label), ['ui', 'routes', 'state', 'forms', 'api'])
  assert.deepEqual(xn2Config.side.map(tier => tier.label), ['editor', 'tables', 'charts'])
  const tech = [...xn2Config.layers, ...xn2Config.side].flatMap(tier => tier.tech)
  for (const name of ['React Router 7', 'Redux Toolkit', 'TanStack Query', 'React Hook Form', 'Zod', 'Axios', 'Tiptap editor', 'Excalidraw', 'TanStack Table', 'dnd-kit']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.equal(xn2Config.steps.length, 5)
  assert.deepEqual(xn2Config.steps.map(step => step.layer), [0, 1, 2, 3, 4])
})

test('readout and settled terminal', () => {
  assert.match(readoutAt(xn2Config, 0.5), /^STEP \S/)
  assert.equal(readoutAt(xn2Config, 0.6), 'STEP 3/5 · state · Redux Toolkit')
  const settled = terminalAt(xn2Config, 1)
  assert.ok(settled.blocks.length > 0)
  assert.ok(settled.blocks.every(block => block.done && block.result !== null))
})

// The owner built the frontend only: no technology outside the repo's dependencies, no backend or database.
test('xn2 names only frontend technologies found in the repo', () => {
  const tech = [...xn2Config.layers, ...xn2Config.side].flatMap(tier => tier.tech)
  for (const name of tech) assert.ok(ALLOWED.includes(name), `unexpected tech ${name}`)
  const backend = /postgres|mysql|mongo|sqlite|nestjs|django|express|database/i
  const texts = [...xn2Config.layers, ...xn2Config.side].map(tier => tier.label)
    .concat(xn2Config.steps.flatMap(step => [step.prompt, ...step.lines, step.result]))
  for (const text of texts) assert.ok(!backend.test(text), `backend claim ${text}`)
})

// Snippets stay generic: no verbatim identifiers from the client repo.
test('xn2 snippets avoid repo identifiers', () => {
  const code = xn2Config.steps.flatMap(step => [step.prompt, ...step.lines]).join('\n')
  for (const word of [/isBetween/, /wardId/, /joinOperator/, /contract/i]) assert.doesNotMatch(code, word)
  assert.doesNotMatch(xn2Config.hint, /contract/i)
})
