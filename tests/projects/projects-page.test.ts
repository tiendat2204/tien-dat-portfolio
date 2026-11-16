import assert from 'node:assert/strict'
import test from 'node:test'
import { DATA } from '../../src/data/resume'
import { buildProjectSections } from '../../src/data/projects-page'

test('buildProjectSections maps every project in order with a figure', () => {
  const sections = buildProjectSections(DATA.projects)
  assert.deepEqual(sections.map(s => s.id), ['tien-dat-portfolio', 'e-booking-healthcare', 'weui-clone', 'coi-shop', 'memory-game', 'sticker-animation'])
  assert.deepEqual(sections.map(s => s.index), [1, 2, 3, 4, 5, 6])
  assert.ok(sections.every(s => s.figureId != null))
  assert.equal(sections[0].period, 'June 2024 - Present')
  assert.equal(sections[0].role, 'Personal Project')
})

test('buildProjectSections tolerates unknown titles', () => {
  const unknown = { ...DATA.projects[0], title: 'Unknown Thing' } as unknown as (typeof DATA.projects)[number]
  const [section] = buildProjectSections([unknown] as unknown as typeof DATA.projects)
  assert.equal(section.id, 'unknown-thing')
  assert.equal(section.figureId, undefined)
})
