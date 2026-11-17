import assert from 'node:assert/strict'
import test from 'node:test'
import { PHASES, readoutAt, sheetPose, stackPose, terminalAt } from '../../src/components/iso/stack/engine'
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
  skin: 'web',
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

// Down-travel window of layer k of n (phase table: packet down 0.38-0.80).
function windowOf (k: number, n: number): [number, number] {
  return [0.38 + 0.42 * k / n, 0.38 + 0.42 * (k + 1) / n]
}

function mid (k: number, n: number): number {
  const [a, b] = windowOf(k, n)
  return (a + b) / 2
}

function charsOf (block: { prompt: string, typed: string[] }): number {
  return block.prompt.length + block.typed.reduce((s, l) => s + l.length, 0)
}

test('the phase table is contiguous from 0 to 1 and matches the spec', () => {
  assert.deepEqual(PHASES, {
    skin: [0, 0.1],
    scan: [0.1, 0.3],
    explode: [0.3, 0.38],
    down: [0.38, 0.8],
    up: [0.8, 0.95],
    rest: [0.95, 1],
  })
  const order = [PHASES.skin, PHASES.scan, PHASES.explode, PHASES.down, PHASES.up, PHASES.rest]
  assert.equal(order[0][0], 0)
  assert.equal(order[order.length - 1][1], 1)
  for (let i = 1; i < order.length; i++) assert.equal(order[i][0], order[i - 1][1])
})

test('sheetPose starts as an undrawn skin', () => {
  const pose = sheetPose(0, 5)
  assert.equal(pose.skin, 0)
  assert.equal(pose.scan, 0)
  assert.equal(pose.explode, 0)
  assert.equal(pose.view, 'skin')
  assert.equal(pose.active, 0)
  assert.equal(pose.packetY, 0)
  assert.equal(pose.step, 0)
})

test('sheetPose draws the skin over 0-0.10 before the scan starts', () => {
  assert.ok(sheetPose(0.05, 5).skin > 0 && sheetPose(0.05, 5).skin < 1)
  assert.equal(sheetPose(0.1, 5).skin, 1)
  assert.equal(sheetPose(0.1, 5).scan, 0)
  assert.equal(sheetPose(1, 5).skin, 1)
})

test('scan and explode are monotone and stay done', () => {
  let lastScan = 0
  let lastExplode = 0
  for (const p of sweep(400)) {
    const pose = sheetPose(p, 5)
    assert.ok(pose.scan >= lastScan, `scan went back at ${p}`)
    assert.ok(pose.explode >= lastExplode, `explode went back at ${p}`)
    if (p <= 0.1) assert.equal(pose.scan, 0)
    if (p >= 0.3) assert.equal(pose.scan, 1)
    if (p <= 0.3) assert.equal(pose.explode, 0)
    if (p >= 0.38) assert.equal(pose.explode, 1)
    lastScan = pose.scan
    lastExplode = pose.explode
  }
  assert.ok(sheetPose(0.2, 5).scan > 0 && sheetPose(0.2, 5).scan < 1)
  assert.ok(sheetPose(0.34, 5).explode > 0 && sheetPose(0.34, 5).explode < 1)
})

test('view flips to assembly exactly at 0.30 and never back', () => {
  assert.equal(sheetPose(0.2999, 5).view, 'skin')
  assert.equal(sheetPose(0.3, 5).view, 'assembly')
  let flipped = false
  for (const p of sweep(400)) {
    const view = sheetPose(p, 5).view
    if (flipped) assert.equal(view, 'assembly', `flipped back at ${p}`)
    if (view === 'assembly') flipped = true
  }
})

test('the packet goes down over 0.38-0.80 and up over 0.80-0.95', () => {
  for (const p of sweep(400)) {
    const pose = sheetPose(p, 5)
    if (p > 0.38 && p < 0.8) assert.equal(pose.direction, 'down', `direction at ${p}`)
    if (p > 0.8 && p < 0.95) assert.equal(pose.direction, 'up', `direction at ${p}`)
    if (p < 0.38) assert.equal(pose.packetY, 0)
  }
  assert.equal(sheetPose(0.8, 5).packetY, 1)
  assert.equal(sheetPose(0.8, 5).active, 4)
  assert.equal(sheetPose(0.97, 5).packetY, 0)
})

test('active is monotone on the way down and in range for 1, 2 and 8 layers', () => {
  for (const n of [1, 2, 5, 8]) {
    let last = -1
    let lastY = -1
    for (const p of sweep(400)) {
      const pose = sheetPose(p, n)
      assert.ok(Number.isInteger(pose.active) && pose.active >= 0 && pose.active <= n - 1, `active ${pose.active} for ${n} at ${p}`)
      assert.ok(pose.packetY >= 0 && pose.packetY <= 1)
      if (p <= 0.8) {
        assert.ok(pose.active >= last, `active went back at ${p} for ${n}`)
        assert.ok(pose.packetY >= lastY, `packetY went back at ${p} for ${n}`)
        last = pose.active
        lastY = pose.packetY
      }
    }
    for (let k = 0; k < n; k++) assert.equal(sheetPose(mid(k, n), n).active, k)
  }
})

test('step is active + 1 during the travel and 0 at rest', () => {
  for (const n of [1, 2, 8]) {
    for (const p of sweep(400)) {
      const pose = sheetPose(p, n)
      if (p >= 0.38 && p < 0.95) assert.equal(pose.step, pose.active + 1, `step at ${p} for ${n}`)
      if (p >= 0.95) assert.equal(pose.step, 0)
      if (p < 0.38) assert.equal(pose.step, 0, `step at ${p} for ${n}`)
    }
  }
})

test('sheetPose clamps progress and is NaN safe', () => {
  for (const n of [1, 8, 0, -3, Number.NaN, 2.7]) {
    for (const p of [-1, 2, Number.NaN, Infinity, -Infinity]) {
      const pose = sheetPose(p, n)
      for (const key of ['skin', 'scan', 'explode', 'packetY'] as const) {
        assert.ok(pose[key] >= 0 && pose[key] <= 1, `${key} ${pose[key]} at ${p} for ${n}`)
      }
      assert.ok(Number.isInteger(pose.active) && pose.active >= 0)
    }
  }
  assert.deepEqual(sheetPose(-3, 5), sheetPose(0, 5))
  assert.deepEqual(sheetPose(Number.NaN, 5), sheetPose(0, 5))
  assert.deepEqual(sheetPose(4, 5), sheetPose(1, 5))
})

test('stackPose is the old pose shape on the new timing', () => {
  for (const p of sweep(100)) {
    const { active, packetY, direction, explode } = sheetPose(p, 5)
    assert.deepEqual(stackPose(p, 5), { active, packetY, direction, explode })
  }
})

test('terminalAt types nothing before the down travel and never untypes', () => {
  for (const p of [0, 0.1, 0.3, 0.37, 0.38]) {
    assert.equal(typedLength(CONFIG, p), 0, `typed at ${p}`)
    assert.ok(terminalAt(CONFIG, p).blocks.every(b => !b.done && b.result === null && charsOf(b) === 0))
  }
  let last = 0
  for (const p of sweep(400)) {
    const len = typedLength(CONFIG, p)
    assert.ok(len >= last, `typed shrank at ${p}`)
    last = len
  }
})

test('terminalAt finishes every block with its result at 0.80 and 1', () => {
  for (const p of [0.8, 0.9, 1]) {
    const end = terminalAt(CONFIG, p)
    assert.equal(end.blocks.length, CONFIG.steps.length)
    end.blocks.forEach((b, i) => {
      assert.equal(b.done, true)
      assert.equal(b.prompt, CONFIG.steps[i].prompt)
      assert.deepEqual(b.typed, CONFIG.steps[i].lines)
      assert.equal(b.result, CONFIG.steps[i].result)
    })
  }
})

test('terminalAt handles more steps than layers and no steps', () => {
  const many: StackConfig = { ...CONFIG, layers: CONFIG.layers.slice(0, 1), steps: [...CONFIG.steps, ...CONFIG.steps] }
  assert.ok(terminalAt(many, 1).blocks.every(b => b.done))
  const none: StackConfig = { ...CONFIG, steps: [] }
  assert.deepEqual(terminalAt(none, 0.5).blocks, [])
  assert.equal(readoutAt({ ...CONFIG, layers: [] }, 0.5), 'ready')
})

const FIVE: StackConfig = {
  ...CONFIG,
  steps: [
    { layer: 1, prompt: 'curl /api/v1/farms', lines: ['@Get()', 'findAll ()'], result: '200 OK' },
    { layer: 3, prompt: 'psql', lines: ['select * from farms;'], result: '12 rows' },
  ],
}

test('terminalAt types each step only inside its layer window', () => {
  const inZero = terminalAt(FIVE, mid(0, 5))
  assert.ok(inZero.blocks.every(b => charsOf(b) === 0 && !b.done))
  const inOne = terminalAt(FIVE, mid(1, 5))
  assert.ok(charsOf(inOne.blocks[0]) > 0 && !inOne.blocks[0].done)
  assert.equal(charsOf(inOne.blocks[1]), 0)
  assert.equal(inOne.cursor.block, 0)
  assert.equal(sheetPose(mid(1, 5), 5).active, 1)
  const inTwo = terminalAt(FIVE, mid(2, 5))
  assert.ok(inTwo.blocks[0].done && inTwo.blocks[0].result === '200 OK')
  assert.equal(charsOf(inTwo.blocks[1]), 0)
  const inThree = terminalAt(FIVE, mid(3, 5))
  assert.ok(charsOf(inThree.blocks[1]) > 0 && !inThree.blocks[1].done)
  assert.equal(inThree.cursor.block, 1)
  assert.equal(sheetPose(mid(3, 5), 5).active, 3)
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

test('terminalAt is monotone and complete by 0.80 for unsorted and out-of-range layers', () => {
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
    for (const p of [0.8, 0.9, 1]) {
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
    assert.equal(typedLength(config, 0.37), 0)
    assert.ok(terminalAt(config, 0.8).blocks.every(b => b.done))
  }
})

test('readoutAt walks the sheet, the scan, the steps and rest', () => {
  assert.equal(readoutAt(CONFIG, 0), 'sheet · web')
  assert.equal(readoutAt(CONFIG, 0.05), 'sheet · web')
  assert.equal(readoutAt({ ...CONFIG, skin: 'forum' }, 0.05), 'sheet · forum')
  assert.equal(readoutAt(CONFIG, 0.1), 'x-ray · scanning')
  assert.equal(readoutAt(CONFIG, 0.2), 'x-ray · scanning')
  assert.equal(readoutAt(CONFIG, 0.3), 'assembly · exploding')
  assert.equal(readoutAt(CONFIG, 0.34), 'assembly · exploding')
  assert.equal(readoutAt(CONFIG, 0.38), 'STEP 1/5 · ui · React')
  assert.equal(readoutAt(CONFIG, mid(4, 5)), 'STEP 5/5 · cache')
  assert.equal(readoutAt(CONFIG, 0.95), 'ready')
  assert.equal(readoutAt(CONFIG, 0.97), 'ready')
  assert.equal(readoutAt(CONFIG, 1), 'ready')
  const four: StackConfig = { ...CONFIG, layers: CONFIG.layers.slice(0, 4) }
  assert.equal(readoutAt(four, mid(1, 4)), 'STEP 2/4 · api · NestJS')
  assert.equal(readoutAt(four, mid(0, 4)), 'STEP 1/4 · ui · React')
})

test('readoutAt STEP always agrees with the layer the packet is in', () => {
  for (const n of [1, 2, 5, 8]) {
    const layers = Array.from({ length: n }, (_, i) => ({ id: `l${i}`, label: `l${i}`, tech: [`t${i}`] }))
    const config: StackConfig = { ...CONFIG, layers }
    for (const p of sweep(400)) {
      const pose = sheetPose(p, n)
      const text = readoutAt(config, p)
      if (p >= 0.38 && p < 0.95) assert.equal(text, `STEP ${pose.active + 1}/${n} · l${pose.active} · t${pose.active}`, `at ${p}`)
    }
  }
})

test('engine functions are pure and do not mutate the config', () => {
  const snapshot = JSON.parse(JSON.stringify(CONFIG))
  for (const p of [0, 0.05, 0.2, 0.34, 0.5, 0.7, 0.9, 1]) {
    assert.deepEqual(sheetPose(p, 5), sheetPose(p, 5))
    assert.deepEqual(stackPose(p, 5), stackPose(p, 5))
    assert.deepEqual(terminalAt(CONFIG, p), terminalAt(CONFIG, p))
    assert.equal(readoutAt(CONFIG, p), readoutAt(CONFIG, p))
  }
  assert.deepEqual(CONFIG, snapshot)
})
