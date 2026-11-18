import { agritaConfig } from '@/components/iso/figures/agrita/config'
import { agritaMobileConfig } from '@/components/iso/figures/agrita-mobile/config'
import { betatruyenConfig } from '@/components/iso/figures/betatruyen/config'
import { eofficeConfig } from '@/components/iso/figures/eoffice/config'
import { libraryConfig } from '@/components/iso/figures/library/config'
import { portfolioConfig } from '@/components/iso/figures/portfolio/config'
import { tangniConfig } from '@/components/iso/figures/tangni/config'
import { xn2Config } from '@/components/iso/figures/xn2/config'
import type { StackConfig } from '@/components/iso/stack/types'
import type { FigureId } from '@/data/projects-page'

// The stack config of each project, read directly (plain data) so a card draws its diagram without loading a figure.
export const DIAGRAM_CONFIGS: Record<FigureId, StackConfig> = {
  portfolio: portfolioConfig,
  agrita: agritaConfig,
  eoffice: eofficeConfig,
  library: libraryConfig,
  'agrita-mobile': agritaMobileConfig,
  tangni: tangniConfig,
  xn2: xn2Config,
  betatruyen: betatruyenConfig,
}
