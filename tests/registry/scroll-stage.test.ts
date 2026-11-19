import assert from 'node:assert/strict'
import test from 'node:test'

import { draw, fade, pulse, rise, seg, travel, writeProgress } from '../../src/registry/ScrollStage/scroll-progress'
import { createFrameThrottle, scrollStagePlan } from '../../src/registry/ScrollStage/scroll-stage-plan'

test('plan: reduced motion wins over width', () => {
  assert.equal(scrollStagePlan(1440, true, 1024), 'static')
  assert.equal(scrollStagePlan(320, true, 1024), 'static')
})

test('plan: pins from pinFrom up and stacks below it', () => {
  assert.equal(scrollStagePlan(1024, false, 1024), 'pinned')
  assert.equal(scrollStagePlan(1023, false, 1024), 'stacked')
  assert.equal(scrollStagePlan(900, false, 768), 'pinned')
})

test('seg is a clamped calc of --p between a and b', () => {
  assert.equal(seg(0.2, 0.6), 'clamp(0, calc((var(--p) - 0.2) / 0.4), 1)')
})

test('seg never divides by zero when a equals b', () => {
  assert.match(seg(0.5, 0.5), /\/ 0\.0001\)/)
})

test('draw, fade, rise, travel and pulse build styles from seg', () => {
  assert.equal(draw(0, 0.5).strokeDasharray, 1)
  assert.match(String(draw(0, 0.5).strokeDashoffset), /^calc\(1 - clamp\(/)
  assert.equal(fade(0.1, 0.3).opacity, seg(0.1, 0.3))
  assert.match(String(rise(0, 0.2, 4, 8).transform), /translate\(calc\(\(1 - clamp.*\) \* 4px\), calc\(\(1 - clamp.*\) \* 8px\)\)/)
  assert.match(String(travel(0, 1, 100).transform), /translate\(calc\(clamp.*\* 100px\), calc\(clamp.*\* 0px\)\)/)
  assert.match(String(pulse(0.2, 0.6).opacity), /^calc\(min\(clamp\(0, calc\(\(var\(--p\) - 0.2\)/)
})

test('writeProgress sets --p and data-progress with four decimals', () => {
  const props = new Map<string, string>()
  const element = { dataset: {} as Record<string, string>, style: { setProperty: (name: string, value: string) => props.set(name, value) } }

  writeProgress(element as unknown as HTMLElement, 0.5)

  assert.equal(element.dataset.progress, '0.5000')
  assert.equal(props.get('--p'), '0.5000')
})

test('frame throttle runs once per frame and can be cancelled', () => {
  const frames = new Map<number, () => void>()
  let next = 1
  let runs = 0
  const throttle = createFrameThrottle(
    () => { runs++ },
    callback => { frames.set(next, callback); return next++ },
    id => { frames.delete(id) }
  )

  throttle.request()
  throttle.request()
  assert.equal(frames.size, 1)
  frames.forEach(callback => callback())
  frames.clear()
  assert.equal(runs, 1)

  throttle.request()
  throttle.cancel()
  assert.equal(frames.size, 0)
})
