import type { DATA } from '@/data/resume'

export type FigureId = 'portfolio' | 'ebooking' | 'weui' | 'coi-shop' | 'memory-game' | 'sticker'

export type ProjectSection = {
  id: string
  index: number
  title: string
  role: string
  period: string
  summary: string[]
  technologies: { name: string, icon?: string, iconDark?: string }[]
  links: { type: string, href: string }[]
  figureId?: FigureId
}

const FIGURE_BY_TITLE: Record<string, FigureId> = {
  'Tien Dat Portfolio': 'portfolio',
  'E-booking Healthcare': 'ebooking',
  'WeUI Clone': 'weui',
  'Coi Shop': 'coi-shop',
  'Memory Game': 'memory-game',
  'Sticker Animation': 'sticker',
}

function slugify (title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function buildProjectSections (projects: typeof DATA.projects): ProjectSection[] {
  return projects.map((project, i) => {
    const position = project.positions[0]
    return {
      id: slugify(project.title),
      index: i + 1,
      title: project.title,
      role: position.title,
      period: `${position.start} - ${position.end}`,
      summary: [...position.description],
      technologies: position.technologies.map(t => ({ ...t })),
      links: project.links.map(({ type, href }) => ({ type, href })),
      figureId: FIGURE_BY_TITLE[project.title],
    }
  })
}
