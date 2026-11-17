import type { FigureModule } from '@/components/iso/figure-contract'
import { AgritaMobileLive, AgritaMobileStill } from '@/components/iso/figures/agrita-mobile/live'

// Fig 5: a field journal station that stands for the offline-first field app: a card is drafted and stamped at the
// handheld, queued in the outbox, and synced up the belt into the server rack once the uplink has a signal.
const agritaMobileFigure: FigureModule = {
  id: 'agrita-mobile',
  fig: 5,
  title: 'Field journal outbox',
  hint: 'scroll to sync; point away to go offline',
  Static: AgritaMobileStill,
  Live: AgritaMobileLive,
}

export default agritaMobileFigure
