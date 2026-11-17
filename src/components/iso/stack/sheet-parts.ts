/*
  The spec sheet's pure parts: where the balloons and the centerline sit on the drawing, the BOM rows, the title block
  and the scan's clip. No DOM, no React; the renderer (sheet-view.tsx) and the audit read them.

  Sheet units are the stack drawing's viewBox units (geometry.ts). Config layer k is board n - 1 - k, so balloon 1
  is the top board (the UI) and the numbers run down the stack.
*/
import { iso, type Flat } from '@/components/iso/kit/iso-kit'
import { BOARD, plateOffset, projectionOf, type StackLayout } from '@/components/iso/stack/geometry'
import type { StackConfig } from '@/components/iso/stack/types'

// The projects page has eight sections, one sheet each.
const SHEETS = 8

// A leader starts on the board's +x face just past the rounded corner (right of the bus riser on screen) and rises
// to its balloon, so it never crosses the bus, the packet or the board above.
const LEADER_ROOT_Y = BOARD.plan.y + BOARD.plan.r
const LEADER_RUN = 46
const LEADER_RISE = 13
// How far the centerline runs on past the top board, in world units.
const AXIS_OVERRUN = 10

export type Balloon = { n: number, x: number, y: number, from: Flat }
export type Segment = { x1: number, y1: number, x2: number, y2: number }
export type BomRow = { n: number, label: string, tech: string }
export type TitleBlock = { title: string, sheet: string, view: 'Skin' | 'Assembly', drawn: string }

const clamp01 = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0)
const countOf = (stack: StackLayout) => Math.max(1, stack.plateOffsets.length)

// One balloon per layer: its centre (x, y) and the point on the board where its leader starts (`from`), with the
// boards at `explode`. n is 1-based in layer order, so y grows with n.
export function balloonAnchors (stack: StackLayout, explode: number): Balloon[] {
  const count = countOf(stack)
  const { P } = projectionOf(count)
  return Array.from({ length: count }, (_, k) => {
    const plate = count - 1 - k
    const z = plateOffset(stack, plate, explode).z + BOARD.standoff + BOARD.thickness / 2
    const from = iso([BOARD.plan.x + BOARD.plan.w, LEADER_ROOT_Y, z], P)
    return { n: k + 1, x: from[0] + LEADER_RUN, y: from[1] - LEADER_RISE, from }
  })
}

// The stack's axis as a centerline: from the base's top at the centre up past the top board, drawn in with the
// explode (zero length assembled, the full axis of the open stack at 1).
export function centerlines (stack: StackLayout, explode: number): Segment[] {
  const count = countOf(stack)
  const share = clamp01(explode)
  const { P } = projectionOf(count)
  const top = plateOffset(stack, count - 1, 1).z + BOARD.standoff + BOARD.thickness + AXIS_OVERRUN
  const [x1, y1] = iso([0, 0, 0], P)
  const [x2, y2] = iso([0, 0, top], P)
  return [{ x1, y1, x2: x1 + (x2 - x1) * share, y2: y1 + (y2 - y1) * share }]
}

// The bill of materials: one row per layer, numbered like its balloon.
export function bomRows (config: StackConfig): BomRow[] {
  return config.layers.map((layer, k) => ({ n: k + 1, label: layer.label, tech: layer.tech.join(' · ') }))
}

// The title block's four fields, nothing invented: the project, its place among the sheets, the view and who drew it.
export function titleBlockOf (config: StackConfig, name: string, view: 'skin' | 'assembly'): TitleBlock {
  return { title: config.title, sheet: `Fig ${config.fig} / ${SHEETS}`, view: view === 'skin' ? 'Skin' : 'Assembly', drawn: name }
}

// The skeleton layer's clip during the X-ray scan: the part above the scanline shows (0 none, 1 all).
export function scanClip (scan: number): string {
  return `inset(0 0 ${Number((100 - clamp01(scan) * 100).toFixed(2))}% 0)`
}
