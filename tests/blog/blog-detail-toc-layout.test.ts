import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

test('blog detail page uses right sticky BlogTOC layout and removes InlineTOC', () => {
  const testDir = dirname(fileURLToPath(import.meta.url))
  const pagePath = resolve(testDir, '../../src/app/blog/[slug]/page.tsx')
  const source = readFileSync(pagePath, 'utf8')
  const maxW5xlMatches = [...source.matchAll(/max-w-5xl/g)].length
  const maxW3xlMatches = [...source.matchAll(/max-w-3xl/g)].length

  assert.match(source, /import \{ BlogTOC \} from '@\/components\/blog-toc'/)
  assert.match(source, /filterBlogTOCItems\(toc\)/)
  assert.match(source, /top-\[var\(--doc-cols-top,0px\)\]/)
  assert.match(source, /md:grid/)
  assert.match(source, /md:grid-cols-\[minmax\(0,1fr\)_18rem\]/)
  assert.ok(maxW5xlMatches >= 2)
  assert.ok(maxW3xlMatches >= 2)
  assert.doesNotMatch(source, /InlineTOC/)
})
