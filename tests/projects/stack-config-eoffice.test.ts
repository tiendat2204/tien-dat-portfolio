import assert from 'node:assert/strict'
import test from 'node:test'

import { eofficeConfig } from '../../src/components/iso/figures/eoffice/config'
import { readoutAt, terminalAt } from '../../src/components/iso/stack/engine'
import { assertSafeConfig } from './stack-config-guard'

// Every technology named on the figure, checked against the E-Office frontend's package.json and src.
const ALLOWED = [
  'React 19', 'shadcn/ui', 'Tailwind CSS 4',
  'Vite 8', 'React Router 7', 'nuqs',
  'TanStack Query', 'TanStack Table', 'Redux Toolkit',
  'React Hook Form', 'Zod 4',
  'Axios', 'cookie token', 'refresh queue',
  'status flow', 'role guard',
  'react-pdf', 'file upload',
  'Sonner', 'toast feedback',
]

test('eoffice passes the content guard', () => {
  assertSafeConfig(eofficeConfig)
})

test('eoffice card identity', () => {
  assert.equal(eofficeConfig.id, 'eoffice')
  assert.equal(eofficeConfig.fig, 3)
  assert.equal(eofficeConfig.skin, 'editor')
  assert.equal(eofficeConfig.title, 'E-Office stack')
  assert.equal(eofficeConfig.hint, 'scroll to change a document status')
})

test('eoffice follows the real E-Office frontend', () => {
  assert.deepEqual(eofficeConfig.layers.map(layer => layer.label), ['ui', 'routes', 'data', 'forms', 'api'])
  assert.deepEqual(eofficeConfig.side.map(tier => tier.label), ['workflow', 'preview', 'notify'])
  const tech = [...eofficeConfig.layers, ...eofficeConfig.side].flatMap(tier => tier.tech)
  for (const name of ['React Router 7', 'TanStack Query', 'Redux Toolkit', 'React Hook Form', 'Zod 4', 'Axios', 'react-pdf', 'Sonner', 'cookie token']) {
    assert.ok(tech.includes(name), `missing ${name}`)
  }
  assert.equal(eofficeConfig.steps.length, 5)
  assert.deepEqual(eofficeConfig.steps.map(step => step.layer), [0, 1, 2, 3, 4])
  const steps = eofficeConfig.steps.flatMap(step => [step.prompt, ...step.lines]).join('\n')
  for (const word of [/document/, /status/, /draft/, /active/]) assert.match(steps, word)
})

// The repo is the frontend only: no backend framework, database or rich-text editor may be claimed.
test('eoffice names only technologies found in the frontend repo', () => {
  const tech = [...eofficeConfig.layers, ...eofficeConfig.side].flatMap(tier => tier.tech)
  for (const name of tech) assert.ok(ALLOWED.includes(name), `unverified tech ${name}`)
  const backend = /nest|express|django|postgres|mysql|mongo|prisma|drizzle|tiptap|lexical|\bdb\b/i
  for (const text of [...tech, ...eofficeConfig.steps.flatMap(step => [step.prompt, ...step.lines, step.result])]) {
    assert.ok(!backend.test(text), `backend or editor claim: ${text}`)
  }
})

test('mid-scroll readout is non-empty and the settled terminal is complete', () => {
  assert.match(readoutAt(eofficeConfig, 0.5), /^STEP \d+\/\d+ · \S/)
  const settled = terminalAt(eofficeConfig, 1)
  assert.equal(settled.blocks.length, eofficeConfig.steps.length)
  assert.ok(settled.blocks.every(block => block.done && block.result !== null))
})

// Delivery files are teammate-authored and the repo has no approval or signer step: none of it is claimed.
test('eoffice claims no delivery pipeline, approval or signer role', () => {
  const tech = [...eofficeConfig.layers, ...eofficeConfig.side].flatMap(tier => [tier.label, ...tier.tech])
  assert.ok(!tech.some(name => /docker|nginx|jenkins|delivery|session/i.test(name)))
  const text = [eofficeConfig.hint, ...eofficeConfig.steps.flatMap(step => [step.prompt, ...step.lines, step.result])].join('\n')
  assert.doesNotMatch(text, /sign|approv|effective/i)
})
