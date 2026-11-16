export type FigureId = 'portfolio' | 'agrita' | 'eoffice' | 'library' | 'ta-mobile' | 'betatruyen'

export type ProjectSection = {
  id: string
  index: number
  title: string
  role: string
  company: string
  period?: string
  summary: string[]
  technologies: { name: string, icon?: string, iconDark?: string }[]
  links: { type: string, href: string }[]
  figureId?: FigureId
}

export type ProjectPageEntry = Omit<ProjectSection, 'index'>

const REACT = { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' }
const NEXT = { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' }
const TS = { name: 'TypeScript', icon: 'skills/typescript.svg' }
const TAILWIND = { name: 'Tailwind CSS', icon: 'skills/tailwindcss.svg' }
const SHADCN = { name: 'shadcn/ui', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' }
const TANSTACK = { name: 'TanStack Query', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' }
const VITE = { name: 'Vite', icon: 'skills/vite.svg' }
const ZOD = { name: 'Zod', icon: 'skills/zod.svg' }
const REDUX = { name: 'Redux', icon: 'skills/redux.svg' }

export const PROJECT_PAGE_ENTRIES: ProjectPageEntry[] = [
  {
    id: 'tien-dat-portfolio',
    title: 'Tien Dat Portfolio',
    role: 'Personal Project',
    company: 'Personal',
    period: 'June 2024 - Present',
    summary: [
      'Built a modern portfolio and blog platform to showcase my projects and technical writing',
      'Created a component library with reusable UI elements for future projects and demonstrations',
      'Implemented dynamic content rendering with MDX for rich, interactive blog posts',
      'Developed a custom theming system with light/dark mode support',
      'Optimized performance with Next.js Image optimization and static site generation',
      'Designed mobile-first responsive layouts with clean animations and transitions',
      'Set up analytics to track user engagement and content performance',
    ],
    technologies: [
      NEXT,
      TS,
      TAILWIND,
      SHADCN,
      { name: 'Framer Motion', icon: 'skills/motion.svg', iconDark: 'skills/motion-dark.svg' },
      { name: 'Vercel', icon: 'skills/vercel.svg', iconDark: 'skills/vercel-dark.svg' },
      { name: 'GitHub', icon: 'skills/github.svg', iconDark: 'skills/github-dark.svg' },
      REACT,
      { name: 'JavaScript', icon: 'skills/javascript.svg' },
      { name: 'Figma', icon: 'skills/figma.svg' },
      { name: 'Postman', icon: 'skills/postman.svg' },
      { name: 'VSCode', icon: 'skills/vscode.svg' },
      { name: 'WebStorm', icon: 'skills/webstorm.svg' },
    ],
    links: [
      { type: 'Website', href: 'https://tiendat.work/' },
      { type: 'Source', href: 'https://github.com/tiendat2204/tien-dat-portfolio' },
    ],
    figureId: 'portfolio',
  },
  {
    id: 'agrita',
    title: 'AgriTA',
    role: 'Fullstack Developer (UI/UX and frontend lead)',
    company: 'T.A Consultant',
    period: 'Jun 2025 - Present',
    summary: [
      'Agricultural cooperative SaaS for a public-sector client (private, in development): three connected apps (admin console, farm management, public marketplace) built from BA requirements',
      'Shared design system reused across all three apps: semantic tokens, data tables, permission-aware screens, loading, empty and error states',
      'Map-based plot management with Leaflet and MapLibre to draw and edit field boundaries',
      'Marketplace buyer journey: storefronts, product pages, cart, checkout and QR origin tracing',
      'Playwright end-to-end tests and axe-core accessibility tests',
    ],
    technologies: [
      REACT,
      NEXT,
      { name: 'TanStack Router/Query/Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
      TAILWIND,
      SHADCN,
      { name: 'Leaflet/MapLibre' },
      { name: 'React Hook Form' },
      ZOD,
      { name: 'Playwright', icon: 'skills/playwright.svg' },
      { name: 'Vitest', icon: 'skills/vitest.svg' },
      { name: 'NestJS', icon: 'skills/nestjs.svg' },
      { name: 'Drizzle ORM', icon: 'skills/drizzle.svg', iconDark: 'skills/drizzle-dark.svg' },
    ],
    links: [],
    figureId: 'agrita',
  },
  {
    id: 'eoffice',
    title: 'E-Office Workflow',
    role: 'Fullstack Developer',
    company: 'T.A Consultant',
    period: 'Jun 2025 - Present',
    summary: [
      'Built business workflow features and secure APIs for an e-office system',
      'Delivered an automated approval system that reduced approval workflow time by 70%',
    ],
    technologies: [REACT, TS, VITE, TAILWIND, { name: 'TanStack Query', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' }, REDUX],
    links: [],
    figureId: 'eoffice',
  },
  {
    id: 'digital-library',
    title: 'Digital Library for a Pagoda',
    role: 'Fullstack Developer',
    company: 'T.A Consultant',
    period: 'Jun 2025 - Present',
    summary: [
      'Full-stack library system with book catalog management, borrowing records and role-based access control',
      'Manages 40,000+ books with 1,000+ active users',
    ],
    technologies: [NEXT, TANSTACK, TAILWIND, SHADCN],
    links: [],
    figureId: 'library',
  },
  {
    id: 'ta-mobile',
    title: 'TA Mobile',
    role: 'Developer',
    company: 'T.A Consultant',
    summary: [
      'Flutter mobile app for the TA Platform HR and attendance system, connected to its Identity and HR APIs',
      'Check-in and check-out using location, Wi-Fi and face verification according to HR policy, with attendance history',
      'Attendance-adjustment and overtime requests with an approval inbox for managers',
      'Admin tools for employees and work locations, plus secure token storage and biometric sign-in',
    ],
    technologies: [
      { name: 'Flutter' },
      { name: 'Dart' },
      { name: 'Material 3' },
      { name: 'MapLibre' },
      { name: 'ML Kit face detection' },
    ],
    links: [],
    figureId: 'ta-mobile',
  },
  {
    id: 'tangni-web',
    title: 'TangNi Web',
    role: 'Frontend Developer',
    company: 'T.A Consultant',
    summary: [
      'TangNi MVP frontend',
      'Built with Vite, React, TypeScript, TanStack Router and TanStack Query',
    ],
    technologies: [VITE, REACT, TS, { name: 'TanStack Router/Query', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' }, ZOD],
    links: [],
  },
  {
    id: 'xn2-admin',
    title: 'XN2 Bridge & Ferry Management',
    role: 'Frontend Developer',
    company: 'T.A Consultant',
    summary: [
      'Admin console for a bridge and ferry company, covering bridges, roads, ferries, records and contracts',
      'Modules for accounts, roles, companies, investors, work items, city and ward lookups and a dashboard, plus a form-template editor with rich text and Excalidraw drawing',
      'Data tables with filter operators such as between and empty',
    ],
    technologies: [VITE, REACT, TS, { name: 'Redux Toolkit', icon: 'skills/redux.svg' }, ZOD, TAILWIND, { name: 'dnd-kit' }, { name: 'Excalidraw' }],
    links: [],
  },
  {
    id: 'betatruyen',
    title: 'BetaTruyen Story Forum',
    role: 'Fullstack Developer',
    company: 'VietDev Studio',
    period: 'Sep 2024 - Jun 2025',
    summary: [
      'Led the frontend of a story community platform on Next.js with server-side rendering for performance and SEO',
      'Forum with 10,000+ users for reading, community interaction and content sharing',
      'Responsive interfaces with shadcn/ui and Tailwind CSS, data fetching with TanStack Query',
      'Secure authentication with JWT and Django REST Framework, CI/CD with GitHub Actions',
      'Built reusable components and hooks',
    ],
    technologies: [
      NEXT,
      REACT,
      SHADCN,
      TANSTACK,
      TAILWIND,
      { name: 'Django', icon: 'skills/django.svg' },
      { name: 'PostgreSQL', icon: 'skills/postgresql.svg' },
      { name: 'Python', icon: 'skills/python.svg' },
    ],
    links: [],
    figureId: 'betatruyen',
  },
]

export function toSection (entry: ProjectPageEntry, index: number): ProjectSection {
  return {
    ...entry,
    index,
    summary: [...entry.summary],
    technologies: entry.technologies.map(t => ({ ...t })),
    links: entry.links.map(l => ({ ...l })),
  }
}

export function buildProjectSections (): ProjectSection[] {
  return PROJECT_PAGE_ENTRIES.map((entry, i) => toSection(entry, i + 1))
}
