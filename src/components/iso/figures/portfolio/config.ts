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
      lines: ['<Card className=\'border-dashed\'>', '  <CardHeader>', '    <CardTitle>{title}</CardTitle>', '  </CardHeader>', '</Card>'],
      result: 'rendered',
    },
    {
      layer: 1,
      prompt: 'cat content/blog/hello.mdx',
      lines: ['---', 'title: Hello', '---', '<Callout>Written in MDX</Callout>'],
      result: 'compiled',
    },
    {
      layer: 2,
      prompt: 'cat app/sitemap.ts',
      lines: ['export default function sitemap () {', '  return pages.map(page => ({', '    url: absolute(page.slug),', '    lastModified: page.date,', '  }))', '}'],
      result: 'built',
    },
    {
      layer: 3,
      prompt: 'shadcn build',
      lines: ['{', '  "name": "text-reveal",', '  "type": "registry:ui",', '  "files": ["text-reveal.tsx"]', '}'],
      result: 'registry built',
    },
    {
      layer: 4,
      prompt: 'vercel --prod',
      lines: ['› pnpm install', '› next build', '› prerender pages', '› upload output'],
      result: 'deployed',
    },
  ],
}
