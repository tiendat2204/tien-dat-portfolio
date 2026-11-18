import { axisVector, fitProjection, iso, planOutline, slabOf, type Flat, type Plan, type Point3, type Projection, type SolidPaths } from '@/components/iso/kit/iso-kit'
import { betatruyenConfig } from '@/components/iso/figures/betatruyen/config'

// Geometry of the BetaTruyen anatomy stack (pure, computed once at module load): the frontend's real layers from the
// figure config as boards on one axis, assembled at rest and exploded along z by `--p`. Board 0 is the bottom board
// (the external API); config layer k is board n - 1 - k, so the UI is the top board and balloon 1.

export type Board = {
  i: number
  n: number
  label: string
  // The layer's tech, packed into lines that fit beside the board.
  tech: string[]
  external: boolean
  paths: SolidPaths
  inset: string
  // Screen offset of the board's top when fully open (the board moves by this much with the explode).
  open: Flat
  // Leader root on the board's left corner and the balloon beside it; label anchor past the right corner.
  root: Flat
  balloon: Flat
  tag: Flat
}

const PLAN: Plan = { x: -40, y: -30, w: 80, d: 60, r: 3 }
const THICK = 5
const REST = 3
const OPEN = 20
const PITCH_OPEN = THICK + REST + OPEN

// Where the stack sits on the sheet: boards 346..500 wide, the open stack from y 66 down, labels to its right.
const STACK_LEFT = 346
const STACK_WIDTH = 154
const STACK_TOP = 66
const BALLOON_RUN = 26
const BALLOON_RISE = 9
const LABEL_CHARS = 23

const LAYERS = betatruyenConfig.layers
const COUNT = LAYERS.length
const Z_TOP = (COUNT - 1) * PITCH_OPEN + THICK

// Packs the tech names into lines of at most `width` characters, joined with a middle dot.
function pack (tech: string[], width: number): string[] {
  const lines: string[] = []
  for (const name of tech) {
    const last = lines[lines.length - 1]
    if (last !== undefined && `${last} · ${name}`.length <= width) lines[lines.length - 1] = `${last} · ${name}`
    else lines.push(name)
  }
  return lines
}

function projection (): Projection {
  const points: Point3[] = []
  for (const x of [PLAN.x, PLAN.x + PLAN.w]) for (const y of [PLAN.y, PLAN.y + PLAN.d]) for (const z of [0, Z_TOP]) points.push([x, y, z])
  const fit = fitProjection(points, STACK_WIDTH, 1000, { pad: 0 })
  const top = Math.min(...points.map(point => iso(point, fit)[1]))
  return { ...fit, origin: [STACK_LEFT + STACK_WIDTH / 2, fit.origin[1] + STACK_TOP - top] }
}

export const P = projection()

// Screen vector of one world unit up the axis (y is negative: up the sheet).
export const UP = axisVector(P, [0, 0, 1])

export const BOARDS: Board[] = LAYERS.map((layer, k) => {
  const i = COUNT - 1 - k
  const z = i * (THICK + REST)
  const lift = i * OPEN
  const root = iso([PLAN.x, PLAN.y + PLAN.d, z + THICK / 2], P)
  const tag = iso([PLAN.x + PLAN.w, PLAN.y, z + THICK / 2], P)
  return {
    i,
    n: k + 1,
    label: layer.label,
    tech: pack(layer.tech, LABEL_CHARS),
    external: layer.id === 'api',
    paths: slabOf(PLAN, z, THICK, P, 4, 0.8),
    inset: planOutline({ x: PLAN.x + 4, y: PLAN.y + 4, w: PLAN.w - 8, d: PLAN.d - 8, r: 1 }, z + THICK, P, 4),
    open: [UP[0] * lift, UP[1] * lift],
    root,
    balloon: [root[0] - BALLOON_RUN, root[1] - BALLOON_RISE],
    tag: [tag[0] + 8, tag[1]],
  }
})

// The centerline, from under the base to past the open top board, and the packet's run between the open top and
// bottom board centres (world z to screen y through UP).
export const AXIS = { from: iso([0, 0, -8], P), to: iso([0, 0, Z_TOP + 10], P) }
export const PACKET = {
  at: iso([0, 0, (COUNT - 1) * PITCH_OPEN + THICK / 2], P),
  drop: -(COUNT - 1) * PITCH_OPEN * UP[1],
}

// The side modules (ci, forms, state) as three small flat chips on the same projection, laid along x under the stack.
export type Chip = { label: string, tech: string, paths: SolidPaths, at: Flat }

const CHIP_PLAN: Plan = { x: -9, y: -7, w: 18, d: 14, r: 1.2 }
const CHIP_P: Projection = { ...P, origin: [0, 0] }

export const CHIPS: Chip[] = betatruyenConfig.side.map((module, k) => ({
  label: module.label,
  tech: module.tech[0],
  paths: slabOf(CHIP_PLAN, 0, 2.2, CHIP_P, 3, 0.4),
  at: [386 + k * 94, 380],
}))

// The last line of the sheet: a mono text of `n` characters is this wide (IBM Plex Mono advance 0.6em).
export const charWidth = (fontSize: number) => fontSize * 0.6
