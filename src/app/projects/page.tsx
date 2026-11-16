import Image from 'next/image'

import { FigureSlot } from '@/components/iso/figure-slot'
import { ProjectsScroller } from '@/components/projects/projects-scroller'
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
    <main className='mx-auto w-full max-w-3xl px-4 py-24'>
      <h1 className='font-doto text-4xl font-extrabold'>projects</h1>
      <ProjectsScroller>
        {sections.map(section => (
          <section key={section.id} id={section.id} className='mt-16 scroll-mt-24'>
            <p className='text-xs tabular-nums text-muted-foreground'>{String(section.index).padStart(2, '0')}</p>
            <h2 className='font-doto text-2xl font-extrabold'>{section.title}</h2>
            <p className='text-sm text-muted-foreground'>{[section.role, section.company, section.period].filter(Boolean).join(' · ')}</p>
            <FigureSlot figureId={section.figureId} />
            <ul className='mt-4 list-disc space-y-1 pl-5 text-sm'>
              {section.summary.map(line => <li key={line}>{line}</li>)}
            </ul>
            <ul className='mt-4 flex flex-wrap gap-2'>
              {section.technologies.map(tech => (
                <li key={tech.name} title={tech.name} className='text-xs'>
                  {tech.icon == null && tech.name}
                  {tech.icon != null && <Image src={`/icons/${tech.icon}`} alt={tech.name} width={24} height={24} className={tech.iconDark ? 'size-6 dark:hidden' : 'size-6'} />}
                  {tech.iconDark && <Image src={`/icons/${tech.iconDark}`} alt={tech.name} width={24} height={24} className='hidden size-6 dark:block' />}
                </li>
              ))}
            </ul>
            <ul className='mt-4 flex flex-wrap gap-4 text-sm'>
              {section.links.map(link => (
                <li key={link.href}>
                  <a href={link.href} target='_blank' rel='noreferrer' className='underline underline-offset-4'>{link.type}</a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </ProjectsScroller>
    </main>
  )
}
