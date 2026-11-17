import assert from 'node:assert/strict'
import test from 'node:test'
import { PIN_TOP_OFFSET, PIN_VIEWPORTS, scrollPlan } from '../../src/lib/projects/scroll-plan'

test('scrollPlan pins on desktop widths', () => {
  assert.equal(scrollPlan(1280, false), 'pinned')
  assert.equal(scrollPlan(1024, false), 'pinned')
})

test('scrollPlan stacks below 1024px', () => {
  assert.equal(scrollPlan(1023, false), 'stacked')
  assert.equal(scrollPlan(767, false), 'stacked')
})

test('scrollPlan is static under reduced motion at any width', () => {
  assert.equal(scrollPlan(1280, true), 'static')
  assert.equal(scrollPlan(320, true), 'static')
})

test('PIN_VIEWPORTS is 1.5', () => {
  assert.equal(PIN_VIEWPORTS, 1.5)
})

test('PIN_TOP_OFFSET is 96', () => {
  assert.equal(PIN_TOP_OFFSET, 96)
})

test('scrollPlan stacks fractional widths below 1024px', () => {
  assert.equal(scrollPlan(1023.5, false), 'stacked')
})
