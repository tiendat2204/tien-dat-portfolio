import type { StackConfig } from '@/components/iso/stack/types'

// BetaTruyen: a reader's comment on a ranked story thread, through the forum's Next.js frontend. Tech from the CV and
// the frontend's README and package.json; the Django REST API is consumed (JWT auth integration), while its database,
// cache and queue are the backend's and are not drawn. Snippets are representative with generic identifiers.
export const betatruyenConfig: StackConfig = {
  id: 'betatruyen',
  fig: 8,
  title: 'BetaTruyen stack',
  hint: 'scroll to read, comment and rank',
  skin: 'forum',
  layers: [
    { id: 'ui', label: 'ui', tech: ['Next.js SSR', 'shadcn/ui', 'Tailwind CSS'], icon: 'nextjs.svg' },
    { id: 'hooks', label: 'hooks', tech: ['custom hooks', 'shared components'], icon: 'react.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'Axios'], icon: 'tanstack.svg' },
    { id: 'auth', label: 'auth', tech: ['JWT', 'js-cookie'] },
    { id: 'api', label: 'api', tech: ['Django REST Framework'], icon: 'django.svg' },
  ],
  side: [
    { id: 'ci', label: 'ci', tech: ['GitHub Actions', 'ESLint Standard', 'PNPM'], icon: 'github.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod'], icon: 'zod.svg' },
    { id: 'state', label: 'state', tech: ['Redux Toolkit'], icon: 'redux.svg' },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat story-row.tsx',
      lines: ['<Card><CardTitle>{story.title}</CardTitle>', '  <RankBadge value={story.rank} /></Card>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat use-load-more.ts',
      lines: ['const { ref, inView } = useInView()', 'useEffect(() => { if (inView) next() })'],
      result: 'ready',
    },
    {
      layer: 2,
      prompt: 'cat use-add-comment.ts',
      lines: ['useMutation({ mutationFn: addComment,', '  onSuccess: () => qc.invalidateQueries() })'],
      result: 'invalidated',
    },
    {
      layer: 3,
      prompt: 'cat session.ts',
      lines: ['Cookies.set(\'access\', data.access,', '  { secure: true, sameSite: \'lax\' })'],
      result: 'signed in',
    },
    {
      layer: 4,
      prompt: 'cat stories.api.ts',
      lines: ['api.get(\'/stories/\', { params:', '  { ordering: \'-rating\', page } })'],
      result: '200',
    },
  ],
}
