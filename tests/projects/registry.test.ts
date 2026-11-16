import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { FIGURE_IDS, FIGURE_LOADERS } from '../../src/components/iso/registry'

const EXPECTED = ['portfolio', 'agrita', 'eoffice', 'library', 'ta-mobile', 'betatruyen']

test('FIGURE_IDS lists the six figures in page order', () => {
  assert.deepEqual([...FIGURE_IDS], EXPECTED)
})

test('the loader map has exactly one loader per figure id', () => {
  assert.deepEqual(Object.keys(FIGURE_LOADERS), [...FIGURE_IDS])
  assert.ok(Object.values(FIGURE_LOADERS).every(load => typeof load === 'function'))
})

test('each loader is a dynamic import of its own figure directory', () => {
  const source = readFileSync(new URL('../../src/components/iso/registry.ts', import.meta.url), 'utf8')
  for (const id of EXPECTED) {
    assert.match(source, new RegExp(`import\\('@/components/iso/figures/${id}'\\)`))
  }
  assert.doesNotMatch(source, /from '@\/components\/iso\/figures\//)
})

test('the projects route never imports a figure statically', () => {
  for (const file of ['../../src/data/projects-page.ts', '../../src/app/projects/page.tsx']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /from '@\/components\/iso\/figures\//, file)
  }
})
