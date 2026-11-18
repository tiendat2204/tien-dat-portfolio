export type FigureId = 'portfolio' | 'agrita' | 'eoffice' | 'library' | 'agrita-mobile' | 'tangni' | 'xn2' | 'betatruyen'

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
const VITE = { name: 'Vite', icon: 'skills/vite.svg' }
const ZOD = { name: 'Zod', icon: 'skills/zod.svg' }

const tech = (name: string, icon?: string, iconDark?: string) => ({
  name,
  ...(icon ? { icon: `skills/${icon}` } : {}),
  ...(iconDark ? { iconDark: `skills/${iconDark}` } : {}),
})
const REDUX_TK = tech('Redux Toolkit', 'redux.svg')
const RHF = tech('React Hook Form', 'react-hook-form.svg')
const AXIOS = tech('Axios', 'axios.svg')
const ROUTER = tech('React Router', 'react-router.svg')
const ZUSTAND = tech('Zustand', 'zustand.svg')
const TANSTACK_ALL = tech('TanStack', 'tanstack.svg', 'tanstack-dark.svg')
const VITEST = tech('Vitest', 'vitest.svg')
const PLAYWRIGHT = tech('Playwright', 'playwright.svg')
const TIPTAP = tech('Tiptap', 'tiptap.png')
const MSW = tech('MSW', 'msw.svg')
const RECHARTS = tech('Recharts')

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
    technologies: [REACT, NEXT, TS, TAILWIND, SHADCN, tech('MDX', 'mdx.svg'), tech('Motion', 'motion.svg', 'motion-dark.svg'), tech('GSAP', 'gsap.svg'), tech('Vercel', 'vercel.svg', 'vercel-dark.svg'), tech('GitHub', 'github.svg', 'github-dark.svg')],
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
      'Agricultural SaaS for cooperatives (private, in development) on one data chain: land lot, crop season, harvest lot, stock lot, product, QR trace',
      'Owned the UI/UX and frontend of three connected web apps: the admin console and TA Farm (Vite SPA) and the TA Market marketplace (Next.js 16)',
      'Shared design system: semantic tokens, data tables, permission-aware screens, loading, empty and error states',
      'TA Farm: land lots on a map (Leaflet with Geoman over MapLibre GL), crop seasons, work tasks, cultivation logs, harvest lots, warehouse stock',
      'TA Market: storefronts, cart, checkout, seller orders and public QR trace pages; Vitest, Playwright and axe-core tests',
    ],
    technologies: [REACT, TS, VITE, NEXT, TAILWIND, SHADCN, TANSTACK_ALL, ZUSTAND, RHF, ZOD, AXIOS, tech('MapLibre GL', 'maplibre.svg'), tech('Leaflet', 'leaflet.svg'), tech('Geoman', 'geoman.png'), RECHARTS, VITEST, PLAYWRIGHT],
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
    technologies: [REACT, TS, VITE, TAILWIND, SHADCN, ROUTER, TANSTACK_ALL, REDUX_TK, RHF, ZOD, AXIOS],
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
      'Library management web app for a pagoda: a public catalog for readers and a protected management area for librarians',
      'Catalog of books, editions and physical copies with authors, translators, publishers, series, categories and DDC numbers, placed on floors and shelf locations',
      'Borrowing orders with borrow, due and return date checks and due-date alerts, plus accounts, roles and permission-gated screens',
      'Faster book entry with in-browser barcode scanning and ISBN metadata lookup, and a rich-text CMS for pages and blog posts',
      'Manages 40,000+ books with 1,000+ active users',
      'Built with Next.js 16 and React 19, TanStack Query and Table, Redux Toolkit and Zustand, React Hook Form and Zod, Tiptap and Playwright end-to-end tests',
    ],
    technologies: [NEXT, REACT, TS, TAILWIND, SHADCN, TANSTACK_ALL, REDUX_TK, ZUSTAND, RHF, ZOD, TIPTAP, PLAYWRIGHT],
    links: [],
    figureId: 'library',
  },
  {
    id: 'agrita-mobile',
    title: 'AgriTA Mobile',
    role: 'Mobile Developer',
    company: 'T.A Consultant',
    summary: [
      'Flutter mobile client (Android first) for field workers of the AgriTA platform, with a Vietnamese UI on top of the AgriTA API',
      'Login with session restore and token refresh, plus tenant context selection',
      'Tasks tab for season work tasks, growing areas and crop seasons',
      'Cultivation journal with camera photo upload, and harvest create, list and detail screens',
      'Notifications, a sync center and an offline journal outbox, with weather on the home dashboard',
    ],
    technologies: [tech('Flutter', 'flutter.svg'), tech('Dart', 'dart.svg'), tech('Riverpod', 'riverpod.svg'), tech('dio', 'dio.png'), tech('go_router', 'flutter.svg'), SHADCN, tech('fl_chart', 'fl-chart.svg'), tech('Sentry', 'sentry.svg')],
    links: [],
    figureId: 'agrita-mobile',
  },
  {
    id: 'tangni-web',
    title: 'TangNi Web',
    role: 'Frontend Developer',
    company: 'T.A Consultant',
    summary: [
      'Frontend of a management MVP for a Buddhist monastic order: monastic profiles, congregations and monasteries',
      'Two-level review workflow: a member drafts and submits a profile with identity documents, a congregation secretary reviews it, then an admin gives final approval',
      'Admin modules for accounts, roles, permissions, ecclesiastical ranks, congregations, secretary assignments and monastery declarations, plus public monastery and profile lookup pages',
      'Vite SPA with React 19 and TypeScript: file-based TanStack Router with zod-validated URL search state, TanStack Query and Table, Zustand, React Hook Form and Zod',
      'Accessible forms and page states, per-route code splitting with a first-load size budget, Vitest with MSW and Playwright tests',
    ],
    technologies: [VITE, REACT, TS, TAILWIND, SHADCN, TANSTACK_ALL, ZUSTAND, RHF, ZOD, AXIOS, VITEST, MSW, PLAYWRIGHT],
    links: [],
    figureId: 'tangni',
  },
  {
    id: 'xn2-admin',
    title: 'XN2 Bridge & Ferry Management',
    role: 'Frontend Developer',
    company: 'T.A Consultant',
    summary: [
      'Admin console for a bridge and ferry company, covering bridges, roads, ferries, records and contracts',
      'Modules for accounts, roles, companies, investors, work items, city and ward lookups and a dashboard, plus a form-template editor with rich text and drawing',
      'Data tables with filter operators such as between and empty',
    ],
    technologies: [VITE, REACT, TS, TAILWIND, ROUTER, REDUX_TK, TANSTACK_ALL, RHF, ZOD, AXIOS, tech('dnd-kit', 'dnd-kit.svg'), TIPTAP, RECHARTS],
    links: [],
    figureId: 'xn2',
  },
  {
    id: 'betatruyen',
    title: 'BetaTruyen Story Forum',
    role: 'Fullstack Developer',
    company: 'VietDev Studio',
    period: 'Sep 2024 - Jun 2025',
    summary: [
      'Built and maintained a story community forum with over 10,000 users, supporting reading, community interaction and content sharing',
      'A community for discussing text stories, comics and related publications, with story ranking and rating and a database of main characters',
      'Led the frontend on Next.js with server-side rendering for performance and SEO',
      'Responsive interfaces with shadcn/ui and Tailwind CSS, data fetching with TanStack Query',
      'Secure authentication with JWT and Django REST Framework, CI/CD with GitHub Actions',
      'Built reusable components and hooks',
    ],
    technologies: [NEXT, REACT, SHADCN, TAILWIND, TANSTACK_ALL, REDUX_TK, RHF, ZOD, AXIOS, tech('Django', 'django.svg'), tech('GitHub Actions', 'github.svg', 'github-dark.svg')],
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
