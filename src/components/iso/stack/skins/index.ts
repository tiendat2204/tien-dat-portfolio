import { dashboardPaths } from '@/components/iso/stack/skins/dashboard'
import { editorPaths } from '@/components/iso/stack/skins/editor'
import { forumPaths } from '@/components/iso/stack/skins/forum'
import { phonePaths } from '@/components/iso/stack/skins/phone'
import { webPaths } from '@/components/iso/stack/skins/web'
import type { SkinKind } from '@/components/iso/stack/types'

export const SKIN_KINDS = ['web', 'dashboard', 'phone', 'editor', 'forum'] as const satisfies readonly SkinKind[]

// One drawing area shared by every skin: [minX, minY, width, height].
export const skinViewBox: [number, number, number, number] = [0, 0, 240, 180]

const BUILDERS: Record<SkinKind, () => string[]> = {
  web: webPaths,
  dashboard: dashboardPaths,
  phone: phonePaths,
  editor: editorPaths,
  forum: forumPaths,
}

// The skin's path `d` strings in draw order (pure; a fresh array on every call).
export function skinPaths (kind: SkinKind): string[] {
  return BUILDERS[kind]()
}

// The share of path `index` (of `count`) drawn at `draw` 0..1: each path draws over its own equal slice, in order.
export function skinShare (draw: number, index: number, count: number): number {
  const value = Number.isFinite(draw) ? draw * count - index : 0
  return Math.min(1, Math.max(0, value))
}
