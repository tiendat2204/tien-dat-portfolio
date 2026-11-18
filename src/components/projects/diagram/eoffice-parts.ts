import { cameraOf, corners, insetPlan, iso, planOutline, slabOf, type Flat, type Plan, type Projection, type SolidPaths } from '@/components/iso/kit/iso-kit'

// Geometry of the E-Office anatomy: the frontend's five layers (from src/components/iso/figures/eoffice/config.ts)
// as bevelled boards on a base plate, built with the iso kit at their OPEN (exploded) place. Each board carries the
// screen distance it sits lower while the stack is still closed, so the drawing can slide it with one transform.

export const P: Projection = { origin: [436, 308], scale: 1.2 }

const PLATE: Plan = { x: -42, y: -30, w: 84, d: 60, r: 2 }
const CHIP: Plan = { x: -12, y: -9, w: 24, d: 18, r: 1 }
const BASE: Plan = { x: -56, y: -40, w: 112, d: 80, r: 3 }
const BASE_H = 3
const T = 4
const REST_PITCH = 6
const OPEN_PITCH = 30
const LIFT = 2

// Screen pixels per world z unit.
const ZPX = Math.cos((30 * Math.PI) / 180) * cameraOf(P).k

// Bottom to top: the api board is lowest, the ui board on top (the order the config lists them, reversed).
const LAYERS = [
  { id: 'api', label: 'api', tech: ['Axios', 'cookie token'] },
  { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod 4'] },
  { id: 'data', label: 'data', tech: ['TanStack Query', 'Redux Toolkit'] },
  { id: 'routes', label: 'routes', tech: ['React Router 7', 'role guard'] },
  { id: 'ui', label: 'ui', tech: ['React 19', 'shadcn/ui'] },
] as const

export type Board = {
  id: string
  label: string
  tech: readonly string[]
  n: number
  body: SolidPaths
  chip: SolidPaths
  inset: string
  screws: string
  // Open position: centre of the board's top, its left and right corners (screen), and the slide from closed.
  cy: number
  top: number
  left: Flat
  right: Flat
  dy: number
}

const screwsOf = (plan: Plan, z: number) =>
  corners(plan, 7).map(([x, y]) => {
    const [cx, cy] = iso([x, y, z], P)
    return `M${(cx - 1.3).toFixed(1)} ${cy.toFixed(1)}a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0`
  }).join('')

export const BOARDS: Board[] = LAYERS.map((layer, i) => {
  const zOpen = LIFT + i * OPEN_PITCH
  const zRest = LIFT + i * REST_PITCH
  const zTop = zOpen + T
  const [, cy] = iso([0, 0, zOpen + T / 2], P)
  const [, top] = iso([0, 0, zTop], P)
  return {
    id: layer.id,
    label: layer.label,
    tech: layer.tech,
    n: LAYERS.length - i,
    body: slabOf(PLATE, zOpen, T, P, 6, 0.8),
    chip: slabOf(CHIP, zTop, 1.6, P, 2),
    inset: planOutline(insetPlan(PLATE, 5), zTop, P, 6),
    screws: screwsOf(PLATE, zTop),
    cy,
    top,
    left: iso([PLATE.x, PLATE.y + PLATE.d, zTop], P),
    right: iso([PLATE.x + PLATE.w, PLATE.y, zTop], P),
    dy: (zOpen - zRest) * ZPX,
  }
})

export const BASE_PATHS = slabOf(BASE, -BASE_H, BASE_H, P, 8, 0.6)
export const BASE_INSET = planOutline(insetPlan(BASE, 4), 0, P, 8)

// The centreline through every board: from a little above the top board down to the base plate.
export const AXIS_X = P.origin[0]
export const AXIS_TOP = (BOARDS[BOARDS.length - 1]?.top ?? 0) - 22
export const AXIS_BASE = P.origin[1]
