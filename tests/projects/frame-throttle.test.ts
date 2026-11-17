import assert from 'node:assert/strict'
import test from 'node:test'
import { createFrameThrottle } from '../../src/lib/projects/frame-throttle'

function fakeFrames () {
  const pending = new Map<number, () => void>()
  let next = 1
  return {
    pending,
    schedule: (cb: () => void) => { pending.set(next, cb); return next++ },
    cancel: (id: number) => { pending.delete(id) },
    flush: () => { const cbs = [...pending.values()]; pending.clear(); cbs.forEach(cb => cb()) },
  }
}

test('coalesces a burst into one call per frame', () => {
  const f = fakeFrames()
  let calls = 0
  const t = createFrameThrottle(() => { calls++ }, f.schedule, f.cancel)
  t.request(); t.request(); t.request()
  assert.equal(f.pending.size, 1)
  f.flush()
  assert.equal(calls, 1)
  t.request()
  f.flush()
  assert.equal(calls, 2)
})

test('cancel drops the pending frame', () => {
  const f = fakeFrames()
  let calls = 0
  const t = createFrameThrottle(() => { calls++ }, f.schedule, f.cancel)
  t.request()
  t.cancel()
  f.flush()
  assert.equal(calls, 0)
})
