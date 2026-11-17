import { dashboardPaths } from '@/components/iso/stack/skins/dashboard'
import { editorPaths } from '@/components/iso/stack/skins/editor'
import { forumPaths } from '@/components/iso/stack/skins/forum'
import { phonePaths } from '@/components/iso/stack/skins/phone'
import { webPaths } from '@/components/iso/stack/skins/web'

// Local copy of the union in `types.ts` (Task S1); a later task makes this import it from there.
export type SkinKind = 'web' | 'dashboard' | 'phone' | 'editor' | 'forum'

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
