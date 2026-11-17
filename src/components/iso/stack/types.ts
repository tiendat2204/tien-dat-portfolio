import type { FigureId } from '@/data/projects-page'

// One tier of a project's exploded stack. `label` is short mono text (`api`), `tech` the chips,
// `icon` a file name under public/icons/skills/.
export type StackLayer = { id: string, label: string, tech: string[], icon?: string }

// One terminal block. `layer` indexes `StackConfig.layers`, `prompt` is the command without the `$`,
// `lines` are typed after it and `result` is the single output line.
export type TerminalStep = { layer: number, prompt: string, lines: string[], result: string }

export type StackConfig = {
  id: FigureId
  fig: number
  title: string
  hint: string
  layers: StackLayer[]
  side: StackLayer[]
  steps: TerminalStep[]
}
