import Image from 'next/image'

import { DiagramSlot } from '@/components/projects/diagram/diagram-slot'
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
    <main className='mx-auto w-full max-w-3xl lg:max-w-7xl px-4 py-24'>
      <h1 className='font-doto text-4xl font-extrabold'>projects</h1>
      <ProjectsScroller>
        {sections.map(section => (
          <section key={section.id} id={section.id} className='dg-section mt-16 grid scroll-mt-24 gap-6 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12'>
            <div className='lg:flex lg:max-h-[calc(100svh-8rem)] lg:flex-col'>
              <p className='text-xs tabular-nums text-muted-foreground'>{String(section.index).padStart(2, '0')}</p>
              <h2 className='font-doto text-2xl font-extrabold'>{section.title}</h2>
              <p className='text-sm text-muted-foreground'>{[section.role, section.company, section.period].filter(Boolean).join(' · ')}</p>
              <ul className='mt-4 list-disc space-y-1 pl-5 text-sm lg:min-h-0 lg:overflow-hidden lg:pb-4 lg:[mask-image:linear-gradient(to_bottom,#000_calc(100%-1rem),transparent)] lg:[@media(max-height:760px)]:space-y-0.5 lg:[@media(max-height:760px)]:text-[13px] lg:[@media(max-height:760px)]:leading-snug'>
                {section.summary.map(line => <li key={line}>{line}</li>)}
              </ul>
              <ul className='mt-4 flex flex-wrap gap-2 lg:mt-0'>
                {section.technologies.map(tech => (
                  <li key={tech.name} title={tech.name} className='text-xs'>
                    {tech.icon == null && tech.name}
                    {tech.icon != null && <Image src={`/icons/${tech.icon}`} alt={tech.name} width={24} height={24} className={tech.iconDark ? 'size-6 dark:hidden lg:[@media(max-height:760px)]:size-5' : 'size-6 lg:[@media(max-height:760px)]:size-5'} />}
                    {tech.iconDark && <Image src={`/icons/${tech.iconDark}`} alt={tech.name} width={24} height={24} className='hidden size-6 dark:block lg:[@media(max-height:760px)]:size-5' />}
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
            </div>
            <div className='min-w-0'>
              <DiagramSlot figureId={section.figureId} />
            </div>
          </section>
        ))}
      </ProjectsScroller>
    </main>
  )
}
