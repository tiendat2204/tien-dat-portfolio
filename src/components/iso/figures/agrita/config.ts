import type { StackConfig } from '@/components/iso/stack/types'

// AgriTA: a harvest lot traced by QR, through the web apps' frontend stack. Tech from the apps' package.json and
// READMEs (admin console and TA Farm are Vite SPAs, TA Market is Next.js); the REST API is a separate backend.
// Snippets are representative with generic identifiers, not the client's code, routes or endpoints.
export const agritaConfig: StackConfig = {
  id: 'agrita',
  fig: 2,
  title: 'AgriTA stack',
  hint: 'scroll to trace a harvest lot',
  skin: 'dashboard',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'shadcn/ui', 'Tailwind CSS'], icon: 'react.svg' },
    { id: 'routes', label: 'routes', tech: ['Vite', 'TanStack Router'], icon: 'vite.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'TanStack Table', 'Zustand'], icon: 'tanstack.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod'], icon: 'zod.svg' },
    { id: 'api', label: 'api', tech: ['Axios', 'shared session', 'OpenAPI'] },
  ],
  side: [
    { id: 'map', label: 'map', tech: ['MapLibre GL', 'Leaflet', 'Geoman'] },
    { id: 'market', label: 'market', tech: ['Next.js 16', 'QR trace'], icon: 'nextjs.svg' },
    { id: 'tests', label: 'tests', tech: ['Vitest', 'Playwright', 'axe-core'], icon: 'playwright.svg' },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat harvest-lot-card.tsx',
      lines: ['<Card><CardTitle>{lot.code}</CardTitle>', '  <TraceBadge status={lot.trace} /></Card>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat routes/harvest-lots.$lotId.tsx',
      lines: ['createFileRoute(\'/harvest-lots/$lotId\')({', '  beforeLoad: can(\'harvest.read\') })'],
      result: 'guarded',
    },
    {
      layer: 2,
      prompt: 'cat use-harvest-lot.ts',
      lines: ['useQuery({ queryKey: lotKeys.detail(id),', '  queryFn: () => lotApi.get(id) })'],
      result: 'cached',
    },
    {
      layer: 3,
      prompt: 'cat harvest-lot.schema.ts',
      lines: ['z.object({ landLotId: z.uuid(),', '  seasonId: z.uuid(), qty: z.number() })'],
      result: 'valid',
    },
    {
      layer: 4,
      prompt: 'cat trace-code.api.ts',
      lines: ['client.post(traceCodes, { harvestLotId })', '  .then(res => publish(res.data.id))'],
      result: '201 published',
    },
  ],
}
