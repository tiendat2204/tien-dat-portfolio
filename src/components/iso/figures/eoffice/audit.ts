/*
  Geometry audit for the routing sorter (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/figures/eoffice/audit.ts

  It records every drawn item's true shapes into the kit's audit recorder in the exact painter's order the page uses
  (keys are draw positions, never re-settled), then runs every check of kit/audit.mjs at a grid of poses over the
  whole run: the sheet from feed to out-tray, each press through its stroke (with and without the hover tap) and each
  gate's flap at the swing the model gives it there. It ends `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, lineSvg, solidSvg, translateAlong, type Plan, type Plane, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { flapPaths, flapShape, PARTS, PROJECTION as P, ROUTES, type Frame, type Item, type Mark, type Shape, type Slot } from '@/components/iso/figures/eoffice/geometry'
import { eofficeModel, poseOf } from '@/components/iso/figures/eoffice/model'

// The slice of kit/audit.mjs (plain JS) this script uses. Recorded shapes and results stay opaque here.
type Recorded = { readonly kind: string }
type Meta = Record<string, unknown>
type Entry = { key: number }
type Recorder = {
  items: Entry[]
  solids: Recorded[]
  tubes: Recorded[]
  settled: unknown
  nameFor (base: string): string
  solid (shape: Recorded): Recorded
  put (item: { name: string, key: number, svg: string, shapes: Recorded[], route?: string, chunk?: number }): Entry
  route (name: string, points: Point3[], radius: number, options: { gaps: [number, number][], rims: [number, number], limp: boolean }): unknown
}
type Result = Record<string, unknown>
const A = auditModule as unknown as {
  recorder (P: Projection): Recorder
  slab (plan: Plan, z: number, height: number, meta: Meta, steps: number): Recorded
  cylinder (cx: number, cy: number, r: number, z: number, height: number, meta: Meta): Recorded
  solid (F: Frame, profile: [number, number][], meta: Meta): Recorded
  prism (F: Frame, polygon: Plane[], s0: number, s1: number, meta: Meta): Recorded
  tube (points: Point3[], radii: number[], meta: Meta): Recorded
  moved (shape: Recorded, offset: Point3): Recorded
  overlapsOf (items: Entry[], P: Projection, options: { states: number[], skip: unknown }): unknown
  sameRun: unknown
  audit (R: Recorder, P: Projection, options: Meta): Result
  report (result: Result): string
  failures (result: Result): number
}

type Pose = ReturnType<typeof poseOf>

function offsetOf (slot: Slot, pose: Pose): Point3 {
  if (slot.move === 'sheet') return [pose.x, 0, 0]
  if (slot.move === 'press') return [0, 0, pose.lift[slot.index]]
  return [0, 0, 0]
}

function markSvg (mark: Mark) {
  if (mark.kind === 'solid') return solidSvg(mark.paths, { tone: mark.tone, crease: mark.crease, lit: mark.lit, inner: (mark.inner ?? []).map(seam => lineSvg(seam.d, { tone: seam.tone })).join('') })
  if (mark.kind === 'line') return lineSvg(mark.d, { tone: mark.tone, free: mark.free })
  if (mark.kind === 'stamp') return lineSvg(mark.d, { tone: 'hi' })
  if (mark.kind === 'dots') return dotsSvg(mark.points, { size: mark.size, tone: mark.tone })
  if (mark.kind === 'halo') return ''
  return `<g class="tb"><path class="tb-body" d="${mark.body}"/><path class="iso-line tb-edge" d="${mark.edges}"/></g>`
}

function shapeOf (shape: Shape & { meta?: Record<string, unknown> }, name: string) {
  const meta = { name, ...(shape.meta ?? {}) }
  if (shape.kind === 'slab') return A.slab(shape.plan, shape.z, shape.h, meta, shape.steps)
  if (shape.kind === 'cylinder') return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta)
  if (shape.kind === 'turned') return A.solid(shape.F, shape.profile, meta)
  if (shape.kind === 'prism') return A.prism(shape.F, shape.polygon, shape.s0, shape.s1, meta)
  return A.tube(shape.points, shape.radii, meta)
}

// The items a slot draws in this pose: a flap slot's one flap at its swing, any other slot as built.
function itemsOf (slot: Slot, pose: Pose): Item[] {
  if (slot.move !== 'flap') return slot.items
  const open = pose.gates[slot.index]
  return [{ name: `gate.${slot.index}.flap`, marks: [{ kind: 'solid', paths: flapPaths(slot.index, open), tone: 'mid', crease: 'faint' }], shapes: [flapShape(slot.index, open)] }]
}

function auditPose (pose: Pose) {
  const R = A.recorder(P)
  let key = 0
  for (const slot of PARTS) {
    const offset = offsetOf(slot, pose)
    const shift = translateAlong(P, offset)
    for (const part of itemsOf(slot, pose)) {
      if (!part.shapes.length) continue
      const name = R.nameFor(part.name)
      const shapes = part.shapes.map(shape => {
        const recorded = A.moved(shapeOf(shape, name), offset)
        return shape.kind === 'tube' ? recorded : R.solid(recorded)
      })
      const chunked = part.name.includes(':')
      R.put({ name, key: key++, svg: `<g transform="${shift}">${part.marks.map(markSvg).join('')}</g>`, shapes, route: chunked ? part.name.split(':')[0] : undefined, chunk: chunked ? Number(part.name.split(':')[1]) : undefined })
    }
  }
  for (const route of ROUTES) R.route(route.name, route.points, route.r, { gaps: route.gaps, rims: route.rims, limp: true })
  const overlaps = A.overlapsOf(R.items, P, { states: [0], skip: A.sameRun })
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map(entry => entry.key), rules: 0, cycles: [], dropped: [] }, states: [0] }
  const result = A.audit(R, P, {})
  return { result, R }
}

const quick = process.argv.includes('--quick')
const travels = quick ? [0, 0.5, 1] : Array.from({ length: 49 }, (_, index) => index / 48)
const taps = quick ? [0] : [0, 1]
const poses = travels.flatMap(travel => taps.map(tap => ({ travel, tap, pose: poseOf({ ...eofficeModel.init(), travel, tap }) })))

let total = 0
const started = Date.now()
const seen = new Set<string>()
for (const { travel, tap, pose } of poses) {
  const { result, R } = auditPose(pose)
  const count = A.failures(result)
  total += count
  const label = `pose travel ${travel.toFixed(3)} · tap ${tap} · sheet ${pose.x.toFixed(1)} · gates ${pose.gates.map(open => open.toFixed(2)).join('/')}`
  if (count) {
    const lines = A.report(result).split('\n').filter((text: string) => !seen.has(text))
    lines.forEach((text: string) => seen.add(text))
    console.log(`${label}: ${count} problems\n${lines.join('\n')}`)
  } else console.log(`${label}: 0 problems · ${R.solids.length} solids · ${R.tubes.length} tubes · ${R.items.length} items`)
  if (travel === poses[0].travel && tap === poses[0].tap) console.log(A.report(result))
}
console.log(`audit · ${poses.length} poses · ${((Date.now() - started) / 1000).toFixed(1)} s`)
console.log(total ? `audit failed: ${total} problems` : 'audit passed')
if (total) process.exitCode = 1
