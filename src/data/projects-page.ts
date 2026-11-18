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
      'Agricultural SaaS for cooperatives (private, in development) on one data chain: land lot, crop season, harvest lot, stock lot, product, QR trace',
      'Owned the UI/UX and frontend of three connected web apps: the admin console and TA Farm (Vite SPA) and the TA Market marketplace (Next.js 16)',
      'Shared design system: semantic tokens, data tables, permission-aware screens, loading, empty and error states',
      'TA Farm: land lots on a map (Leaflet with Geoman over MapLibre GL), crop seasons, work tasks, cultivation logs, harvest lots, warehouse stock',
      'TA Market: storefronts, cart, checkout, seller orders and public QR trace pages; Vitest, Playwright and axe-core tests',
    ],
    technologies: [
      REACT,
      TS,
      VITE,
      NEXT,
      { name: 'TanStack Router/Query/Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
      TAILWIND,
      SHADCN,
      { name: 'Zustand', icon: 'skills/zustand.svg' },
      { name: 'React Hook Form', icon: 'skills/react-hook-form.svg' },
      ZOD,
      { name: 'MapLibre GL', icon: 'skills/maplibre.svg' },
      { name: 'Leaflet + Geoman', icon: 'skills/leaflet.svg' },
      { name: 'Recharts' },
      { name: 'Playwright', icon: 'skills/playwright.svg' },
      { name: 'Vitest', icon: 'skills/vitest.svg' },
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
      'Library management web app for a pagoda: a public catalog for readers and a protected management area for librarians',
      'Catalog of books, editions and physical copies with authors, translators, publishers, series, categories and DDC numbers, placed on floors and shelf locations',
      'Borrowing orders with borrow, due and return date checks and due-date alerts, plus accounts, roles and permission-gated screens',
      'Faster book entry with in-browser barcode scanning and ISBN metadata lookup, and a rich-text CMS for pages and blog posts',
      'Manages 40,000+ books with 1,000+ active users',
      'Built with Next.js 16 and React 19, TanStack Query and Table, Redux Toolkit and Zustand, React Hook Form and Zod, Tiptap and Playwright end-to-end tests',
    ],
    technologies: [
      NEXT,
      REACT,
      TS,
      { name: 'TanStack Query/Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
      { name: 'Redux Toolkit', icon: 'skills/redux.svg' },
      { name: 'Zustand', icon: 'skills/zustand.svg' },
      TAILWIND,
      SHADCN,
      { name: 'React Hook Form', icon: 'skills/react-hook-form.svg' },
      ZOD,
      { name: 'Tiptap' },
      { name: 'Playwright', icon: 'skills/playwright.svg' },
    ],
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
    technologies: [
      { name: 'Flutter', icon: 'skills/flutter.svg' },
      { name: 'Dart', icon: 'skills/dart.svg' },
      { name: 'Riverpod', icon: 'skills/riverpod.svg' },
      { name: 'dio' },
      { name: 'go_router' },
      { name: 'shadcn_ui', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' },
      { name: 'fl_chart', icon: 'skills/fl-chart.svg' },
    ],
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
    technologies: [
      VITE,
      REACT,
      TS,
      { name: 'TanStack Router/Query/Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
      { name: 'Zustand', icon: 'skills/zustand.svg' },
      { name: 'React Hook Form', icon: 'skills/react-hook-form.svg' },
      ZOD,
      TAILWIND,
      SHADCN,
      { name: 'Vitest', icon: 'skills/vitest.svg' },
      { name: 'Playwright', icon: 'skills/playwright.svg' },
      { name: 'MSW', icon: 'skills/msw.svg' },
    ],
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
    technologies: [VITE, REACT, TS, { name: 'React Router', icon: 'skills/react-router.svg' }, { name: 'Redux Toolkit', icon: 'skills/redux.svg' }, TANSTACK, { name: 'TanStack Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' }, { name: 'React Hook Form', icon: 'skills/react-hook-form.svg' }, ZOD, { name: 'Axios', icon: 'skills/axios.svg' }, TAILWIND, { name: 'dnd-kit', icon: 'skills/dnd-kit.svg' }, { name: 'Tiptap' }],
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
