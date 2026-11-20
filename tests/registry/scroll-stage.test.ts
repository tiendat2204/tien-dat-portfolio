import assert from 'node:assert/strict'
import test from 'node:test'

import { draw, fade, pulse, rise, seg, travel, writeProgress, writeSmoothed } from '../../src/registry/ScrollStage/scroll-progress'
import { chapterAt, chapterTarget, createFrameThrottle, progressToScroll, scrollStagePlan, smoothToward } from '../../src/registry/ScrollStage/scroll-stage-plan'

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

test('chapterAt returns the last chapter that has started', () => {
  const chapters = [{ at: 0, label: 'a' }, { at: 0.3, label: 'b' }, { at: 0.7, label: 'c' }]

  assert.equal(chapterAt(0, chapters), 0)
  assert.equal(chapterAt(0.29, chapters), 0)
  assert.equal(chapterAt(0.3, chapters), 1)
  assert.equal(chapterAt(0.69, chapters), 1)
  assert.equal(chapterAt(1, chapters), 2)
  assert.equal(chapterAt(0.5, []), 0)
})

test('progressToScroll maps progress onto the trigger range and clamps it', () => {
  assert.equal(progressToScroll(1000, 2000, 0.5), 1500)
  assert.equal(progressToScroll(1000, 2000, -1), 1000)
  assert.equal(progressToScroll(1000, 2000, 2), 2000)
})

test('smoothToward eases toward the target, reports velocity and settles exactly', () => {
  const step = smoothToward(0, 1)

  assert.ok(step.value > 0 && step.value < 1)
  assert.equal(step.velocity, 1)
  assert.deepEqual(smoothToward(0.9998, 1), { value: 1, velocity: 0 })
  assert.equal(smoothToward(1, 0.5).velocity, -1)
  assert.ok(Math.abs(smoothToward(0.5, 0.52).velocity - 0.16) < 1e-9)
})

test('writeSmoothed sets --ps and --v', () => {
  const props = new Map<string, string>()
  const element = { style: { setProperty: (name: string, value: string) => props.set(name, value) } }

  writeSmoothed(element as unknown as HTMLElement, 0.25, -0.5)

  assert.equal(props.get('--ps'), '0.2500')
  assert.equal(props.get('--v'), '-0.500')
})

test('chapterTarget lands just inside a chapter and never reaches the next one', () => {
  const far = [{ at: 0, label: 'a' }, { at: 0.3, label: 'b' }, { at: 0.7, label: 'c' }]
  const close = [{ at: 0, label: 'a' }, { at: 0.3, label: 'b' }, { at: 0.301, label: 'c' }]

  assert.equal(chapterTarget(far[1], far), 0.302)
  assert.equal(chapterAt(chapterTarget(far[1], far), far), 1)
  assert.equal(chapterAt(chapterTarget(close[1], close), close), 1)
  assert.ok(chapterTarget(close[1], close) < 0.301)
  assert.ok(chapterTarget(far[2], far) <= 1)
})
