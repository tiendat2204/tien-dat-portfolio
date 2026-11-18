import type { CSSProperties } from 'react'

import { axisVector, extrude, fitProjection, iso, ringOf, slabOf, topTicks, type Plan, type Point3, type Projection, type SolidPaths } from '@/components/iso/kit/iso-kit'
import { seg } from '@/components/projects/diagram/anim'

// Geometry of the library figure (library.tsx): the bookcase and the exploded app stack, both drawn with the
// anatomy kit, plus the CSS helpers its scroll story needs on top of anim.ts.

// --- extra scroll helpers ---------------------------------------------------------------------------------------------

// Slides from (dx, dy) to its place without fading (the plates of the stack opening).
export const settle = (a: number, b: number, dx: number, dy: number): CSSProperties => ({
  transform: `translate(calc((1 - ${seg(a, b)}) * ${dx}px), calc((1 - ${seg(a, b)}) * ${dy}px))`,
})

// Grows a vertical line upward from its foot (x, y): a dashed centerline cannot be drawn in with a dash offset.
export const grow = (a: number, b: number, x: number, y: number): CSSProperties => ({
  transform: `translate(${x}px, ${y}px) scale(1, ${seg(a, b)}) translate(${-x}px, ${-y}px)`,
})

// The typed width of a mono line: `n` characters of `ch` px each.
export const typed = (a: number, b: number, n: number, ch: number): CSSProperties => ({ width: `calc(${seg(a, b)} * ${n * ch}px)` })

// --- the bookcase -----------------------------------------------------------------------------------------------------

// World units: x along the shelf, y its depth (toward the viewer), z up. Two bays between three boards.
const SHELF_W = 120
const SHELF_D = 26
const BOARD_T = 2
const BAY_H = 24
const POST_T = 2.4
const BAY_Z = [0, BOARD_T + BAY_H]

export type Book = { plan: Plan, z: number, h: number }

// Spines in reading order per bay: [thickness, height]. The top bay keeps a gap at its end for the new copy.
const SPINES: [number, number][][] = [
  [[5, 18], [4, 16], [6, 20], [4, 15], [5, 19], [4, 17], [6, 18], [5, 16], [4, 20], [5, 17], [6, 19], [4, 16], [5, 18], [6, 17], [4, 19], [5, 16], [6, 20], [4, 18]],
  [[6, 19], [4, 17], [5, 20], [5, 16], [4, 18], [6, 17], [5, 19], [4, 16], [6, 18], [5, 20], [4, 17], [5, 18], [6, 16], [4, 19], [5, 17]],
]
const BOOK_Y = 4
const BOOK_D = 18

function booksOf (bay: number): Book[] {
  let x = 4
  return SPINES[bay].map(([w, h]) => {
    const book = { plan: { x, y: BOOK_Y, w, d: BOOK_D, r: 0 }, z: BAY_Z[bay] + BOARD_T, h }
    x += w + 1.2
    return book
  })
}

// The copy that the scan files: the last place of the top bay.
export const NEW_COPY: Book = { plan: { x: 100, y: BOOK_Y, w: 6, d: BOOK_D, r: 0 }, z: BAY_Z[1] + BOARD_T, h: 19 }

const CASE_TOP = BAY_Z[1] + BOARD_T + BAY_H + BOARD_T

function caseExtremes (): Point3[] {
  const out: Point3[] = []
  for (const x of [-POST_T, SHELF_W + POST_T]) for (const y of [0, SHELF_D]) for (const z of [0, CASE_TOP]) out.push([x, y, z])
  return out
}

export type Bookcase = {
  P: Projection
  // Painter's order: the back post, then per bay its board and spines, the top board, the near post.
  posts: [SolidPaths, SolidPaths]
  boards: SolidPaths[]
  // Spines of each bay in groups of a few (back to front), so they can rise in waves; `bay` says which.
  waves: { bay: number, books: SolidPaths[] }[]
  newCopy: SolidPaths
  // Where the new copy's leader lands (its top front corner) on screen.
  copyAt: [number, number]
  ticks: { minor: string, major: string }
  labels: { bay: string, at: [number, number] }[]
  width: number
  height: number
}

export function bookcase (width: number, height: number): Bookcase {
  const P = fitProjection(caseExtremes(), width, height, { pad: 4 })
  const box = (plan: Plan, z: number, h: number) => extrude(ringOf(plan, 0), z, h, P, { convex: true })
  const posts: [SolidPaths, SolidPaths] = [
    box({ x: -POST_T, y: 0, w: POST_T, d: SHELF_D, r: 0 }, 0, CASE_TOP),
    box({ x: SHELF_W, y: 0, w: POST_T, d: SHELF_D, r: 0 }, 0, CASE_TOP),
  ]
  const boards = [0, 1, 2].map(i => box({ x: 0, y: 0, w: SHELF_W, d: SHELF_D, r: 0 }, i * (BOARD_T + BAY_H), BOARD_T))
  const waves: Bookcase['waves'] = []
  for (const bay of [0, 1]) {
    const books = booksOf(bay)
    for (let i = 0; i < books.length; i += 5) waves.push({ bay, books: books.slice(i, i + 5).map(b => box(b.plan, b.z, b.h)) })
  }
  const newCopy = box(NEW_COPY.plan, NEW_COPY.z, NEW_COPY.h)
  const copyAt = iso([NEW_COPY.plan.x + NEW_COPY.plan.w, NEW_COPY.plan.y, NEW_COPY.z + NEW_COPY.h], P)
  const ticks = topTicks(0, SHELF_W, 5, 4, SHELF_D - 5, CASE_TOP, [2.4, 4.6], P, 'x')
  // Shelf B's label sits above the case at its front-left corner, shelf A's below its front-right corner.
  const labels = [
    { bay: 'floor 2 · shelf B', at: iso([0, SHELF_D, CASE_TOP], P) },
    { bay: 'floor 2 · shelf A', at: iso([SHELF_W, SHELF_D, 0], P) },
  ]
  return { P, posts, boards, waves, newCopy, copyAt, ticks, labels, width, height }
}

// --- the exploded stack ----------------------------------------------------------------------------------------------

const PLATE: Plan = { x: -55, y: -35, w: 110, d: 70, r: 3 }
const PLATE_T = 4
const REST_PITCH = 7
const OPEN_GAP = 17
const PITCH = REST_PITCH + OPEN_GAP

export type Plate = {
  paths: SolidPaths
  // Screen offset the plate rests at before the stack opens (it moves down from its open place by this much).
  rest: number
  // The leader's root on the plate's front-left corner and the balloon it reaches.
  root: [number, number]
  balloon: [number, number]
}

export type Stack = {
  P: Projection
  plates: Plate[]
  axis: { x: number, y1: number, y2: number }
  // The lowest screen point of the bottom plate's front corner, where the loan card's leader lands.
  foot: [number, number]
  width: number
  height: number
}

export function stack (count: number, width: number, height: number): Stack {
  const top = (count - 1) * PITCH + PLATE_T
  const points: Point3[] = []
  for (const x of [PLATE.x, PLATE.x + PLATE.w]) for (const y of [PLATE.y, PLATE.y + PLATE.d]) for (const z of [-6, top + 10]) points.push([x, y, z])
  const P = fitProjection(points, width, height, { pad: 4 })
  const [, up] = axisVector(P, [0, 0, 1])
  const plates = Array.from({ length: count }, (_, i): Plate => {
    const z = i * PITCH
    const root = iso([PLATE.x, PLATE.y + PLATE.d - PLATE.r, z + PLATE_T / 2], P)
    return {
      paths: slabOf(PLATE, z, PLATE_T, P, 4, 0.8),
      rest: -i * OPEN_GAP * up,
      root,
      balloon: [root[0] - 24, root[1] - 7],
    }
  })
  const [x, y1] = iso([0, 0, -6], P)
  const [, y2] = iso([0, 0, top + 10], P)
  const foot = iso([PLATE.x + PLATE.w, PLATE.y + PLATE.d, 0], P)
  return { P, plates, axis: { x, y1, y2 }, foot, width, height }
}
