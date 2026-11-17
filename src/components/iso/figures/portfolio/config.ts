import type { StackConfig } from '@/components/iso/stack/types'

// Tien Dat Portfolio: this site. Tech from the CV and package.json; snippets are representative, not copied.
export const portfolioConfig: StackConfig = {
  id: 'portfolio',
  fig: 1,
  title: 'Portfolio stack',
  hint: 'scroll to ship a page',
  layers: [
    { id: 'ui', label: 'ui', tech: ['shadcn/ui', 'Tailwind CSS'], icon: 'shadcn.svg' },
    { id: 'content', label: 'content', tech: ['MDX', 'Fumadocs'] },
    { id: 'framework', label: 'app', tech: ['Next.js'], icon: 'nextjs.svg' },
    { id: 'registry', label: 'registry', tech: ['shadcn CLI'] },
    { id: 'deploy', label: 'deploy', tech: ['Vercel'], icon: 'vercel.svg' },
  ],
  side: [
    { id: 'motion', label: 'motion', tech: ['Motion', 'GSAP', 'Lenis'], icon: 'motion.svg' },
  ],
  steps: [
    {
      layer: 0,
      prompt: 'cat components/post-card.tsx',
      lines: ['<Card className=\'border-dashed\'>', '  <CardTitle>{title}</CardTitle></Card>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat content/blog/hello.mdx',
      lines: ['# Hello', '<Callout>Written in MDX</Callout>'],
      result: 'compiled',
    },
    {
      layer: 2,
      prompt: 'cat app/sitemap.ts',
      lines: ['export default () =>', '  pages.map(p => ({ url: p.slug }))'],
      result: 'built',
    },
    {
      layer: 3,
      prompt: 'shadcn build',
      lines: ['{ "name": "reveal", "type": "registry:ui",', '  "files": [{ "path": "reveal.tsx" }] }'],
      result: 'registry built',
    },
    {
      layer: 4,
      prompt: 'vercel --prod',
      lines: ['› next build', '› upload output'],
      result: 'deployed',
    },
  ],
}
