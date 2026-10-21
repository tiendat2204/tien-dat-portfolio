import { Suspense } from 'react'
import { Icon } from '@/components/Icon'
import { Icons } from '@/components/icons'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BackgroundHero } from '@/components/landing/background-hero'
import { Back } from '@/app/blog/back'
import { getAllComponents } from '@/data/blog'
import { BLUR_FADE_DELAY, SITE_INFO } from '@/data/config'
import { SEO_PROFILE } from '@/data/seo'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { ComponentList } from './_components/component-list'

export const metadata = buildPageMetadata({
  siteUrl: SITE_INFO.url,
  siteName: SEO_PROFILE.name,
  path: '/components',
  title: 'Components',
  description: 'Open-source React components by Tien Dat, installable with the shadcn CLI.',
})

export default function ComponentsPage () {
  const components = getAllComponents()

  return (
    <main className='flex flex-col mx-auto w-full max-w-3xl'>
      <section id='background' className='relative screen-line-before border-x'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <BackgroundHero />
      </section>

      <section id='components-header' className='relative screen-line-before screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='flex items-center justify-between border-b'>
          <Suspense>
            <div className='px-4'>
              <Back href='/' label='Home' />
            </div>
          </Suspense>
          <div className='size-6 mr-4'>
            <Icons.Logo />
          </div>
        </div>
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h1 className='px-4 pt-4 text-3xl font-extrabold font-doto'>Components</h1>
          <p className='px-4 pt-2 pb-4 font-ibm text-sm text-muted-foreground'>
            Open-source React components. Each one installs with a single shadcn CLI command.
          </p>
        </BlurFade>
      </section>

      <section id='component-list' className='relative screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        {components.length > 0
          ? <ComponentList components={components} delay={BLUR_FADE_DELAY * 2} />
          : <p className='py-8 text-center text-muted-foreground'>No components yet.</p>}
      </section>

      <section className='relative screen-line-after border-x h-16 size-full bg-repeat bg-[length:30px_30px] bg-lines-pattern-light dark:bg-lines-pattern' />
    </main>
  )
}
