import type { StackConfig } from '@/components/iso/stack/types'

// E-Office: a document moved from draft to effective, through the frontend stack. Tech from the frontend's
// package.json, src layout, Dockerfile, nginx.conf and Jenkinsfile; the REST API is a separate backend.
// Snippets are representative with generic identifiers, not the client's code, routes or endpoints.
export const eofficeConfig: StackConfig = {
  id: 'eoffice',
  fig: 3,
  title: 'E-Office stack',
  hint: 'scroll to route a document to sign-off',
  skin: 'editor',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'shadcn/ui', 'Tailwind CSS 4'], icon: 'react.svg' },
    { id: 'routes', label: 'routes', tech: ['Vite 8', 'React Router 7', 'nuqs'], icon: 'vite.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'TanStack Table', 'Redux Toolkit'], icon: 'tanstack.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod 4'], icon: 'zod.svg' },
    { id: 'api', label: 'api', tech: ['Axios', 'cookie session', 'refresh queue'] },
  ],
  side: [
    { id: 'workflow', label: 'workflow', tech: ['status flow', 'role guard', 'Sonner'] },
    { id: 'preview', label: 'preview', tech: ['react-pdf', 'file upload'] },
    { id: 'delivery', label: 'delivery', tech: ['Docker', 'Nginx', 'Jenkins'], icon: 'docker.svg' },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat document-status-menu.tsx',
      lines: ['<DropdownMenuItem onSelect={() =>', '  askConfirm(doc.id, \'effective\')} />'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat router.tsx',
      lines: ['{ path: \'documents/:id\', element:', '  <Guard roles={signers}><Doc /></Guard> }'],
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
      lines: ['z.object({ title: z.string().min(1),', '  status: z.enum([\'draft\', \'effective\']) })'],
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
