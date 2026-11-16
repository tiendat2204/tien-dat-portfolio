import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProjectSections, PROJECT_PAGE_ENTRIES, toSection } from '../../src/data/projects-page'

test('buildProjectSections returns the page list in order with figures', () => {
  const sections = buildProjectSections()
  assert.deepEqual(sections.map(s => s.id), ['tien-dat-portfolio', 'agrita', 'eoffice', 'digital-library', 'ta-mobile', 'tangni-web', 'xn2-admin', 'betatruyen'])
  assert.deepEqual(sections.map(s => s.index), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(sections.map(s => s.figureId), ['portfolio', 'agrita', 'eoffice', 'library', 'ta-mobile', undefined, undefined, 'betatruyen'])
  assert.ok(sections.every(s => s.company.length > 0 && s.summary.length > 0))
  assert.equal(sections[7].company, 'VietDev Studio')
  assert.equal(sections[7].period, 'Sep 2024 - Jun 2025')
})

test('toSection tolerates an entry without a figure', () => {
  const [entry] = PROJECT_PAGE_ENTRIES
  const section = toSection({ ...entry, id: 'unknown-thing', figureId: undefined }, 1)
  assert.equal(section.id, 'unknown-thing')
  assert.equal(section.figureId, undefined)
})
