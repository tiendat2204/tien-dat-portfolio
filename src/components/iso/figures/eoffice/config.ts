import type { StackConfig } from '@/components/iso/stack/types'

// E-Office: a document status changed from draft to active, through the frontend stack. Tech from the frontend's
// package.json and src layout; the REST API is a separate backend.
// Snippets are representative with generic identifiers, not the client's code, routes or endpoints.
export const eofficeConfig: StackConfig = {
  id: 'eoffice',
  fig: 3,
  title: 'E-Office stack',
  hint: 'scroll to change a document status',
  skin: 'editor',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'shadcn/ui', 'Tailwind CSS 4'], icon: 'react.svg' },
    { id: 'routes', label: 'routes', tech: ['Vite 8', 'React Router 7', 'nuqs'], icon: 'vite.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'TanStack Table', 'Redux Toolkit'], icon: 'tanstack.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod 4'], icon: 'zod.svg' },
    { id: 'api', label: 'api', tech: ['Axios', 'cookie token', 'refresh queue'] },
  ],
  side: [
    { id: 'workflow', label: 'workflow', tech: ['status flow', 'role guard'] },
    { id: 'preview', label: 'preview', tech: ['react-pdf', 'file upload'] },
    { id: 'notify', label: 'notify', tech: ['Sonner', 'toast feedback'] },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat document-status-menu.tsx',
      lines: ['<DropdownMenuItem onSelect={() =>', '  askConfirm(doc.id, \'active\')} />'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat router.tsx',
      lines: ['{ path: \'documents/:id\', element:', '  <Guard roles={staff}><Doc /></Guard> }'],
      result: 'guarded',
    },
    {
      layer: 2,
      prompt: 'cat use-document-status.ts',
      lines: ['useMutation({ mutationFn: docApi.setStatus,', '  onSuccess: () => qc.invalidateQueries() })'],
      result: 'invalidated',
    },
    {
      layer: 3,
      prompt: 'cat document.schema.ts',
      lines: ['z.object({ title: z.string().min(1),', '  status: z.enum([\'draft\', \'active\']) })'],
      result: 'valid',
    },
    {
      layer: 4,
      prompt: 'cat document.api.ts',
      lines: ['api.patch(docPath(id), { status })', '  .then(res => res.data)'],
      result: '200',
    },
  ],
}
