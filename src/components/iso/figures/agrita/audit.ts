/*
  Geometry audit for the traceability line (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/figures/agrita/audit.ts

  It records every drawn item's true shapes into the kit's audit recorder in the exact painter's order the page uses
  (keys are draw positions, never re-settled), then runs every check of kit/audit.mjs at a grid of poses: the crate at
  stops over its whole travel (jog included) with the pad up, and the crate docked (as far off as the jog can still
  push it) at every stage of the stamp's stroke, with and without the printed label. It ends `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, lineSvg, solidSvg, translateAlong, type Plan, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { CRATE_MAX, CRATE_MIN, PARTS, PROJECTION as P, ROUTES, type Frame, type Mark, type Move, type Shape } from '@/components/iso/figures/agrita/geometry'
import { JOG, SCAN_X, STROKE, X_END } from '@/components/iso/figures/agrita/model'

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
  put (item: { name: string, key: number, svg: string, shapes: Recorded[], route?: string, chunk?: number }): Item
  route (name: string, points: Point3[], radius: number, options: { gaps: [number, number][], rims: [number, number], limp: boolean }): unknown
}
type Result = Record<string, unknown>
const A = auditModule as unknown as {
  recorder (P: Projection): Recorder
  slab (plan: Plan, z: number, height: number, meta: Meta, steps: number): Recorded
  cylinder (cx: number, cy: number, r: number, z: number, height: number, meta: Meta): Recorded
  solid (F: Frame, profile: [number, number][], meta: Meta): Recorded
  tube (points: Point3[], radii: number[], meta: Meta): Recorded
  moved (shape: Recorded, offset: Point3): Recorded
  overlapsOf (items: Item[], P: Projection, options: { states: number[], skip: unknown }): unknown
  sameRun: unknown
  audit (R: Recorder, P: Projection, options: Meta): Result
  report (result: Result): string
  failures (result: Result): number
}

type Pose = { x: number, press: number, label: boolean }

function offsetOf (move: Move, pose: Pose): Point3 {
  if (move === 'crate') return [pose.x, 0, 0]
  if (move === 'pad') return [0, 0, -pose.press * STROKE]
  return [0, 0, 0]
}

function markSvg (mark: Mark) {
  if (mark.kind === 'solid') return solidSvg(mark.paths, { tone: mark.tone, crease: mark.crease, lit: mark.lit, inner: (mark.inner ?? []).map(seam => lineSvg(seam.d, { tone: seam.tone })).join('') })
  if (mark.kind === 'line') return lineSvg(mark.d, { tone: mark.tone, free: mark.free })
  if (mark.kind === 'dots') return dotsSvg(mark.points, { size: mark.size, tone: mark.tone })
  if (mark.kind === 'halo') return ''
  return `<g class="tb"><path class="tb-body" d="${mark.body}"/><path class="iso-line tb-edge" d="${mark.edges}"/></g>`
}

function shapeOf (shape: Shape & { meta?: Record<string, unknown> }, name: string) {
  const meta = { name, ...(shape.meta ?? {}) }
  if (shape.kind === 'slab') return A.slab(shape.plan, shape.z, shape.h, meta, shape.steps)
  if (shape.kind === 'cylinder') return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta)
  if (shape.kind === 'turned') return A.solid(shape.F, shape.profile, meta)
  return A.tube(shape.points, shape.radii, meta)
}

function auditPose (pose: Pose) {
  const R = A.recorder(P)
  let key = 0
  for (const slot of PARTS) {
    if (slot.show === 'label' && !pose.label) continue
    const offset = offsetOf(slot.move, pose)
    const shift = translateAlong(P, offset)
    for (const part of slot.items) {
      if (!part.shapes.length) continue
      const name = R.nameFor(part.name)
      const shapes = part.shapes.map(shape => {
        const recorded = A.moved(shapeOf(shape, name), offset)
        return shape.kind === 'tube' ? recorded : R.solid(recorded)
      })
      const [route, chunk] = part.name.split(':')
      R.put({ name, key: key++, svg: `<g transform="${shift}">${part.marks.map(markSvg).join('')}</g>`, shapes, route: chunk === undefined ? undefined : route, chunk: chunk === undefined ? undefined : Number(chunk) })
    }
  }
  for (const route of ROUTES) R.route(route.name, route.points, route.r, { gaps: route.gaps, rims: route.rims, limp: true })
  const overlaps = A.overlapsOf(R.items, P, { states: [0], skip: A.sameRun })
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map(entry => entry.key), rules: 0, cycles: [], dropped: [] }, states: [0] }
  const result = A.audit(R, P, {})
  return { result, R }
}

const quick = process.argv.includes('--quick')
// The crate over its whole travel with the pad up; the label is on only once the lot is recorded and stamped.
const stops = quick ? [CRATE_MIN, SCAN_X, CRATE_MAX] : Array.from({ length: 15 }, (_, index) => CRATE_MIN + ((CRATE_MAX - CRATE_MIN) * index) / 14)
const travel: Pose[] = stops.flatMap(x => (x >= X_END - JOG ? [false, true] : [false]).map(label => ({ x, press: 0, label })))
// The stamp's stroke: the jog is held back by (1 - press), so a pressed pad finds the crate nearly docked.
const presses = quick ? [1] : [0.25, 0.5, 0.75, 1]
const stamping: Pose[] = presses.flatMap(press => [-1, 0, 1].flatMap(side => {
  const x = X_END + side * JOG * (1 - press)
  return press === 1 ? [{ x, press, label: true }] : [{ x, press, label: false }, { x, press, label: true }]
}))
const poses = [...travel, ...stamping]

let total = 0
const started = Date.now()
const seen = new Set<string>()
for (const pose of poses) {
  const { result, R } = auditPose(pose)
  const count = A.failures(result)
  total += count
  const label = `pose crate ${pose.x.toFixed(1)} · press ${pose.press} · label ${pose.label ? 'on' : 'off'}`
  if (count) {
    const lines = A.report(result).split('\n').filter((text: string) => !seen.has(text))
    lines.forEach((text: string) => seen.add(text))
    console.log(`${label}: ${count} problems\n${lines.join('\n')}`)
  } else console.log(`${label}: 0 problems · ${R.solids.length} solids · ${R.tubes.length} tubes · ${R.items.length} items`)
  if (pose === poses[0]) console.log(A.report(result))
}
console.log(`audit · ${poses.length} poses · ${((Date.now() - started) / 1000).toFixed(1)} s`)
console.log(total ? `audit failed: ${total} problems` : 'audit passed')
if (total) process.exitCode = 1
