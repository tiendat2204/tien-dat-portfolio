import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProjectSections, PROJECT_PAGE_ENTRIES, toSection } from '../../src/data/projects-page'

test('buildProjectSections returns the page list in order with figures', () => {
  const sections = buildProjectSections()
  assert.deepEqual(sections.map(s => s.id), ['tien-dat-portfolio', 'agrita', 'eoffice', 'digital-library', 'agrita-mobile', 'tangni-web', 'xn2-admin', 'betatruyen'])
  assert.deepEqual(sections.map(s => s.index), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(sections.map(s => s.figureId), ['portfolio', 'agrita', 'eoffice', 'library', 'agrita-mobile', 'tangni', 'xn2', 'betatruyen'])
  assert.ok(sections.every(s => s.company.length > 0 && s.summary.length > 0))
  assert.equal(sections[7].company, 'VietDev Studio')
  assert.deepEqual(sections.map(s => s.period), ['June 2024 - Present', 'Jun 2025 - Present', 'Jun 2025 - Present', 'Jun 2025 - Present', undefined, undefined, undefined, 'Sep 2024 - Jun 2025'])
})

test('agrita-mobile is AgriTA Mobile and betatruyen leads with the owner statement', () => {
  const sections = buildProjectSections()
  const mobile = sections.find(s => s.id === 'agrita-mobile')
  assert.equal(mobile?.title, 'AgriTA Mobile')
  assert.equal(mobile?.role, 'Mobile Developer')
  assert.equal(mobile?.period, undefined)
  assert.ok(mobile?.summary.some(l => l.includes('field workers')))
  assert.ok(!mobile?.summary.some(l => /attendance|HR|face/i.test(l)))
  assert.deepEqual(mobile?.links, [])
  const beta = sections.find(s => s.id === 'betatruyen')
  assert.equal(beta?.summary[0], 'Built and maintained a story community forum with over 10,000 users, supporting reading, community interaction and content sharing')
  assert.ok(beta?.technologies.some(t => t.name === 'Celery'))
  assert.ok(beta?.technologies.some(t => t.name === 'RabbitMQ'))
})

test('agrita, the library and tangni describe the real repos', () => {
  const sections = buildProjectSections()
  const text = (id: string) => sections.find(s => s.id === id)?.summary.join('\n') ?? ''
  const techs = (id: string) => sections.find(s => s.id === id)?.technologies.map(t => t.name) ?? []
  const agrita = text('agrita')
  assert.match(agrita, /land lot, crop season, harvest lot/)
  assert.match(agrita, /TA Farm/)
  assert.match(agrita, /TA Market/)
  assert.match(agrita, /Vite SPA/)
  assert.match(agrita, /Next\.js 16/)
  assert.match(agrita, /Geoman/)
  assert.ok(!/NestJS|Drizzle/.test(agrita))
  assert.ok(!techs('agrita').some(n => /NestJS|Drizzle/.test(n)))
  assert.ok(techs('agrita').includes('Vite'))
  assert.ok(techs('agrita').includes('Zustand'))
  const library = text('digital-library')
  assert.match(library, /barcode/)
  assert.match(library, /40,000\+ books with 1,000\+ active users/)
  assert.ok(techs('digital-library').includes('Redux Toolkit'))
  const tangni = text('tangni-web')
  assert.match(tangni, /secretary reviews/)
  assert.match(tangni, /Vite SPA/)
  assert.ok(techs('tangni-web').includes('Zustand'))
})

test('toSection tolerates an entry without a figure', () => {
  const [entry] = PROJECT_PAGE_ENTRIES
  const section = toSection({ ...entry, id: 'unknown-thing', figureId: undefined }, 1)
  assert.equal(section.id, 'unknown-thing')
  assert.equal(section.figureId, undefined)
})
