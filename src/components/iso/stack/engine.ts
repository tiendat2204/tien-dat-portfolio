import type { StackConfig } from '@/components/iso/stack/types'

// Pure stack-anatomy engine: progress (0..1) in, pose / terminal / readout out. No DOM, no React.

const EXPLODE_END = 0.15
const DOWN_END = 0.65
const UP_END = 0.95
// Share of a step's slot spent typing; the rest is a beat before its result prints.
const TYPE_SHARE = 0.8
const RESULT_AT = 0.9

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

export function stackPose (progress: number, layerCount: number): StackPose {
  const p = clamp01(progress)
  const last = layersOf(layerCount) - 1
  const explode = Math.min(1, p / EXPLODE_END)
  if (p < EXPLODE_END) return { active: 0, packetY: 0, direction: 'down', explode }
  if (p <= DOWN_END) {
    const packetY = (p - EXPLODE_END) / (DOWN_END - EXPLODE_END)
    return { active: Math.round(packetY * last), packetY, direction: 'down', explode }
  }
  if (p < UP_END) {
    const packetY = 1 - (p - DOWN_END) / (UP_END - DOWN_END)
    return { active: Math.round(packetY * last), packetY, direction: 'up', explode }
  }
  return { active: 0, packetY: 0, direction: 'up', explode }
}

// Steps share the down travel (EXPLODE_END..DOWN_END) in equal slots, in `steps` order.
export function terminalAt (config: StackConfig, progress: number): TerminalState {
  const p = clamp01(progress)
  const count = config.steps.length
  if (count === 0) return { blocks: [], cursor: { block: 0, line: 0, col: 0 } }
  const slotWidth = (DOWN_END - EXPLODE_END) / count
  let cursor = { block: 0, line: 0, col: 0 }
  const blocks = config.steps.map((step, i): TerminalBlock => {
    const local = clamp01((p - EXPLODE_END - i * slotWidth) / slotWidth)
    const total = step.prompt.length + step.lines.reduce((sum, line) => sum + line.length, 0)
    const done = local >= RESULT_AT
    if (local <= 0) return { prompt: '', typed: [], result: null, done: false }
    let left = done ? total : Math.floor(Math.min(1, local / TYPE_SHARE) * total)
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
    cursor = done ? { block: i, line: step.lines.length + 1, col: 0 } : { block: i, ...row }
    return { prompt, typed, result: done ? step.result : null, done }
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
