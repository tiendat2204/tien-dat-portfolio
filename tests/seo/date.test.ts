import assert from 'node:assert/strict'
import test from 'node:test'
import { parsePublishedAt } from '../../src/lib/seo/date'

test('parsePublishedAt parses YYYY-MM-DD as UTC midnight regardless of TZ', () => {
  assert.equal(parsePublishedAt('2025-07-05')?.toISOString(), '2025-07-05T00:00:00.000Z')
})

test('parsePublishedAt returns undefined for invalid input', () => {
  assert.equal(parsePublishedAt('nope'), undefined)
  assert.equal(parsePublishedAt('20250705'), undefined)
  assert.equal(parsePublishedAt('2025-02-31'), undefined)
})

test('parsePublishedAt parses full ISO strings', () => {
  assert.equal(parsePublishedAt('2025-07-05T10:00:00Z')?.toISOString(), '2025-07-05T10:00:00.000Z')
})
