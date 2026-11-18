import type { CSSProperties } from 'react'

import { insetPlan, iso, planOutline, slabOf, topMatrix, type Plan, type Projection, type SolidPaths } from '@/components/iso/kit/iso-kit'
import { seg } from '@/components/projects/diagram/anim'

// Geometry of the AgriTA Mobile sheet: the exploded stack of the app's six layers (the config's order, ui on top)
// drawn with the anatomy kit, and the small calc() helpers the scene needs beyond anim.ts.

export const LAYERS = [
  { id: 'ui', tech: 'Flutter · shadcn_ui' },
  { id: 'routes', tech: 'go_router' },
  { id: 'state', tech: 'Riverpod' },
  { id: 'forms', tech: 'reactive_forms' },
  { id: 'client', tech: 'dio · auth' },
  { id: 'sync', tech: 'workmanager' },
] as const

// One plate, built at the bottom (sync) place; the others are the same paths moved up by CSS.
export const P: Projection = { origin: [430, 350], scale: 1.5 }
export const PLATE: Plan = { x: -48, y: -32, w: 96, d: 64, r: 3 }
const THICK = 4
// Screen pitch of the assembled stack and the extra gap each open plate adds (px).
export const PITCH = 10
export const GAP = 38
export const STEP = PITCH + GAP

export const SLAB: SolidPaths = slabOf(PLATE, 0, THICK, P, 4, 0.8)
export const SLAB_INSET = planOutline(insetPlan(PLATE, 4), THICK, P, 4)
export const FACE_TEXT = topMatrix([-42, 22], THICK, P)

const at = (x: number, y: number, z: number) => iso([x, y, z], P)
// Where leaders meet a plate (its left and right corners at mid thickness) and where the top face's centre is.
export const LEFT = at(PLATE.x, PLATE.y + PLATE.d, THICK / 2)
export const RIGHT = at(PLATE.x + PLATE.w, PLATE.y, THICK / 2)
export const TOP = at(0, 0, THICK)
export const FRONT = at(PLATE.x + PLATE.w, PLATE.y + PLATE.d, 0)

// Plate k (0 = ui, top) sits (5 - k) steps above the sync plate once the stack is open.
export const lift = (k: number) => (LAYERS.length - 1 - k) * STEP

// The CSS move of plate k: the assembled pitch always, the gap as the stack opens between a and b.
export const explode = (k: number, a: number, b: number): CSSProperties => {
  const n = LAYERS.length - 1 - k
  return { transform: `translate(0, calc(${-n * PITCH}px - ${seg(a, b)} * ${n * GAP}px))` }
}

// Opacity 1, dimmed to `to` between a and b (an offline signal, a paused queue).
export const dimDuring = (a: number, b: number, to = 0.3, edge = 0.03): CSSProperties => ({
  opacity: `calc(1 - ${1 - to} * min(${seg(a, a + edge)}, 1 - ${seg(b - edge, b)}))`,
})

// Visible from a on, gone again from b (a state that is later replaced).
export const between = (a: number, b: number, edge = 0.03): CSSProperties => ({
  opacity: `calc(min(${seg(a, a + edge)}, 1 - ${seg(b, b + edge)}))`,
})

// A vertical line that grows up from `foot` (its y) between a and b, keeping its dashes (draw() would replace them).
export const grow = (a: number, b: number, foot: number): CSSProperties => ({
  transform: `translate(0, ${foot}px) scale(1, ${seg(a, b)}) translate(0, ${-foot}px)`,
})

// The `+` crosshair corners of a sub-panel, as one path.
export function crosshairs (x: number, y: number, w: number, h: number, arm = 3): string {
  return [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]
    .map(([cx, cy]) => `M${cx - arm} ${cy}H${cx + arm}M${cx} ${cy - arm}V${cy + arm}`)
    .join('')
}

export const round = (v: number) => Math.round(v * 10) / 10
