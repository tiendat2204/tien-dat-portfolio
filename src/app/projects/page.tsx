import Image from 'next/image'
import { Fragment, Suspense } from 'react'

import { Back } from '@/app/blog/back'
import { Icons } from '@/components/icons'

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

const TAB_LABEL: Record<string, string> = {
  'tien-dat-portfolio': 'Portfolio',
  agrita: 'AgriTA',
  eoffice: 'E-Office',
  'digital-library': 'Library',
  'agrita-mobile': 'AgriTA Mobile',
  'tangni-web': 'TangNi',
  'xn2-admin': 'XN2',
  betatruyen: 'BetaTruyen',
}

const KIND: Record<string, string> = {
  'tien-dat-portfolio': 'site',
  agrita: 'saas',
  eoffice: 'workflow',
  'digital-library': 'library',
  'agrita-mobile': 'mobile',
  'tangni-web': 'admin',
  'xn2-admin': 'admin',
  betatruyen: 'forum',
}

// Techs without a logo file show a square monogram tile (name in the tooltip), the same 24px box as the logos.
const monogram = (name: string) => {
  const words = name.split(/[\s_-]+/).filter(Boolean)
  return (words.length > 1 ? words.map(word => word[0]).join('').slice(0, 2) : name.slice(0, 2)).toLowerCase()
}

export default function ProjectsPage () {
  const sections = buildProjectSections()
  return (
    <main className='mx-auto w-full max-w-3xl border-x pb-24 lg:max-w-[1360px] 2xl:max-w-[1600px]'>
      <section id='projects-header' className='relative screen-line-after'>
        <Icon className='absolute -bottom-3 -left-3 z-20 size-6 text-black dark:text-white' />
        <Icon className='absolute -right-3 -bottom-3 z-20 size-6 text-black dark:text-white' />
        <div className='flex items-center justify-between border-b'>
          <div className='px-4'>
            <Suspense>
              <Back />
            </Suspense>
          </div>
          <div className='mr-4 size-6'>
            <Icons.Logo />
          </div>
        </div>
        <div className='px-4 pt-10 pb-6'>
          <p className='font-ibm text-sm text-muted-foreground'>Selected work</p>
          <h1 className='font-doto text-5xl font-extrabold leading-tight md:text-6xl'>projects</h1>
          <p className='mt-2 max-w-2xl font-ibm text-sm text-muted-foreground'>What each project is and the stack behind it, one scroll at a time.</p>
        </div>
      </section>
      <nav aria-label='Projects' className='relative overflow-hidden screen-line-after'>
        <ol className='-mr-px grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8'>
          {sections.map(section => (
            <li key={section.id} className='border-r border-b xl:border-b-0'>
              <a href={`#${section.id}`} className='group block h-full px-4 py-3 transition-colors hover:bg-foreground hover:text-background'>
                <span className='flex items-baseline justify-between'>
                  <span className='font-doto text-2xl font-extrabold leading-none'>{String(section.index).padStart(2, '0')}</span>
                  <span className='font-ibm text-[10px] uppercase tracking-wide text-muted-foreground group-hover:text-background/70'>{KIND[section.id]}</span>
                </span>
                <span className='mt-3 block font-ibm text-xs uppercase tracking-wide'>{TAB_LABEL[section.id] ?? section.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <ProjectsScroller>
        {sections.map(section => (
          <Fragment key={section.id}>
            <div aria-hidden='true' className='screen-line-before relative h-px'>
              <Icon className='absolute -top-3 -left-3 z-20 size-6 text-black dark:text-white' />
              <Icon className='absolute -top-3 -right-3 z-20 size-6 text-black dark:text-white' />
              <Icon className='absolute -top-3 left-[41.667%] z-20 hidden size-6 -translate-x-1/2 text-black lg:block dark:text-white' />
            </div>
            <section id={section.id} className='dg-section grid scroll-mt-24 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]'>
              <div className='flex flex-col justify-center px-4 py-10 lg:max-h-[calc(100svh-6rem)] lg:px-8'>
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
                      {tech.icon != null && <Image src={`/icons/${tech.icon}`} alt={tech.name} width={24} height={24} className={tech.iconDark ? 'size-6 dark:hidden lg:[@media(max-height:760px)]:size-5' : `size-6 lg:[@media(max-height:760px)]:size-5${tech.icon === 'skills/zustand.svg' ? ' dark:invert' : ''}`} />}
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
              <div className='flex min-w-0 items-center px-4 pb-10 lg:border-l lg:px-8 lg:py-10'>
                <DiagramSlot figureId={section.figureId} />
              </div>
            </section>
          </Fragment>
        ))}
      </ProjectsScroller>
      <div aria-hidden='true' className='screen-line-before relative h-px'>
        <Icon className='absolute -top-3 -left-3 z-20 size-6 text-black dark:text-white' />
        <Icon className='absolute -top-3 -right-3 z-20 size-6 text-black dark:text-white' />
      </div>
    </main>
  )
}
