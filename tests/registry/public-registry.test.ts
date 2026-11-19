import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

import { components } from '../../src/registry/registry-components'

// `pnpm build` does not run `registry:build`, so public/r/*.json is committed. A component whose file is missing or
// older than its registry entry makes `shadcn add https://…/r/<name>.json` return a 404 or the previous version.
test('every registry component has a current public/r json', () => {
  for (const item of components) {
    const path = `public/r/${item.name}.json`

    assert.ok(existsSync(path), `${path} is missing: run pnpm registry:build`)

    const built = JSON.parse(readFileSync(path, 'utf8')) as { files: { path: string }[] }
    const builtPaths = built.files.map(file => file.path.split('/').pop())

    for (const file of item.files ?? []) {
      assert.ok(builtPaths.includes(file.path.split('/').pop()), `${path} lacks ${file.path}: run pnpm registry:build`)
    }
  }
})
