import type { StackConfig } from '@/components/iso/stack/types'

// Pure layout of a project card's small diagram: the stack layers as a chain on the left bus, the side modules as
// chips on the right bus. All numbers are SVG user units in a VIEW_W x VIEW_H box.
export const VIEW_W = 400
export const VIEW_H = 250

const TOP = 44
const BOTTOM = 232
const NODE_H = 30
const NODE_X = 24
const NODE_W = 232
const CHIP_X = 296
const CHIP_W = 88
const CHIP_H = 26
export const LEFT_BUS_X = 10
export const RIGHT_BUS_X = 276
const MAX_PITCH = 44
const TECH_MAX = 22

export type DiagramNode = { key: string, index: string, label: string, tech: string, x: number, y: number, w: number, h: number }
export type DiagramChip = { key: string, label: string, x: number, y: number, w: number, h: number }
export type DiagramLayout = {
  nodes: DiagramNode[]
  chips: DiagramChip[]
  leftBus: { x: number, y1: number, y2: number }
  rightBus: { x: number, y1: number, y2: number } | null
  // The packet travels the left bus from the first node to the last one.
  travel: number
  meta: string
}

const spread = (count: number, from: number, to: number, pitchCap: number) => {
  if (count === 1) return [(from + to) / 2]
  const pitch = Math.min(pitchCap, (to - from) / (count - 1))
  const span = pitch * (count - 1)
  const start = (from + to) / 2 - span / 2
  return Array.from({ length: count }, (_, i) => start + pitch * i)
}

const shortTech = (tech: string[]) => {
  const [first = '', ...rest] = tech
  const head = first.length > TECH_MAX ? `${first.slice(0, TECH_MAX - 1)}…` : first
  return rest.length > 0 ? `${head} +${rest.length}` : head
}

export function diagramLayout (config: StackConfig): DiagramLayout {
  const centers = spread(config.layers.length, TOP + NODE_H / 2, BOTTOM - NODE_H / 2, MAX_PITCH)
  const nodes = config.layers.map((layer, i) => ({
    key: layer.id,
    index: String(i + 1).padStart(2, '0'),
    label: layer.label,
    tech: shortTech(layer.tech),
    x: NODE_X,
    y: centers[i] - NODE_H / 2,
    w: NODE_W,
    h: NODE_H,
  }))
  const chipCenters = spread(config.side.length, TOP + CHIP_H / 2, BOTTOM - CHIP_H / 2, 48)
  const chips = config.side.map((tier, i) => ({
    key: tier.id,
    label: tier.label,
    x: CHIP_X,
    y: chipCenters[i] - CHIP_H / 2,
    w: CHIP_W,
    h: CHIP_H,
  }))
  const first = centers[0]
  const last = centers[centers.length - 1]
  return {
    nodes,
    chips,
    leftBus: { x: LEFT_BUS_X, y1: first, y2: last },
    rightBus: chipCenters.length > 0 ? { x: RIGHT_BUS_X, y1: chipCenters[0], y2: chipCenters[chipCenters.length - 1] } : null,
    travel: last - first,
    meta: `${config.layers.length} layers${config.side.length > 0 ? ` · ${config.side.length} modules` : ''}`,
  }
}
