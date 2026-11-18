import Image from 'next/image'

import { Reveal } from '@/components/projects/reveal'
import { DIAGRAM_CONFIGS } from '@/components/projects/diagram-configs'
import { StackDiagram } from '@/components/projects/stack-diagram'
import { SITE_INFO } from '@/data/config'
import { buildProjectSections } from '@/data/projects-page'
import { SEO_PROFILE } from '@/data/seo'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata = buildPageMetadata({
  siteUrl: SITE_INFO.url,
  siteName: SEO_PROFILE.name,
  path: '/projects',
  title: 'Projects',
  description: 'Selected projects by Tien Dat: what each one is, the stack behind it and where to see it live.',
})

export default function ProjectsPage () {
  const sections = buildProjectSections()
  return (
    <main className='mx-auto w-full max-w-3xl px-4 py-24 lg:max-w-6xl'>
      <h1 className='font-doto text-4xl font-extrabold'>projects</h1>
      <p className='mt-2 text-sm text-muted-foreground'>Work I have shipped, each with the stack behind it.</p>
      <div className='mt-10 grid border-l border-t border-border md:grid-cols-2'>
        {sections.map(section => (
          <Reveal key={section.id} id={section.id} className='flex scroll-mt-24 flex-col gap-4 border-b border-r border-border p-5 md:p-6'>
            {section.figureId && (
              <div className='rounded-lg border border-border bg-card/40 bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:14px_14px] p-3'>
                <StackDiagram config={DIAGRAM_CONFIGS[section.figureId]} />
              </div>
            )}
            <div className='flex min-h-0 flex-1 flex-col gap-2'>
              <p className='text-xs text-muted-foreground'>
                <span className='tabular-nums'>{String(section.index).padStart(2, '0')}</span>
                {' · '}
                {[section.role, section.company, section.period].filter(Boolean).join(' · ')}
              </p>
              <h2 className='font-doto text-3xl font-extrabold leading-tight'>{section.title}</h2>
              <p className='line-clamp-3 text-sm text-muted-foreground'>{section.summary[0]}</p>
            </div>
            <ul className='flex flex-wrap items-center gap-3'>
              {section.technologies.map(tech => (
                <li key={tech.name} title={tech.name} className='text-xs'>
                  {tech.icon == null && tech.name}
                  {tech.icon != null && <Image src={`/icons/${tech.icon}`} alt={tech.name} width={20} height={20} className={tech.iconDark ? 'size-5 dark:hidden' : 'size-5'} />}
                  {tech.iconDark && <Image src={`/icons/${tech.iconDark}`} alt={tech.name} width={20} height={20} className='hidden size-5 dark:block' />}
                </li>
              ))}
            </ul>
            <ul className='flex flex-wrap gap-4 text-sm'>
              {section.links.map(link => (
                <li key={link.href}>
                  <a href={link.href} target='_blank' rel='noreferrer' className='underline underline-offset-4'>{link.type} →</a>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </main>
  )
}
