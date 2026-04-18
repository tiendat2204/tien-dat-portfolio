import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

test('BlogCard keeps visible "Read more" text and adds descriptive sr-only text', () => {
  const testDir = dirname(fileURLToPath(import.meta.url))
  const blogCardPath = resolve(testDir, '../../src/app/section/blog/BlogCard.tsx')
  const source = readFileSync(blogCardPath, 'utf8')

  assert.match(source, /Read more/)
  assert.match(source, /Read more\s*<span className='sr-only'>\s*about \{post\.metadata\.title\}\s*<\/span>/)
})
