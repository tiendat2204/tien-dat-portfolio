import type { FigureModule } from '@/components/iso/figure-contract'
import { LibraryLive, LibraryStill } from '@/components/iso/figures/library/live'

// Fig 4: a library card catalog and loan desk that checks a book out as the section scrolls.
const libraryFigure: FigureModule = {
  id: 'library',
  fig: 4,
  title: 'Card catalog',
  hint: 'scroll to check a book out',
  Static: LibraryStill,
  Live: LibraryLive,
}

export default libraryFigure
