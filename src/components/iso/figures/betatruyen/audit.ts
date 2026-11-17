/*
  Geometry audit for the forum desk (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/figures/betatruyen/audit.ts

  It records every drawn item's true shapes into the kit's audit recorder in the exact painter's order the page uses
  (keys are draw positions, never re-settled), with the turning parts rebuilt for each pose, then runs every check of
  kit/audit.mjs at a grid of poses along the whole scroll run plus the lever's nudge at both ends. It ends
  `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, lineSvg, solidSvg, translateAlong, type Plane, type Plan, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { PARTS, PROJECTION as P, offsetsOf, turnPaths, turnShapes, type Frame, type Mark, type Shape, type Slot } from '@/components/iso/figures/betatruyen/geometry'
import { poseOf, type DeskPose } from '@/components/iso/figures/betatruyen/model'

// The slice of kit/audit.mjs (plain JS) this script uses. Recorded shapes and results stay opaque here.
type Recorded = { readonly kind: string }
type Meta = Record<string, unknown>
type Item = { key: number }
type Recorder = {
  items: Item[]
  solids: Recorded[]
  tubes: Recorded[]
  settled: unknown
  nameFor (base: string): string
  solid (shape: Recorded): Recorded
  put (item: { name: string, key: number, svg: string, shapes: Recorded[] }): Item
}
type Result = Record<string, unknown>
const A = auditModule as unknown as {
  recorder (P: Projection): Recorder
  slab (plan: Plan, z: number, height: number, meta: Meta, steps: number): Recorded
  cylinder (cx: number, cy: number, r: number, z: number, height: number, meta: Meta): Recorded
  solid (F: Frame, profile: [number, number][], meta: Meta): Recorded
  prism (F: Frame, polygon: Plane[], s0: number, s1: number, meta: Meta): Recorded
  moved (shape: Recorded, offset: Point3): Recorded
  overlapsOf (items: Item[], P: Projection, options: { states: number[] }): unknown
  audit (R: Recorder, P: Projection, options: Meta): Result
  report (result: Result): string
  failures (result: Result): number
}

function markSvg (mark: Mark) {
  if (mark.kind === 'solid') return solidSvg(mark.paths, { tone: mark.tone, crease: mark.crease, lit: mark.lit, inner: (mark.inner ?? []).map(seam => lineSvg(seam.d, { tone: seam.tone })).join('') })
  if (mark.kind === 'line') return lineSvg(mark.d, { tone: mark.tone, free: mark.free })
  if (mark.kind === 'dots') return dotsSvg(mark.points, { size: mark.size, tone: mark.tone })
  return ''
}

function shapeOf (shape: Shape, name: string) {
  const meta = { name }
  if (shape.kind === 'slab') return A.slab(shape.plan, shape.z, shape.h, meta, shape.steps)
  if (shape.kind === 'cylinder') return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta)
  if (shape.kind === 'turned') return A.solid(shape.F, shape.profile, meta)
  return A.prism(shape.F, shape.poly, shape.s0, shape.s1, meta)
}

function auditPose (pose: DeskPose) {
  const R = A.recorder(P)
  const offsets = offsetsOf(pose)
  const turns = turnShapes(pose)
  const turnSvg = turnPaths(pose)
  let key = 0
  for (const slot of PARTS) {
    if (slot.move === 'turn') {
      const name = R.nameFor(slot.name)
      R.put({ name, key: key++, svg: solidSvg(turnSvg[slot.key], { tone: slot.tone }), shapes: [R.solid(shapeOf(turns[slot.key], name))] })
      continue
    }
    const offset: Point3 = slot.move === 'still' ? [0, 0, 0] : offsets[slot.move]
    const shift = translateAlong(P, offset)
    for (const part of (slot as Slot).items) {
      if (!part.shapes.length) continue
      const name = R.nameFor(part.name)
      const shapes = part.shapes.map(shape => R.solid(A.moved(shapeOf(shape, name), offset)))
      R.put({ name, key: key++, svg: `<g transform="${shift}">${part.marks.map(markSvg).join('')}</g>`, shapes })
    }
  }
  const overlaps = A.overlapsOf(R.items, P, { states: [0] })
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map(entry => entry.key), rules: 0, cycles: [], dropped: [] }, states: [0] }
  const result = A.audit(R, P, {})
  return { result, R }
}

const quick = process.argv.includes('--quick')
const runs = quick ? [0, 1] : [0, 0.08, 0.15, 0.22, 0.3, 0.4, 0.45, 0.5, 0.55, 0.59, 0.63, 0.7, 0.75, 0.8, 0.85, 0.9, 1]
const poses = runs.flatMap(run => (run === 0 || run === 1 ? [-1, 0, 1] : [0]).map(nudge => ({ run, nudge })))

let total = 0
const started = Date.now()
const seen = new Set<string>()
for (const state of poses) {
  const { result, R } = auditPose(poseOf(state))
  const count = A.failures(result)
  total += count
  const label = `pose run ${state.run.toFixed(2)} · nudge ${state.nudge}`
  if (count) {
    const lines = A.report(result).split('\n').filter((text: string) => !seen.has(text))
    lines.forEach((text: string) => seen.add(text))
    console.log(`${label}: ${count} problems\n${lines.join('\n')}`)
  } else console.log(`${label}: 0 problems · ${R.solids.length} solids · ${R.items.length} items`)
  if (state === poses[0]) console.log(A.report(result))
}
console.log(`audit · ${poses.length} poses · ${((Date.now() - started) / 1000).toFixed(1)} s`)
console.log(total ? `audit failed: ${total} problems` : 'audit passed')
if (total) process.exitCode = 1
