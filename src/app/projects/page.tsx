import Image from 'next/image'
import { Fragment } from 'react'

import { Icon } from '@/components/Icon'
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

// Techs without a logo file show a square monogram tile (name in the tooltip), the same 24px box as the logos.
const monogram = (name: string) => {
  const words = name.split(/[\s_-]+/).filter(Boolean)
  return (words.length > 1 ? words.map(word => word[0]).join('').slice(0, 2) : name.slice(0, 2)).toLowerCase()
}

export default function ProjectsPage () {
  const sections = buildProjectSections()
  return (
    <main className='mx-auto w-full max-w-3xl border-x px-4 py-24 lg:max-w-7xl'>
      <h1 className='font-doto text-4xl font-extrabold'>projects</h1>
      <ProjectsScroller>
        {sections.map(section => (
          <Fragment key={section.id}>
            <div aria-hidden='true' className='screen-line-before relative -mx-4 mt-12 h-px'>
              <Icon className='absolute -top-3 -left-3 z-20 size-6 text-black dark:text-white' />
              <Icon className='absolute -top-3 -right-3 z-20 size-6 text-black dark:text-white' />
            </div>
            <section id={section.id} className='dg-section mt-12 grid scroll-mt-24 gap-6 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12'>
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
                      {tech.icon == null && <span className='grid size-6 place-items-center border font-ibm text-[9px] leading-none'>{monogram(tech.name)}</span>}
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
          </Fragment>
        ))}
      </ProjectsScroller>
    </main>
  )
}
