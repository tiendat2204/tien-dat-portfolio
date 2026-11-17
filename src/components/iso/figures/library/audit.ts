/*
  Geometry audit for the card catalog (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/figures/library/audit.ts

  It records every drawn item's true shapes into the kit's audit recorder in the exact painter's order the page uses
  (keys are draw positions, never re-settled), then runs every check of kit/audit.mjs at a grid of poses along the
  whole loan: the drawer opening, the card lifting, crossing, setting down and sliding (recorded as a prism in its
  true tilt, in whichever of its two slots it is drawn), the stamp pressing and lifting, and the neighbouring drawer
  pushed in and pulled out, and the hoist's hook (clip and cable, in its slot) with the trolley over it. It ends
  `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, lineSvg, solidSvg, translateAlong, type Plan, type Plane, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { CARD_POLYGON, CARD_T, PARTS, PROJECTION as P, ROUTES, cardFrame, cardOf, hookOf, hookShapes, type Frame, type Mark, type Move, type Shape, type Slot } from '@/components/iso/figures/library/geometry'
import { cardAt, CARD_REST, drawerOpen, hookAt, OPEN, PEEK, PRESS_AT, STAMP_TRAVEL, stampPress } from '@/components/iso/figures/library/model'

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
  prism (F: Frame, polygon: Plane[], s0: number, s1: number, meta: Meta): Recorded
  tube (points: Point3[], radii: number[], meta: Meta): Recorded
  moved (shape: Recorded, offset: Point3): Recorded
  overlapsOf (items: Item[], P: Projection, options: { states: number[], skip: unknown }): unknown
  sameRun: unknown
  audit (R: Recorder, P: Projection, options: Meta): Result
  report (result: Result): string
  failures (result: Result): number
}

type Pose = { flow: number, peek: number }

function offsetOf (move: Move, pose: Pose): Point3 {
  if (move === 'drawer') return [0, drawerOpen(pose.flow) * OPEN, 0]
  if (move === 'peek') return [0, pose.peek * PEEK, 0]
  if (move === 'stamp') return [0, 0, -stampPress(pose.flow) * STAMP_TRAVEL]
  if (move === 'trolley') return [hookAt(pose.flow).at[0] - CARD_REST[0], 0, 0]
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
  if (shape.kind === 'cylinder') return A.cylinder(shape.cx, shape.cy, shape.r, shape.z, shape.h, meta)
  if (shape.kind === 'turned') return A.solid(shape.F, shape.profile, meta)
  if (shape.kind === 'prism') return A.prism(shape.F, shape.polygon, shape.s0, shape.s1, meta)
  return A.tube(shape.points, shape.radii, meta)
}

function auditPose (pose: Pose) {
  const R = A.recorder(P)
  const card = cardAt(pose.flow)
  const hook = hookAt(pose.flow)
  let key = 0
  for (const slot of PARTS) {
    if (slot.move === 'hook') {
      // Like the card, the clip is drawn in one of the hook's two slots; each slot also draws its length of the cable.
      const high = slot.key === 'hook.high'
      const draw = hookOf(hook.at, hook.clear)
      const shapes = hookShapes(hook.at, hook.clear)
      if (high === hook.clear) {
        const name = R.nameFor('hook.clip')
        const { plan, z, h } = shapes.clip
        R.put({ name, key: key++, svg: solidSvg(draw.clip, { tone: 'mid' }) + lineSvg(draw.pin), shapes: [R.solid(A.slab(plan, z, h, { name }, 2))] })
      }
      const cable = high ? shapes.high : shapes.low
      const paths = high ? draw.high : draw.low
      if (cable && paths) {
        const name = R.nameFor('hook.cable')
        R.put({ name, key: key++, svg: solidSvg(paths, { tone: 'mid', crease: 'none' }), shapes: [R.solid(A.cylinder(cable.cx, cable.cy, cable.r, cable.z, cable.h, { name }))] })
      }
      continue
    }
    if (slot.move === 'card') {
      // The card is drawn in one of its two slots: low while it is among the drawer's cards, high once clear.
      if ((slot.key === 'card.high') !== card.clear) continue
      const draw = cardOf(card, pose.flow >= PRESS_AT)
      const name = R.nameFor('card')
      const svg = solidSvg(draw.paths, { tone: 'hi', crease: 'lo', lit: true }) + [draw.rules, draw.date].map(d => lineSvg(d, { free: true })).join('') + [draw.hole, draw.mark].map(d => lineSvg(d)).join('')
      R.put({ name, key: key++, svg, shapes: [R.solid(A.prism(cardFrame(card), CARD_POLYGON, 0, CARD_T, { name }))] })
      continue
    }
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
  for (const route of ROUTES) R.route(route.name, route.points, route.r, { gaps: route.gaps, rims: route.rims, limp: true })
  const overlaps = A.overlapsOf(R.items, P, { states: [0], skip: A.sameRun })
  R.settled = { items: R.items, overlaps, solved: { keys: R.items.map(entry => entry.key), rules: 0, cycles: [], dropped: [] }, states: [0] }
  const result = A.audit(R, P, {})
  return { result, R }
}

const quick = process.argv.includes('--quick')
const flows = quick
  ? [0, 1]
  : [0, 0.12, 0.24, 0.27, 0.29, 0.31, 0.33, 0.35, 0.37, 0.39, 0.41, 0.43, 0.46, 0.49, 0.52, 0.55, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7, 0.74, 0.77, 0.8, 0.85, 0.88, 0.9, 0.92, 0.95, 1]
const poses: Pose[] = [...flows.map(flow => ({ flow, peek: 0 })), ...(quick ? [] : [0, 0.35, 1].map(flow => ({ flow, peek: 1 })))]

let total = 0
const started = Date.now()
const seen = new Set<string>()
for (const pose of poses) {
  const { result, R } = auditPose(pose)
  const count = A.failures(result)
  total += count
  const label = `pose flow ${pose.flow.toFixed(2)} · peek ${pose.peek}`
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
