/*
  Geometry audit for the stack anatomy (not imported by the app). Run from the repo root:

    node --import tsx src/components/iso/stack/audit.ts

  For 1, 4, 6 and 8 layers (with all three satellite boards, then 0 to 2 for 1, 5 and 8 layers) it records every drawn item's true shapes into the kit's
  audit recorder in the exact painter's order the page uses (keys are draw positions, never re-settled), with each
  board at its offset for the explode amount and the packet at the top, middle and bottom of its travel, then runs
  every check of kit/audit.mjs. Explode 0, 0.5 and 1.

  Then the sheet's drawing language over the stack (sheet-parts.ts), for 1 to 8 layers with every side-module count,
  with the stack open far enough for the balloons to show (explode 0.6 and 1) and the packet at the top, middle and
  bottom: each leader starts on its own board (on its fill, not under a part painted after it) and crosses no other
  part on its way to the balloon but the base plate; each balloon (at the largest size it reaches on screen) clears
  every part, every other balloon and the viewBox edge; the centerline starts on the base and runs past the top
  board's centre, inside the viewBox (both its ends fade out).
  It ends `audit passed` or exits 1.
*/
import * as auditModule from '@/components/iso/kit/audit.mjs'
import { dotsSvg, iso, lineSvg, solidSvg, translateAlong, type Flat, type Plan, type Point3, type Projection } from '@/components/iso/kit/iso-kit'
import { plateOffset, stackArt, type Item as ArtItem, type Mark, type Shape, type StackArt } from '@/components/iso/stack/geometry'
import { balloonAnchors, centerlines } from '@/components/iso/stack/sheet-parts'

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

// --- The sheet's drawing language --------------------------------------------------------------------------------

// A balloon is 6.5px on screen (stack.css), so its radius in viewBox units is 6.5 / k for a drawing scale of k px per
// unit. The open stack is checked at the smallest scale the sheet reaches (0.55: eight layers on a 400px card); while
// the last balloons fade in (explode 0.6) only at a desktop card's scale. A hairline of air is added.
const radiusAt = (explode: number) => 6.5 / (explode >= 1 ? 0.55 : 0.9) + 0.75

type Fill = { owner: string, points: Flat[] }

// The polygon of a solid's fill path (kit paths are `M x y L x y ... Z` runs).
function polygonsOf (d: string): Flat[][] {
  return d.split('M').filter(Boolean).map(run => {
    const numbers = (run.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? []).map(Number)
    const points: Flat[] = []
    for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]])
    return points
  })
}

function inside ([x, y]: Flat, points: Flat[]): boolean {
  let hit = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

function toSegment ([px, py]: Flat, [ax, ay]: Flat, [bx, by]: Flat): number {
  const dx = bx - ax
  const dy = by - ay
  const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0
  return Math.hypot(px - ax - t * dx, py - ay - t * dy)
}

function toEdges (point: Flat, points: Flat[]): number {
  let best = Infinity
  for (let i = 0; i < points.length; i++) best = Math.min(best, toSegment(point, points[i], points[(i + 1) % points.length]))
  return best
}

function crosses (a: Flat, b: Flat, points: Flat[]): boolean {
  if (inside(a, points) || inside(b, points)) return true
  const side = (p: Flat, q: Flat, r: Flat) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]))
  for (let i = 0; i < points.length; i++) {
    const c = points[i]
    const d = points[(i + 1) % points.length]
    if (side(a, b, c) !== side(a, b, d) && side(c, d, a) !== side(c, d, b)) return true
  }
  return false
}

const offsetOf = (P: Projection, z: number): Flat => {
  const match = /translate\(([-\d.e]+) ([-\d.e]+)\)/.exec(translateAlong(P, [0, 0, z]))
  return match ? [Number(match[1]), Number(match[2])] : [0, 0]
}

// Every solid's fill in painter's order at a pose, tagged with the group it belongs to.
function fillsOf (art: StackArt, explode: number, packetY: number): Fill[] {
  const fills: Fill[] = []
  const add = (owner: string, items: ArtItem[], [dx, dy]: Flat) => {
    for (const part of items) {
      for (const mark of part.marks) {
        if (mark.kind !== 'solid') continue
        for (const points of polygonsOf(mark.paths.fill)) fills.push({ owner, points: points.map(([x, y]): Flat => [x + dx, y + dy]) })
      }
    }
  }
  for (const group of art.groups) {
    if (group.move === 'still') add(group.key, group.items, [0, 0])
    else if (group.move === 'packet') add('packet', group.items, offsetOf(art.P, art.packetOffset(packetY, explode)[2]))
    else {
      const offset = offsetOf(art.P, plateOffset(art.stack, group.plate, explode).z)
      add(group.key, [...group.items, ...group.top], offset)
    }
  }
  return fills
}

function sheetProblems (layers: number, sides: number, explode: number, packetY: number): string[] {
  const art = stackArt(layers, sides)
  const fills = fillsOf(art, explode, packetY)
  const boards = fills.map((fill, index) => ({ ...fill, index }))
  const [, , width, height] = art.stack.viewBox
  const problems: string[] = []
  const balloons = balloonAnchors(art.stack, explode)
  const BALLOON_R = radiusAt(explode)
  balloons.forEach((balloon, k) => {
    const owner = `board${art.count - 1 - k}`
    const own = boards.filter(fill => fill.owner === owner)
    const last = Math.max(...own.map(fill => fill.index))
    if (!own.some(fill => inside(balloon.from, fill.points) || toEdges(balloon.from, fill.points) <= 0.5)) problems.push(`balloon ${balloon.n}: leader does not start on ${owner}`)
    const over = boards.find(fill => fill.index > last && fill.owner !== 'packet' && inside(balloon.from, fill.points))
    if (over) problems.push(`balloon ${balloon.n}: leader root hidden under ${over.owner}`)
    // The leader runs from its root to the balloon's edge.
    const length = Math.hypot(balloon.x - balloon.from[0], balloon.y - balloon.from[1])
    const share = Math.max(0, (length - BALLOON_R) / length)
    const edge: Flat = [balloon.from[0] + (balloon.x - balloon.from[0]) * share, balloon.from[1] + (balloon.y - balloon.from[1]) * share]
    const nudge: Flat = [balloon.from[0] + (edge[0] - balloon.from[0]) * 0.08, balloon.from[1] + (edge[1] - balloon.from[1]) * 0.08]
    // A leader may run over the base plate its board stands on (the bottom board's root is above it), over nothing else.
    const crossed = boards.find(fill => fill.owner !== owner && fill.owner !== 'packet' && fill.owner !== 'base' && crosses(nudge, edge, fill.points))
    if (crossed) problems.push(`balloon ${balloon.n}: leader crosses ${crossed.owner}`)
    const centre: Flat = [balloon.x, balloon.y]
    const hit = boards.find(fill => inside(centre, fill.points) || toEdges(centre, fill.points) < BALLOON_R)
    if (hit) problems.push(`balloon ${balloon.n}: overlaps ${hit.owner}`)
    if (balloon.x + BALLOON_R > width || balloon.y - BALLOON_R < 0 || balloon.y + BALLOON_R > height) problems.push(`balloon ${balloon.n}: leaves the viewBox`)
    const next = balloons[k + 1]
    if (next && Math.hypot(next.x - balloon.x, next.y - balloon.y) < 2 * BALLOON_R) problems.push(`balloons ${balloon.n} and ${next.n} overlap`)
  })
  const [axis] = centerlines(art.stack, 1)
  const base = fills.filter(fill => fill.owner === 'base')
  if (!base.some(fill => inside([axis.x1, axis.y1], fill.points))) problems.push('centerline does not start on the base')
  // Its top end fades out (fadeLineSvg) past the top board's centre, over that board's face or in the open above it.
  const top = iso([0, 0, plateOffset(art.stack, art.count - 1, 1).z], art.P)
  if (!(axis.y2 < top[1])) problems.push('centerline stops below the top board')
  if (axis.y2 < 0) problems.push('centerline leaves the viewBox')
  return problems
}

const sheetPoses = [1, 2, 3, 4, 5, 6, 7, 8].flatMap(layers => [0, 1, 2, 3].flatMap(sides => [0.6, 1].flatMap(explode => [0, 0.5, 1].map(packetY => ({ layers, sides, explode, packetY })))))

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
let sheetTotal = 0
for (const pose of sheetPoses) {
  const problems = sheetProblems(pose.layers, pose.sides, pose.explode, pose.packetY)
  sheetTotal += problems.length
  if (problems.length) console.log(`sheet · layers ${pose.layers} · sides ${pose.sides} · explode ${pose.explode} · packet ${pose.packetY}: ${problems.join('; ')}`)
}
console.log(`sheet · ${sheetPoses.length} poses · ${sheetTotal} problems`)
total += sheetTotal
console.log(total ? `audit failed: ${total} problems` : 'audit passed')
if (total) process.exitCode = 1
