import type { ComponentType } from 'react'

import { AgritaDiagram } from '@/components/projects/diagram/agrita'
import { AgritaMobileDiagram } from '@/components/projects/diagram/agrita-mobile'
import { BetatruyenDiagram } from '@/components/projects/diagram/betatruyen'
import { EofficeDiagram } from '@/components/projects/diagram/eoffice'
import { LibraryDiagram } from '@/components/projects/diagram/library'
import { PortfolioDiagram } from '@/components/projects/diagram/portfolio'
import { TangniDiagram } from '@/components/projects/diagram/tangni'
import { Xn2Diagram } from '@/components/projects/diagram/xn2'
import type { FigureId } from '@/data/projects-page'

import '@/components/projects/diagram/diagram.css'

// One hand-drawn diagram per project; the section's scroll progress (`--p`) animates it (see anim.ts).
const DIAGRAMS: Record<FigureId, { fig: number, title: string, Diagram: ComponentType }> = {
  portfolio: { fig: 1, title: 'site', Diagram: PortfolioDiagram },
  agrita: { fig: 2, title: 'trace', Diagram: AgritaDiagram },
  eoffice: { fig: 3, title: 'approval', Diagram: EofficeDiagram },
  library: { fig: 4, title: 'catalog', Diagram: LibraryDiagram },
  'agrita-mobile': { fig: 5, title: 'field app', Diagram: AgritaMobileDiagram },
  tangni: { fig: 6, title: 'review', Diagram: TangniDiagram },
  xn2: { fig: 7, title: 'records', Diagram: Xn2Diagram },
  betatruyen: { fig: 8, title: 'forum', Diagram: BetatruyenDiagram },
}

export function DiagramSlot ({ figureId }: { figureId?: FigureId }) {
  if (!figureId) return null
  const { fig, title, Diagram } = DIAGRAMS[figureId]
  return (
    <div data-figure={figureId} className='dg-frame mt-6 w-full pt-6'>
      <span className='dg-caption'>{`fig ${String(fig).padStart(2, '0')} · ${title}`}</span>
      <Diagram />
    </div>
  )
}
