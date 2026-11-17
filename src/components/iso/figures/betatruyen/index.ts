import type { FigureModule } from '@/components/iso/figure-contract'
import { BetatruyenLive, BetatruyenStill } from '@/components/iso/figures/betatruyen/live'

// Fig 6: a forum desk where a story is read, commented on, rated and ranked up as the section scrolls.
const betatruyenFigure: FigureModule = {
  id: 'betatruyen',
  fig: 6,
  title: 'Story forum desk',
  hint: 'scroll to read, comment and rank a story',
  Static: BetatruyenStill,
  Live: BetatruyenLive,
}

export default betatruyenFigure
