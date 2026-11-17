import type { StackConfig } from '@/components/iso/stack/types'

// Pure stack-anatomy engine: progress (0..1) in, pose / terminal / readout out. No DOM, no React.

const EXPLODE_END = 0.15
const DOWN_END = 0.65
const UP_END = 0.95
// Share of a step's slot spent typing; the full snippet then holds until the slot ends and its result prints.
const TYPE_SHARE = 0.85

type StackPose = { active: number, packetY: number, direction: 'down' | 'up', explode: number }

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

// The one mapping between the packet and the layers: layer k of n owns packetY [k/n, (k+1)/n],
// which is progress [0.15 + 0.5k/n, 0.15 + 0.5(k+1)/n] on the down travel.
function layerAt (packetY: number, count: number): number {
  return Math.min(count - 1, Math.floor(packetY * count))
}

function layerWindow (layer: number, count: number): [number, number] {
  const span = DOWN_END - EXPLODE_END
  return [EXPLODE_END + span * layer / count, EXPLODE_END + span * (layer + 1) / count]
}

export function stackPose (progress: number, layerCount: number): StackPose {
  const p = clamp01(progress)
  const count = layersOf(layerCount)
  const explode = Math.min(1, p / EXPLODE_END)
  if (p < EXPLODE_END) return { active: 0, packetY: 0, direction: 'down', explode }
  if (p <= DOWN_END) {
    const packetY = (p - EXPLODE_END) / (DOWN_END - EXPLODE_END)
    return { active: layerAt(packetY, count), packetY, direction: 'down', explode }
  }
  if (p < UP_END) {
    const packetY = 1 - (p - DOWN_END) / (UP_END - DOWN_END)
    return { active: layerAt(packetY, count), packetY, direction: 'up', explode }
  }
  return { active: 0, packetY: 0, direction: 'up', explode }
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
// so the terminal always types the snippet for the layer the packet is in. Done by DOWN_END.
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
    const local = p >= DOWN_END ? 1 : clamp01((p - start) / (end - start) * shared.length - slot)
    const typed = typeBlock(config.steps[index], local)
    blocks[index] = typed.block
    if (local > 0 || rank === 0) cursor = { block: index, line: typed.line, col: typed.col }
  })
  return { blocks, cursor }
}

export function readoutAt (config: StackConfig, progress: number): string {
  const p = clamp01(progress)
  if (p >= UP_END || config.layers.length === 0) return '→ ready'
  const layer = config.layers[stackPose(p, config.layers.length).active]
  const tech = layer.tech[0]
  return tech ? `→ ${layer.label} · ${tech}` : `→ ${layer.label}`
}
