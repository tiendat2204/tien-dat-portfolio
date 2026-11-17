import type { FigureModule } from '@/components/iso/figure-contract'
import { AgritaLive, AgritaStill } from '@/components/iso/figures/agrita/live'

// Fig 2: a traceability line that carries a harvest lot to its QR label as the section scrolls.
const agritaFigure: FigureModule = {
  id: 'agrita',
  fig: 2,
  title: 'Traceability line',
  hint: 'scroll to trace a lot to its QR',
  Static: AgritaStill,
  Live: AgritaLive,
}

export default agritaFigure
