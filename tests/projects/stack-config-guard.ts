import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { SkinKind, StackConfig } from '../../src/components/iso/stack/types'

const ICON_DIR = join(process.cwd(), 'public', 'icons', 'skills')
const MAX_LINE = 60
// Rows the terminal viewport shows (src/components/iso/stack/stack.css, `.stack-term-screen` height calc(5 * 16px + 10px)):
// a finished step shows its prompt row, its code lines, its result row and then the idle `$ █` row the cursor moves
// to (terminal-panel.tsx), and all of them must fit or the step's `$` prompt is half cut at the top.
export const TERMINAL_ROWS = 5
// Columns a notes row holds before it wraps (`.stack-term-log p` is pre-wrap, so a longer line takes a second row and
// pushes the step's `$` prompt out of the viewport). The notes column is 60% of the sheet (stack.css `.sheet`), Plex
// Mono at 10.5px (about 6.3px a column) less 14px padding: about 46 columns on the 527px card at a 1024px viewport
// (45 measured in the browser), the narrowest desktop card. Prompts are rendered after `$ `, so they count two more.
export const TERMINAL_COLS = 44

// Rows a finished step occupies in the terminal: prompt + code lines + result + the idle prompt row after it.
export function stepRows (step: StackConfig['steps'][number]): number {
  return 1 + step.lines.length + 1 + 1
}
const SKINS: readonly SkinKind[] = ['web', 'dashboard', 'phone', 'editor', 'forum']
const BANNED = ['http', '://', 'localhost', 'bearer ', 'sk-', 'password', 'secret', 'token=', 't.a consultant', 'diamond', 'vietdev']
const IPV4 = /\d+\.\d+\.\d+\.\d+/

function fail (config: StackConfig, message: string): never {
  throw new Error(`stack config '${config.id}': ${message}`)
}

// Throws unless the config is structurally sound and its visible text holds no URL, host, IP, credential-like
// string or client name, no line is over MAX_LINE characters, and every icon is a real file in public/icons/skills.
export function assertSafeConfig (config: StackConfig): void {
  if (typeof config.id !== 'string' || config.id.length === 0) fail(config, 'empty id')
  if (!Number.isInteger(config.fig) || config.fig < 1) fail(config, `fig ${config.fig} is not a positive integer`)
  if (!SKINS.includes(config.skin)) fail(config, `unknown skin '${String(config.skin)}'`)
  if (config.layers.length < 1) fail(config, 'no layers')
  config.steps.forEach((step, i) => {
    if (!Number.isInteger(step.layer) || step.layer < 0 || step.layer >= config.layers.length) {
      fail(config, `step ${i} layer ${step.layer} out of range`)
    }
    const wide = [`$ ${step.prompt}`, ...step.lines, step.result].find(text => text.length > TERMINAL_COLS)
    if (wide !== undefined) fail(config, `step ${i} line '${wide}' (${wide.length}) exceeds ${TERMINAL_COLS} terminal columns`)
    const rows = stepRows(step)
    if (rows > TERMINAL_ROWS) fail(config, `step ${i} needs ${rows} terminal rows, more than ${TERMINAL_ROWS}`)
  })

  const tiers = [...config.layers, ...config.side]
  const texts = [
    config.title,
    config.hint,
    ...tiers.flatMap(tier => [tier.id, tier.label, ...tier.tech, tier.icon ?? '']),
    ...config.steps.flatMap(step => [step.prompt, ...step.lines, step.result]),
  ]
  const all = texts.join('\n').toLowerCase()
  for (const word of BANNED) {
    if (all.includes(word)) fail(config, `contains banned text '${word}'`)
  }
  if (IPV4.test(all)) fail(config, 'contains an IPv4-like address')
  for (const text of texts) {
    if (text.length > MAX_LINE) fail(config, `line longer than ${MAX_LINE}: '${text}'`)
  }
  for (const tier of tiers) {
    if (tier.icon !== undefined && !existsSync(join(ICON_DIR, tier.icon))) fail(config, `missing icon '${tier.icon}'`)
  }
}
