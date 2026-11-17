import assert from 'node:assert/strict'
import test from 'node:test'
import { readoutAt, stackPose, terminalAt } from '../../src/components/iso/stack/engine'
import type { StackConfig } from '../../src/components/iso/stack/types'

function sweep (n = 200): number[] {
  return Array.from({ length: n + 1 }, (_, i) => i / n)
}

function typedLength (config: StackConfig, progress: number): number {
  return terminalAt(config, progress).blocks.reduce((sum, b) => sum + b.typed.reduce((s, l) => s + l.length, 0), 0)
}

const CONFIG: StackConfig = {
  id: 'agrita',
  fig: 2,
  title: 'AgriTA',
  hint: 'scroll to send a request down the stack',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React', 'Vite'] },
    { id: 'api', label: 'api', tech: ['NestJS'] },
    { id: 'orm', label: 'orm', tech: ['Prisma'] },
    { id: 'db', label: 'db', tech: ['PostgreSQL'] },
    { id: 'cache', label: 'cache', tech: [] },
  ],
  side: [{ id: 'ci', label: 'ci', tech: ['GitHub Actions'] }],
  steps: [
    { layer: 0, prompt: 'pnpm dev', lines: ['const q = useQuery(farms)'], result: 'ready in 300ms' },
    { layer: 1, prompt: 'curl /api/v1/farms', lines: ['@Get()', 'findAll ()'], result: '200 OK' },
    { layer: 3, prompt: 'psql', lines: ['select * from farms;'], result: '12 rows' },
  ],
}

test('stackPose starts collapsed at the top layer', () => {
  const pose = stackPose(0, 5)
  assert.equal(pose.active, 0)
  assert.equal(pose.explode, 0)
  assert.equal(pose.packetY, 0)
})

test('stackPose explodes over the first 15% and stays exploded', () => {
  assert.ok(stackPose(0.075, 5).explode > 0 && stackPose(0.075, 5).explode < 1)
  assert.equal(stackPose(0.15, 5).explode, 1)
  assert.equal(stackPose(0.9, 5).explode, 1)
})

test('stackPose descends on the way down with a non-decreasing active layer', () => {
  assert.equal(stackPose(0.4, 5).direction, 'down')
  let last = -1
  let lastY = -1
  for (const p of sweep().filter(p => p <= 0.65)) {
    const pose = stackPose(p, 5)
    assert.ok(pose.active >= last, `active went back at ${p}`)
    assert.ok(pose.packetY >= lastY, `packetY went back at ${p}`)
    last = pose.active
    lastY = pose.packetY
  }
  assert.equal(stackPose(0.65, 5).active, 4)
})

test('stackPose returns up and rests at the top', () => {
  assert.equal(stackPose(0.8, 5).direction, 'up')
  assert.equal(stackPose(1, 5).active, 0)
  assert.equal(stackPose(1, 5).packetY, 0)
  assert.equal(stackPose(0.97, 5).active, 0)
})

test('stackPose clamps progress and works for 1 and 8 layers', () => {
  for (const count of [1, 2, 5, 8]) {
    for (const p of [-1, ...sweep(50), 2, Number.NaN]) {
      const pose = stackPose(p, count)
      assert.ok(Number.isInteger(pose.active) && pose.active >= 0 && pose.active <= count - 1, `active ${pose.active} for ${count} at ${p}`)
      assert.ok(pose.packetY >= 0 && pose.packetY <= 1, `packetY ${pose.packetY}`)
      assert.ok(pose.explode >= 0 && pose.explode <= 1)
    }
  }
  assert.deepEqual(stackPose(-3, 5), stackPose(0, 5))
  assert.deepEqual(stackPose(4, 5), stackPose(1, 5))
})

test('terminalAt types nothing at 0 and never untypes over a sweep', () => {
  const start = terminalAt(CONFIG, 0)
  assert.equal(typedLength(CONFIG, 0), 0)
  assert.ok(start.blocks.every(b => !b.done && b.result === null))
  let last = 0
  for (const p of sweep()) {
    const len = typedLength(CONFIG, p)
    assert.ok(len >= last, `typed shrank at ${p}`)
    last = len
  }
})

test('terminalAt finishes every block with its result at 1', () => {
  const end = terminalAt(CONFIG, 1)
  assert.equal(end.blocks.length, CONFIG.steps.length)
  end.blocks.forEach((b, i) => {
    assert.equal(b.done, true)
    assert.equal(b.prompt, CONFIG.steps[i].prompt)
    assert.deepEqual(b.typed, CONFIG.steps[i].lines)
    assert.equal(b.result, CONFIG.steps[i].result)
  })
})

test('terminalAt handles more steps than layers and no steps', () => {
  const many: StackConfig = { ...CONFIG, layers: CONFIG.layers.slice(0, 1), steps: [...CONFIG.steps, ...CONFIG.steps] }
  assert.ok(terminalAt(many, 1).blocks.every(b => b.done))
  const none: StackConfig = { ...CONFIG, steps: [] }
  assert.deepEqual(terminalAt(none, 0.5).blocks, [])
  assert.equal(readoutAt({ ...CONFIG, layers: [] }, 0.4).startsWith('→'), true)
})

test('readoutAt names the active layer and its first tech', () => {
  const p = sweep().find(x => stackPose(x, 5).active === 1 && x < 0.65)
  assert.ok(p !== undefined)
  assert.equal(readoutAt(CONFIG, p), '→ api · NestJS')
  const q = sweep().find(x => stackPose(x, 5).active === 4 && x < 0.65)
  assert.ok(q !== undefined)
  assert.equal(readoutAt(CONFIG, q), '→ cache')
  assert.equal(readoutAt(CONFIG, 1), '→ ready')
})

test('engine functions are pure', () => {
  const snapshot = JSON.parse(JSON.stringify(CONFIG))
  for (const p of [0, 0.3, 0.7, 1]) {
    assert.deepEqual(stackPose(p, 5), stackPose(p, 5))
    assert.deepEqual(terminalAt(CONFIG, p), terminalAt(CONFIG, p))
    assert.equal(readoutAt(CONFIG, p), readoutAt(CONFIG, p))
  }
  assert.deepEqual(CONFIG, snapshot)
})
