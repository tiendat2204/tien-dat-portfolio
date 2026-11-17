import type { StackConfig } from '@/components/iso/stack/types'

// XN2: an admin console for a bridge and ferry company, through its Vite + React frontend. Tech from the
// frontend's package.json and src imports (pages for accounts, roles, companies, investors, work items, city and
// ward lookups, a dashboard and a form-template editor). The REST API is a separate backend, not shown.
// Snippets are representative with generic identifiers, not the client's code, routes or endpoints.
export const xn2Config: StackConfig = {
  id: 'xn2',
  fig: 7,
  title: 'XN2 stack',
  hint: 'scroll to open a contract record',
  skin: 'dashboard',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'Radix UI', 'Tailwind CSS'], icon: 'react.svg' },
    { id: 'routes', label: 'routes', tech: ['Vite', 'React Router 7', 'nuqs'], icon: 'vite.svg' },
    { id: 'state', label: 'state', tech: ['Redux Toolkit', 'TanStack Query'], icon: 'redux.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod'], icon: 'zod.svg' },
    { id: 'api', label: 'api', tech: ['Axios', 'interceptors'] },
  ],
  side: [
    { id: 'editor', label: 'editor', tech: ['Tiptap editor', 'Excalidraw', 'KaTeX'] },
    { id: 'tables', label: 'tables', tech: ['TanStack Table', 'dnd-kit', 'filter operators'], icon: 'tanstack.svg' },
    { id: 'charts', label: 'charts', tech: ['Recharts'] },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat record-row.tsx',
      lines: ['<TableRow><TableCell>{record.code}', '  <Badge>{record.status}</Badge></TableRow>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat router.tsx',
      lines: ['createBrowserRouter([{ path: \'records\',', '  element: <RecordList /> }])'],
      result: 'routed',
    },
    {
      layer: 2,
      prompt: 'cat filter.slice.ts',
      lines: ['createSlice({ name: \'filter\', initialState,', '  reducers: { setOperator, clearFilter } })'],
      result: 'dispatched',
    },
    {
      layer: 3,
      prompt: 'cat record.schema.ts',
      lines: ['z.object({ code: z.string().min(1),', '  signed: z.iso.date(), wardId: z.uuid() })'],
      result: 'valid',
    },
    {
      layer: 4,
      prompt: 'cat record.api.ts',
      lines: ['api.get(\'/records\', { params: { filters,', '  operator: \'isBetween\', page } })'],
      result: '200',
    },
  ],
}
