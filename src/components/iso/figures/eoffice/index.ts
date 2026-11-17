import type { FigureModule } from '@/components/iso/figure-contract'
import { EofficeLive, EofficeStill } from '@/components/iso/figures/eoffice/live'

// Fig 3: a routing sorter that carries one document past the draft, review and approved stamps as the section scrolls.
const eofficeFigure: FigureModule = {
  id: 'eoffice',
  fig: 3,
  title: 'Routing sorter',
  hint: 'scroll to route a document to approval',
  Static: EofficeStill,
  Live: EofficeLive,
}

export default eofficeFigure
