import type { FigureModule } from '@/components/iso/figure-contract'
import type { FigureId } from '@/data/projects-page'

export const FIGURE_IDS: readonly FigureId[] = ['portfolio', 'ebooking', 'weui', 'coi-shop', 'memory-game', 'sticker']

// One dynamic import per figure, so the route ships no figure code up front.
export const FIGURE_LOADERS: Record<FigureId, () => Promise<{ default: FigureModule }>> = {
  portfolio: () => import('@/components/iso/figures/portfolio'),
  ebooking: () => import('@/components/iso/figures/ebooking'),
  weui: () => import('@/components/iso/figures/weui'),
  'coi-shop': () => import('@/components/iso/figures/coi-shop'),
  'memory-game': () => import('@/components/iso/figures/memory-game'),
  sticker: () => import('@/components/iso/figures/sticker'),
}

export async function loadFigure (id: FigureId): Promise<FigureModule> {
  const loaded = await FIGURE_LOADERS[id]()
  return loaded.default
}
