import type { StackConfig } from '@/components/iso/stack/types'

// AgriTA: a harvest lot traced by QR, from the page down to the ORM. Tech from the CV only (no database is named);
// snippets are representative with generic identifiers, not the client's code or data model.
export const agritaConfig: StackConfig = {
  id: 'agrita',
  fig: 2,
  title: 'AgriTA stack',
  hint: 'scroll to trace a harvest lot',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'Next.js', 'shadcn/ui'], icon: 'react.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'Router', 'Table'], icon: 'tanstack.svg' },
    { id: 'api', label: 'api', tech: ['NestJS'], icon: 'nestjs.svg' },
    { id: 'orm', label: 'orm', tech: ['Drizzle ORM'], icon: 'drizzle.svg' },
  ],
  side: [
    { id: 'map', label: 'map', tech: ['Leaflet', 'MapLibre'] },
    { id: 'tests', label: 'tests', tech: ['Playwright', 'axe-core'], icon: 'playwright.svg' },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat lot-trace.tsx',
      lines: ['<Card>', '  <CardTitle>{lot.name}</CardTitle>', '  <QrCode value={lot.traceId} />', '</Card>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat use-lot.ts',
      lines: ['const { data: lot } = useQuery({', '  queryKey: [\'lots\', id],', '  queryFn: () => getTrace(id),', '})'],
      result: 'cached',
    },
    {
      layer: 2,
      prompt: 'cat lots.controller.ts',
      lines: ['@Get(\':id/trace\')', 'trace (@Param(\'id\') id: string) {', '  return this.lots.trace(id)', '}'],
      result: '200',
    },
    {
      layer: 3,
      prompt: 'cat lots.repository.ts',
      lines: ['return db.query.lots.findFirst({', '  where: eq(lots.id, id),', '  with: { origin: true },', '})'],
      result: 'trace ready',
    },
  ],
}
