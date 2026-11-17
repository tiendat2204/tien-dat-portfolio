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

const FIVE: StackConfig = {
  ...CONFIG,
  steps: [
    { layer: 1, prompt: 'curl /api/v1/farms', lines: ['@Get()', 'findAll ()'], result: '200 OK' },
    { layer: 3, prompt: 'psql', lines: ['select * from farms;'], result: '12 rows' },
  ],
}

// Down-travel window of layer k of n.
function windowOf (k: number, n: number): [number, number] {
  return [0.15 + 0.5 * k / n, 0.15 + 0.5 * (k + 1) / n]
}

function mid (k: number, n: number): number {
  const [a, b] = windowOf(k, n)
  return (a + b) / 2
}

function charsOf (block: { prompt: string, typed: string[] }): number {
  return block.prompt.length + block.typed.reduce((s, l) => s + l.length, 0)
}

test('terminalAt types each step only inside its layer window', () => {
  const inZero = terminalAt(FIVE, mid(0, 5))
  assert.ok(inZero.blocks.every(b => charsOf(b) === 0 && !b.done))
  const inOne = terminalAt(FIVE, mid(1, 5))
  assert.ok(charsOf(inOne.blocks[0]) > 0 && !inOne.blocks[0].done)
  assert.equal(charsOf(inOne.blocks[1]), 0)
  assert.equal(inOne.cursor.block, 0)
  assert.equal(stackPose(mid(1, 5), 5).active, 1)
  const inTwo = terminalAt(FIVE, mid(2, 5))
  assert.ok(inTwo.blocks[0].done && inTwo.blocks[0].result === '200 OK')
  assert.equal(charsOf(inTwo.blocks[1]), 0)
  const inThree = terminalAt(FIVE, mid(3, 5))
  assert.ok(charsOf(inThree.blocks[1]) > 0 && !inThree.blocks[1].done)
  assert.equal(inThree.cursor.block, 1)
  assert.equal(stackPose(mid(3, 5), 5).active, 3)
})

test('terminalAt splits a shared layer window between its steps in order', () => {
  const shared: StackConfig = {
    ...CONFIG,
    steps: [
      { layer: 2, prompt: 'first', lines: ['a'], result: 'one' },
      { layer: 2, prompt: 'second', lines: ['b'], result: 'two' },
    ],
  }
  const [a, b] = windowOf(2, 5)
  const early = terminalAt(shared, a + (b - a) * 0.25)
  assert.ok(charsOf(early.blocks[0]) > 0 && !early.blocks[0].done)
  assert.equal(charsOf(early.blocks[1]), 0)
  const late = terminalAt(shared, a + (b - a) * 0.75)
  assert.ok(late.blocks[0].done)
  assert.ok(charsOf(late.blocks[1]) > 0 && !late.blocks[1].done)
  assert.equal(late.cursor.block, 1)
})

test('terminalAt is monotone and complete by 0.65 for unsorted and out-of-range layers', () => {
  const messy: StackConfig = {
    ...CONFIG,
    steps: [
      { layer: 9, prompt: 'deploy', lines: ['ok'], result: 'live' },
      { layer: 2, prompt: 'build', lines: ['tsc'], result: 'built' },
      { layer: -4, prompt: 'start', lines: [''], result: 'up' },
    ],
  }
  for (const config of [FIVE, messy, CONFIG]) {
    let last = 0
    for (const p of sweep(400)) {
      const len = terminalAt(config, p).blocks.reduce((s, b) => s + charsOf(b), 0)
      assert.ok(len >= last, `typed shrank at ${p}`)
      last = len
    }
    for (const p of [0.65, 0.8, 1]) {
      const state = terminalAt(config, p)
      state.blocks.forEach((b, i) => {
        assert.equal(b.done, true, `block ${i} not done at ${p}`)
        assert.equal(b.result, config.steps[i].result)
      })
    }
  }
  assert.ok(charsOf(terminalAt(messy, mid(0, 5)).blocks[2]) > 0)
  assert.equal(charsOf(terminalAt(messy, mid(3, 5)).blocks[0]), 0)
  assert.ok(charsOf(terminalAt(messy, mid(4, 5)).blocks[0]) > 0)
})

test('terminalAt works for 1 and 8 layers', () => {
  for (const count of [1, 8]) {
    const layers = Array.from({ length: count }, (_, i) => ({ id: `l${i}`, label: `l${i}`, tech: [`t${i}`] }))
    const config: StackConfig = { ...CONFIG, layers, steps: layers.map((_, i) => ({ layer: i, prompt: `p${i}`, lines: [`line ${i}`], result: `r${i}` })) }
    for (const p of sweep(50)) {
      const state = terminalAt(config, p)
      assert.equal(state.blocks.length, count)
      assert.ok(state.cursor.block >= 0 && state.cursor.block < count)
    }
    assert.ok(terminalAt(config, 0.65).blocks.every(b => b.done))
  }
})
