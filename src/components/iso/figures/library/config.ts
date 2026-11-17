import type { StackConfig } from '@/components/iso/stack/types'

// Digital Library for a Pagoda: a book checked out through the web app's frontend stack. Tech from the app's
// package.json and README (Next.js 16 App Router); an external API it calls is a separate backend whose stack is
// not shown here. Snippets are representative with generic identifiers, not the project's code or routes.
export const libraryConfig: StackConfig = {
  id: 'library',
  fig: 4,
  title: 'Library stack',
  hint: 'scroll to check a book out',
  skin: 'web',
  layers: [
    { id: 'ui', label: 'ui', tech: ['React 19', 'shadcn/ui', 'Tailwind CSS'], icon: 'react.svg' },
    { id: 'app', label: 'app', tech: ['Next.js 16', 'App Router'], icon: 'nextjs.svg' },
    { id: 'data', label: 'data', tech: ['TanStack Query', 'TanStack Table', 'Axios'], icon: 'tanstack.svg' },
    { id: 'state', label: 'state', tech: ['Redux Toolkit', 'Zustand'], icon: 'redux.svg' },
    { id: 'forms', label: 'forms', tech: ['React Hook Form', 'Zod'], icon: 'zod.svg' },
  ],
  side: [
    { id: 'scan', label: 'scan', tech: ['zxing-wasm', 'ISBN lookup'] },
    { id: 'editor', label: 'editor', tech: ['Tiptap'] },
    { id: 'tests', label: 'tests', tech: ['Playwright'], icon: 'playwright.svg' },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat book-card.tsx',
      lines: ['<Card><CardTitle>{book.title}</CardTitle>', '  <Badge>{copy.callNumber}</Badge></Card>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat app/api/isbn/route.ts',
      lines: ['export async function GET (req: Request) {', '  return Response.json(await lookup(req)) }'],
      result: '200',
    },
    {
      layer: 2,
      prompt: 'cat use-books.ts',
      lines: ['useQuery({ queryKey: [\'books\', filters],', '  queryFn: () => bookApi.list(filters) })'],
      result: 'cached',
    },
    {
      layer: 3,
      prompt: 'cat session.slice.ts',
      lines: ['createSlice({ name: \'session\', initialState,', '  reducers: { signIn, signOut } })'],
      result: 'signed in',
    },
    {
      layer: 4,
      prompt: 'cat checkout.schema.ts',
      lines: ['z.object({ borrowDate: z.date(),', '  dueDate: z.date() }).refine(isOrdered)'],
      result: 'valid',
    },
  ],
}
