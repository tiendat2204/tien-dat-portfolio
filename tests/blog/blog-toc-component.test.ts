import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

test('BlogTOC uses fumadocs toc primitives and exits early when empty', () => {
  const testDir = dirname(fileURLToPath(import.meta.url))
  const componentPath = resolve(testDir, '../../src/components/blog-toc.tsx')
  const source = readFileSync(componentPath, 'utf8')

  assert.match(source, /from 'fumadocs-core\/toc'/)
  assert.match(source, /AnchorProvider/)
  assert.match(source, /ScrollProvider/)
  assert.match(source, /TOCItem/)
  assert.match(source, /if \(items\.length === 0\) return null/)
  assert.match(source, /data-active/)
})
