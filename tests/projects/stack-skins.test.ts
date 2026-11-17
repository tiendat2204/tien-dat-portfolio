import assert from 'node:assert/strict'
import test from 'node:test'
import { SKIN_KINDS, skinPaths, skinViewBox } from '../../src/components/iso/stack/skins/index'

const TOLERANCE = 0.5
const ARGS: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, A: 7, Z: 0 }

type Point = { x?: number, y?: number }

// A small tolerant parser: splits a `d` string into commands (absolute M/L/H/V/A/Z only) and returns the end points.
function points (d: string): Point[] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? []
  const out: Point[] = []
  let command = ''
  let index = 0
  while (index < tokens.length) {
    const token = tokens[index]
    if (/^[a-zA-Z]$/.test(token)) {
      assert.ok(token in ARGS, `unexpected command ${token} in ${d}`)
      command = token
      index++
      if (command === 'Z') continue
    }
    assert.ok(command !== '' && command !== 'Z', `number without a command in ${d}`)
    const args = tokens.slice(index, index + ARGS[command]).map(Number)
    assert.equal(args.length, ARGS[command], `short ${command} in ${d}`)
    for (const value of args) assert.ok(Number.isFinite(value), `non-finite number in ${d}`)
    if (command === 'H') out.push({ x: args[0] })
    else if (command === 'V') out.push({ y: args[0] })
    else if (command === 'A') {
      assert.ok(args[0] > 0 && args[1] > 0, `arc radius in ${d}`)
      out.push({ x: args[5], y: args[6] })
    } else out.push({ x: args[0], y: args[1] })
    index += ARGS[command]
  }
  return out
}

test('every skin has enough paths', () => {
  assert.equal(SKIN_KINDS.length, 5)
  for (const kind of SKIN_KINDS) {
    const paths = skinPaths(kind)
    assert.ok(paths.length >= 8, `${kind} has ${paths.length} paths`)
    assert.ok(paths.length <= 40, `${kind} has ${paths.length} paths`)
  }
})

test('every path parses into finite numbers inside the viewBox', () => {
  const [minX, minY, width, height] = skinViewBox
  for (const kind of SKIN_KINDS) {
    for (const d of skinPaths(kind)) {
      assert.ok(d.startsWith('M'), `${kind}: ${d} starts with M`)
      const list = points(d)
      assert.ok(list.length >= 2, `${kind}: ${d} draws something`)
      for (const { x, y } of list) {
        if (x !== undefined) assert.ok(x >= minX - TOLERANCE && x <= minX + width + TOLERANCE, `${kind}: x ${x} in ${d}`)
        if (y !== undefined) assert.ok(y >= minY - TOLERANCE && y <= minY + height + TOLERANCE, `${kind}: y ${y} in ${d}`)
      }
    }
  }
})

test('no two kinds draw the same skin', () => {
  const seen = new Set(SKIN_KINDS.map(kind => skinPaths(kind).join('|')))
  assert.equal(seen.size, SKIN_KINDS.length)
})

test('skinPaths is deterministic and returns a fresh array', () => {
  for (const kind of SKIN_KINDS) {
    const first = skinPaths(kind)
    const copy = [...first]
    first.length = 0
    first.push('M0 0')
    assert.deepEqual(skinPaths(kind), copy)
    assert.notEqual(skinPaths(kind), skinPaths(kind))
  }
})
