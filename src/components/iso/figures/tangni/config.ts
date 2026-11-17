import type { StackConfig } from '@/components/iso/stack/types'

// TangNi Web: a two-level profile review (draft, first review, final approval) through the frontend stack. Tech from the
// app's package.json and CLAUDE.md (a Vite SPA, not Next.js); the API is a separate backend. Snippets are
// representative with generic identifiers, not the client's code, routes or endpoints.
export const tangniConfig: StackConfig = {
  id: 'tangni',
  fig: 6,
  title: 'TangNi stack',
  hint: 'scroll to review a profile',
  skin: 'dashboard',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'shadcn/ui', 'Tailwind CSS'], icon: 'react.svg' },
    { id: 'routes', label: 'routes', tech: ['Vite', 'TanStack Router'], icon: 'vite.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'TanStack Table', 'Zustand'], icon: 'tanstack.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod'], icon: 'zod.svg' },
    { id: 'api', label: 'api', tech: ['Axios', 'token refresh'] },
  ],
  side: [
    { id: 'review', label: 'review', tech: ['2-level review', 'role guards'] },
    { id: 'tests', label: 'tests', tech: ['Vitest', 'MSW', 'Playwright'], icon: 'vitest.svg' },
    { id: 'a11y', label: 'a11y', tech: ['Radix UI', 'accessible fields'] },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat status-badge.tsx',
      lines: ['<Badge variant={tone(item.status)}>', '  {label(item.status)}</Badge>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat routes/records.index.tsx',
      lines: ['createFileRoute(\'/records/\')({', '  validateSearch: searchSchema })'],
      result: 'search parsed',
    },
    {
      layer: 2,
      prompt: 'cat use-records-query.ts',
      lines: ['useQuery({ queryKey: recordKeys.list(q),', '  queryFn: () => recordApi.list(q) })'],
      result: 'cached',
    },
    {
      layer: 3,
      prompt: 'cat submit.schema.ts',
      lines: ['z.object({ groupId: z.uuid(),', '  version: z.number().int() })'],
      result: 'valid',
    },
    {
      layer: 4,
      prompt: 'cat decision.api.ts',
      lines: ['client.post(decisionPath(id),', '  { version, decision: \'approve\' })'],
      result: '200 next level',
    },
  ],
}
