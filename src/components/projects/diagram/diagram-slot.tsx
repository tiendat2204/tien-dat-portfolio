import type { ComponentType } from 'react'

import { AgritaDiagram } from '@/components/projects/diagram/agrita'
import { AgritaMobileDiagram } from '@/components/projects/diagram/agrita-mobile'
import { BetatruyenDiagram } from '@/components/projects/diagram/betatruyen'
import { EofficeDiagram } from '@/components/projects/diagram/eoffice'
import { LibraryDiagram } from '@/components/projects/diagram/library'
import { PortfolioDiagram } from '@/components/projects/diagram/portfolio'
import { TangniDiagram } from '@/components/projects/diagram/tangni'
import { Xn2Diagram } from '@/components/projects/diagram/xn2'
import { FigureFrame } from '@/components/iso/figure-frame'
import type { FigureId } from '@/data/projects-page'

import '@/components/projects/diagram/diagram.css'

// One hand-drawn diagram per project; the section's scroll progress (`--p`) animates it (see anim.ts).
const DIAGRAMS: Record<FigureId, { fig: number, title: string, hint: string, Diagram: ComponentType }> = {
  portfolio: { fig: 1, title: 'site', hint: 'scroll to publish a post', Diagram: PortfolioDiagram },
  agrita: { fig: 2, title: 'trace', hint: 'scroll to trace a product', Diagram: AgritaDiagram },
  eoffice: { fig: 3, title: 'approval', hint: 'scroll to approve a document', Diagram: EofficeDiagram },
  library: { fig: 4, title: 'catalog', hint: 'scroll to catalog a book', Diagram: LibraryDiagram },
  'agrita-mobile': { fig: 5, title: 'field app', hint: 'scroll to sync the field journal', Diagram: AgritaMobileDiagram },
  tangni: { fig: 6, title: 'review', hint: 'scroll to review a profile', Diagram: TangniDiagram },
  xn2: { fig: 7, title: 'records', hint: 'scroll to open a bridge record', Diagram: Xn2Diagram },
  betatruyen: { fig: 8, title: 'forum', hint: 'scroll to top up and collect', Diagram: BetatruyenDiagram },
}

export function DiagramSlot ({ figureId }: { figureId?: FigureId }) {
  if (!figureId) return null
  const { fig, title, hint, Diagram } = DIAGRAMS[figureId]
  return (
    <div data-figure={figureId} className='mt-6 w-full'>
      <FigureFrame fig={fig} title={title} hint={hint} readout='spec sheet'>
        <Diagram />
      </FigureFrame>
    </div>
  )
}
