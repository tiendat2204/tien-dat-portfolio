import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

test('blog detail page wraps the article in DynamicIslandTOC and removes InlineTOC', () => {
  const testDir = dirname(fileURLToPath(import.meta.url))
  const pagePath = resolve(testDir, '../../src/app/blog/[slug]/page.tsx')
  const source = readFileSync(pagePath, 'utf8')
  const maxW3xlMatches = [...source.matchAll(/max-w-3xl/g)].length

  assert.match(source, /import \{ DynamicIslandTOC \} from '@\/components\/ui\/dynamic-island-toc'/)
  // Headings inside live component demos (.not-prose) must not enter the TOC.
  assert.match(source, /<DynamicIslandTOC selector='article h2:not\(\.not-prose \*\), article h3:not\(\.not-prose \*\)'>[\s\S]*<article>[\s\S]*<\/article>[\s\S]*<\/DynamicIslandTOC>/)
  assert.ok(maxW3xlMatches >= 2)
  assert.doesNotMatch(source, /InlineTOC/)
  assert.doesNotMatch(source, /BlogTOC/)
})
