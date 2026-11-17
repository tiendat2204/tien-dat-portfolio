/*
  Geometry audit for the stack anatomy (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/stack/audit.ts

  For 1, 4, 6 and 8 layers (with all three satellite boards, then 0 to 2 for 1, 5 and 8 layers) it records every drawn item's true shapes into the kit's
  audit recorder in the exact painter's order the page uses (keys are draw positions, never re-settled), with each
  board at its offset for the explode amount and the packet at the top, middle and bottom of its travel, then runs
  every check of kit/audit.mjs. Explode 0, 0.5 and 1. It ends `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, lineSvg, solidSvg, translateAlong, type Plan, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { plateOffset, stackArt, type Mark, type Shape, type StackArt } from '@/components/iso/stack/geometry'

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
  moved (shape: Recorded, offset: Point3): Recorded
  overlapsOf (items: Item[], P: Projection, options: { states: number[], skip: unknown }): unknown
  sameRun: unknown
  audit (R: Recorder, P: Projection, options: Meta): Result
  report (result: Result): string
  failures (result: Result): number
}

type Pose = { layers: number, sides: number, explode: number, packetY: number }

function markSvg (mark: Mark) {
  if (mark.kind === 'solid') return solidSvg(mark.paths, { tone: mark.tone, crease: mark.crease, inner: (mark.inner ?? []).map(seam => lineSvg(seam.d, { tone: seam.tone })).join('') })
  if (mark.kind === 'line') return lineSvg(mark.d, { tone: mark.tone, free: mark.free })
  if (mark.kind === 'dots') return dotsSvg(mark.points, { size: mark.size, tone: mark.tone })
  return ''
}

function shapeOf (shape: Shape, name: string) {
  const meta = { name, ground: shape.ground || undefined }
  if (shape.kind === 'slab') return A.slab(shape.plan, shape.z, shape.h, meta, shape.steps)
  return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta)
}

function auditPose (art: StackArt, pose: Pose) {
  const P = art.P
  const R = A.recorder(P)
  let key = 0
  const put = (items: { name: string, marks: Mark[], shapes: Shape[] }[], offset: Point3) => {
    const shift = translateAlong(P, offset)
    for (const part of items) {
      if (!part.shapes.length) continue
      const name = R.nameFor(part.name)
      const shapes = part.shapes.map(shape => R.solid(A.moved(shapeOf(shape, name), offset)))
      R.put({ name, key: key++, svg: `<g transform="${shift}">${part.marks.map(markSvg).join('')}</g>`, shapes })
    }
  }
  for (const group of art.groups) {
    if (group.move === 'still') put(group.items, [0, 0, 0])
    else if (group.move === 'packet') put(group.items, art.packetOffset(pose.packetY, pose.explode))
    else {
      const offset: Point3 = [0, 0, plateOffset(art.stack, group.plate, pose.explode).z]
      put(group.items, offset)
      put(group.top, offset)
    }
  }
  const overlaps = A.overlapsOf(R.items, P, { states: [0], skip: A.sameRun })
  // Solver bypassed on purpose: keys are the authored draw order the page paints, and depth cycles are not detected by the solver.
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map(entry => entry.key), rules: 0, cycles: [], dropped: [] }, states: [0] }
  return { result: A.audit(R, P, {}), R }
}

// Every pose with all three satellite boards; fewer side modules (the label plate takes a free place) at rest and open.
const poses: Pose[] = [
  ...[1, 4, 6, 8].flatMap(layers => [0, 0.5, 1].flatMap(explode => [0, 0.5, 1].map(packetY => ({ layers, sides: 3, explode, packetY })))),
  ...[0, 1, 2].flatMap(sides => [1, 5, 8].flatMap(layers => [0, 1].map(explode => ({ layers, sides, explode, packetY: 0.5 })))),
]

let total = 0
const started = Date.now()
const seen = new Set<string>()
for (const pose of poses) {
  const art = stackArt(pose.layers, pose.sides)
  const { result, R } = auditPose(art, pose)
  const count = A.failures(result)
  total += count
  const label = `layers ${pose.layers} · sides ${pose.sides} · explode ${pose.explode} · packet ${pose.packetY}`
  if (count) {
    const lines = A.report(result).split('\n').filter((text: string) => !seen.has(text))
    lines.forEach((text: string) => seen.add(text))
    console.log(`${label}: ${count} problems\n${lines.join('\n')}`)
  } else console.log(`${label}: 0 problems · ${R.solids.length} solids · ${R.items.length} items`)
  if (pose === poses[0]) console.log(A.report(result))
}
console.log(`audit · ${poses.length} poses · ${((Date.now() - started) / 1000).toFixed(1)} s`)
console.log(total ? `audit failed: ${total} problems` : 'audit passed')
if (total) process.exitCode = 1
