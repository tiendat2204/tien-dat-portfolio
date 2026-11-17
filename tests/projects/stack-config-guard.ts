import { existsSync } from 'node:fs'
import { join } from 'node:path'

import type { StackConfig } from '../../src/components/iso/stack/types'

const ICON_DIR = join(process.cwd(), 'public', 'icons', 'skills')
const MAX_LINE = 60
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
  if (config.layers.length < 1) fail(config, 'no layers')
  config.steps.forEach((step, i) => {
    if (!Number.isInteger(step.layer) || step.layer < 0 || step.layer >= config.layers.length) {
      fail(config, `step ${i} layer ${step.layer} out of range`)
    }
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
