import type { FigureModule } from '@/components/iso/figure-contract'
import { PortfolioLive, PortfolioStill } from '@/components/iso/figures/portfolio/live'

// Fig 1: a drafting plotter that drafts this site's page layout as the section scrolls.
const portfolioFigure: FigureModule = {
  id: 'portfolio',
  fig: 1,
  title: 'Drafting plotter',
  hint: 'scroll to draft the layout',
  Static: PortfolioStill,
  Live: PortfolioLive,
}

export default portfolioFigure
