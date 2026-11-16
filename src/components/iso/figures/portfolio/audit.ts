/*
  Geometry audit for the drafting plotter (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/figures/portfolio/audit.ts

  It records every drawn item's true shapes into the kit's audit recorder in the exact painter's order the page uses
  (keys are draw positions, never re-settled), then runs every check of kit/audit.mjs at a grid of poses that covers
  the gantry's whole travel, the head's whole travel and the pen up and down. It ends `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, lineSvg, solidSvg, translateAlong, type Plan, type Plane, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { GANTRY_MAX, GANTRY_MIN, HEAD_MAX, HEAD_MIN, PARTS, PROJECTION as P, ROUTES, type Frame, type Mark, type Move, type Shape, type Slot } from '@/components/iso/figures/portfolio/geometry'
import { LIFT } from '@/components/iso/figures/portfolio/model'

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
  extruded (ring: Plane[], z: number, height: number, meta: Meta): Recorded
  cylinder (cx: number, cy: number, r: number, z: number, height: number, meta: Meta): Recorded
  solid (F: Frame, profile: [number, number][], meta: Meta): Recorded
  ball (at: Point3, r: number, meta: Meta): Recorded
  tube (points: Point3[], radii: number[], meta: Meta): Recorded
  moved (shape: Recorded, offset: Point3): Recorded
  overlapsOf (items: Item[], P: Projection, options: { states: number[], skip: unknown }): unknown
  sameRun: unknown
  audit (R: Recorder, P: Projection, options: Meta): Result
  report (result: Result): string
  failures (result: Result): number
}

type Pose = { gx: number, hy: number, lift: number }

function offsetOf (move: Move | 'ink', pose: Pose): Point3 {
  if (move === 'gantry') return [pose.gx, 0, 0]
  if (move === 'head') return [pose.gx, pose.hy, 0]
  if (move === 'pen') return [pose.gx, pose.hy, pose.lift * LIFT]
  return [0, 0, 0]
}

function markSvg (mark: Mark) {
  if (mark.kind === 'solid') return solidSvg(mark.paths, { tone: mark.tone, crease: mark.crease, lit: mark.lit, flat: mark.flat, inner: (mark.inner ?? []).map(seam => lineSvg(seam.d, { tone: seam.tone })).join('') })
  if (mark.kind === 'line') return lineSvg(mark.d, { tone: mark.tone, free: mark.free })
  if (mark.kind === 'dots') return dotsSvg(mark.points, { size: mark.size, tone: mark.tone })
  if (mark.kind === 'halo') return ''
  return `<g class="tb"><path class="tb-body" d="${mark.body}"/><path class="iso-line tb-edge" d="${mark.edges}"/></g>`
}

function shapeOf (shape: Shape & { meta?: Record<string, unknown> }, name: string) {
  const meta = { name, ...(shape.meta ?? {}) }
  if (shape.kind === 'slab') return A.slab(shape.plan, shape.z, shape.h, meta, shape.steps)
  if (shape.kind === 'extruded') return A.extruded(shape.ring, shape.z, shape.h, meta)
  if (shape.kind === 'cylinder') return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta)
  if (shape.kind === 'turned') return A.solid(shape.F, shape.profile, meta)
  if (shape.kind === 'ball') return A.ball(shape.c, shape.r, meta)
  return A.tube(shape.points, shape.radii, meta)
}

function auditPose (pose: Pose) {
  const R = A.recorder(P)
  let key = 0
  for (const slot of PARTS) {
    if (slot.move === 'ink') continue
    const offset = offsetOf(slot.move, pose)
    const shift = translateAlong(P, offset)
    for (const part of (slot as Slot).items) {
      if (!part.shapes.length) continue
      const name = R.nameFor(part.name)
      const shapes = part.shapes.map(shape => {
        const recorded = A.moved(shapeOf(shape, name), offset)
        return shape.kind === 'tube' ? recorded : R.solid(recorded)
      })
      R.put({ name, key: key++, svg: `<g transform="${shift}">${part.marks.map(markSvg).join('')}</g>`, shapes, route: part.name.includes(':') ? part.name.split(':')[0] : undefined, chunk: part.name.includes(':') ? Number(part.name.split(':')[1]) : undefined })
    }
  }
  for (const route of ROUTES) {
    const offset = offsetOf(route.move, pose)
    R.route(route.name, route.points.map(point => [point[0] + offset[0], point[1] + offset[1], point[2] + offset[2]]), route.r, { gaps: route.gaps, rims: route.rims, limp: true })
  }
  const overlaps = A.overlapsOf(R.items, P, { states: [0], skip: A.sameRun })
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map(entry => entry.key), rules: 0, cycles: [], dropped: [] }, states: [0] }
  const result = A.audit(R, P, {})
  return { result, R }
}

const quick = process.argv.includes('--quick')
const gxs = quick ? [GANTRY_MIN, GANTRY_MAX] : [GANTRY_MIN, -95, -75, -55, -35, -15, 5, 25, 45, GANTRY_MAX]
const hys = quick ? [0] : [HEAD_MIN, 0, HEAD_MAX]
const lifts = quick ? [0] : [0, 1]
const poses: Pose[] = gxs.flatMap(gx => hys.flatMap(hy => lifts.map(lift => ({ gx, hy, lift }))))

let total = 0
const started = Date.now()
const seen = new Set<string>()
for (const pose of poses) {
  const { result, R } = auditPose(pose)
  const count = A.failures(result)
  total += count
  const label = `pose gantry ${pose.gx.toFixed(1)} · head ${pose.hy.toFixed(1)} · lift ${pose.lift}`
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
