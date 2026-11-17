import type { StackConfig } from '@/components/iso/stack/types'

// Pure stack-anatomy engine: progress (0..1) in, pose / terminal / readout out. No DOM, no React.

type Phase = readonly [start: number, end: number]

// The phase table, the single source of truth: each phase starts where the previous one ends.
export const PHASES = {
  skin: [0, 0.1],
  scan: [0.1, 0.3],
  explode: [0.3, 0.38],
  down: [0.38, 0.8],
  up: [0.8, 0.95],
  rest: [0.95, 1],
} as const satisfies Record<string, Phase>

// Share of a step's slot spent typing; the full snippet then holds until the slot ends and its result prints.
const TYPE_SHARE = 0.85

type SheetPose = {
  skin: number
  scan: number
  explode: number
  active: number
  packetY: number
  direction: 'down' | 'up'
  step: number
  view: 'skin' | 'assembly'
}

type StackPose = Pick<SheetPose, 'active' | 'packetY' | 'direction' | 'explode'>

type TerminalBlock = { prompt: string, typed: string[], result: string | null, done: boolean }

// `line` 0 is the prompt row, `line` k + 1 is `lines[k]`; past the last row once the result prints.
type TerminalState = { blocks: TerminalBlock[], cursor: { block: number, line: number, col: number } }

function clamp01 (value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function layersOf (layerCount: number): number {
  return Number.isFinite(layerCount) ? Math.max(1, Math.floor(layerCount)) : 1
}

// Local 0..1 position of an already clamped progress inside a phase: 0 before it, 1 after it.
function within (p: number, [start, end]: Phase): number {
  return clamp01((p - start) / (end - start))
}

// The one mapping between the packet and the layers: layer k of n owns packetY [k/n, (k+1)/n],
// which is the slice [k/n, (k+1)/n] of the down travel (see layerWindow).
function layerAt (packetY: number, count: number): number {
  return Math.min(count - 1, Math.floor(packetY * count))
}

function layerWindow (layer: number, count: number): [number, number] {
  const [start, end] = PHASES.down
  const span = end - start
  return [start + span * layer / count, start + span * (layer + 1) / count]
}

// Packet height (0 top, 1 bottom) and direction: parked at the top before the down travel and at rest.
function packetAt (p: number): { packetY: number, direction: 'down' | 'up' } {
  if (p <= PHASES.down[1]) return { packetY: within(p, PHASES.down), direction: 'down' }
  if (p < PHASES.rest[0]) return { packetY: 1 - within(p, PHASES.up), direction: 'up' }
  return { packetY: 0, direction: 'up' }
}

// `step` is the 1-based layer the packet is in while the assembly is shown and not at rest, else 0;
// the readout's `STEP k/n`, the BOM row and the balloon all read it.
export function sheetPose (progress: number, layerCount: number): SheetPose {
  const p = clamp01(progress)
  const count = layersOf(layerCount)
  const { packetY, direction } = packetAt(p)
  const active = p < PHASES.rest[0] ? layerAt(packetY, count) : 0
  const view = p < PHASES.explode[0] ? 'skin' : 'assembly'
  const step = view === 'assembly' && p < PHASES.rest[0] ? active + 1 : 0
  return {
    skin: within(p, PHASES.skin),
    scan: within(p, PHASES.scan),
    explode: within(p, PHASES.explode),
    active,
    packetY,
    direction,
    step,
    view,
  }
}

// Old pose shape for the current renderer (Task S3 migrates it to sheetPose); same new timing.
export function stackPose (progress: number, layerCount: number): StackPose {
  const { active, packetY, direction, explode } = sheetPose(progress, layerCount)
  return { active, packetY, direction, explode }
}

function typeBlock (step: StackConfig['steps'][number], local: number): { block: TerminalBlock, line: number, col: number } {
  if (local <= 0) return { block: { prompt: '', typed: [], result: null, done: false }, line: 0, col: 0 }
  const done = local >= 1
  const total = step.prompt.length + step.lines.reduce((sum, line) => sum + line.length, 0)
  let left = Math.floor(Math.min(1, local / TYPE_SHARE) * total)
  const prompt = step.prompt.slice(0, left)
  left -= step.prompt.length
  const typed: string[] = []
  let row = { line: 0, col: prompt.length }
  for (const line of step.lines) {
    if (left < 0) break
    const text = line.slice(0, left)
    typed.push(text)
    row = { line: typed.length, col: text.length }
    left -= line.length
  }
  if (done) row = { line: step.lines.length + 1, col: 0 }
  return { block: { prompt, typed, result: done ? step.result : null, done }, ...row }
}

// Each step types inside its layer's down-travel window (steps sharing a layer split it in order),
// so the terminal always types the snippet for the layer the packet is in. Done by the end of the down travel.
export function terminalAt (config: StackConfig, progress: number): TerminalState {
  const p = clamp01(progress)
  const count = layersOf(config.layers.length)
  const order = config.steps
    .map((step, index) => ({ index, layer: Math.min(count - 1, Math.max(0, Math.floor(Number.isFinite(step.layer) ? step.layer : 0))) }))
    .sort((a, b) => a.layer - b.layer || a.index - b.index)
  const blocks: TerminalBlock[] = config.steps.map(() => ({ prompt: '', typed: [], result: null, done: false }))
  let cursor = { block: 0, line: 0, col: 0 }
  order.forEach(({ index, layer }, rank) => {
    const shared = order.filter(o => o.layer === layer)
    const slot = shared.findIndex(o => o.index === index)
    const [start, end] = layerWindow(layer, count)
    const local = p >= PHASES.down[1] ? 1 : clamp01(within(p, [start, end]) * shared.length - slot)
    const typed = typeBlock(config.steps[index], local)
    blocks[index] = typed.block
    if (local > 0 || rank === 0) cursor = { block: index, line: typed.line, col: typed.col }
  })
  return { blocks, cursor }
}

// `sheet · <skin>` while the skin draws, `x-ray · scanning` during the scan, `STEP k/n · <label> · <tech>`
// for the layer the packet is in (explode, down and up), `ready` at rest.
export function readoutAt (config: StackConfig, progress: number): string {
  const p = clamp01(progress)
  if (p < PHASES.skin[1]) return `sheet · ${config.skin}`
  if (p < PHASES.scan[1]) return 'x-ray · scanning'
  const count = config.layers.length
  const { step } = sheetPose(p, count)
  if (step === 0 || count === 0) return 'ready'
  const layer = config.layers[step - 1]
  const tech = layer.tech[0]
  return tech ? `STEP ${step}/${count} · ${layer.label} · ${tech}` : `STEP ${step}/${count} · ${layer.label}`
}
