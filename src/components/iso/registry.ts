import type { FigureModule } from '@/components/iso/figure-contract'
import type { FigureId } from '@/data/projects-page'

export const FIGURE_IDS: readonly FigureId[] = ['portfolio', 'agrita', 'eoffice', 'library', 'agrita-mobile', 'tangni', 'xn2', 'betatruyen']

// One dynamic import per figure, so the route ships no figure code up front.
export const FIGURE_LOADERS: Record<FigureId, () => Promise<{ default: FigureModule }>> = {
  portfolio: () => import('@/components/iso/figures/portfolio'),
  agrita: () => import('@/components/iso/figures/agrita'),
  eoffice: () => import('@/components/iso/figures/eoffice'),
  library: () => import('@/components/iso/figures/library'),
  'agrita-mobile': () => import('@/components/iso/figures/agrita-mobile'),
  tangni: () => import('@/components/iso/figures/tangni'),
  xn2: () => import('@/components/iso/figures/xn2'),
  betatruyen: () => import('@/components/iso/figures/betatruyen'),
}

export async function loadFigure (id: FigureId): Promise<FigureModule> {
  const loaded = await FIGURE_LOADERS[id]()
  return loaded.default
}
