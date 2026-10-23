import type { Metadata } from 'next'

import { Icon } from '@/components/Icon'
import { BackgroundHero } from '@/components/landing/background-hero'
import { NotFoundTerminal } from '@/components/not-found-terminal'

export const metadata: Metadata = {
  title: 'Not found',
}

export default function NotFound () {
  return (
    <main className='mx-auto flex w-full max-w-3xl flex-col'>
      <section className='relative screen-line-before border-x'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <BackgroundHero />
      </section>

      <section className='relative screen-line-before screen-line-after border-x font-ibm'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='flex items-baseline justify-between border-b pr-4'>
          <h1 className='px-4 font-doto text-2xl font-extrabold'>404</h1>
          <span className='text-xs text-muted-foreground'>fig.404 — page.not_found</span>
        </div>
        <NotFoundTerminal />
      </section>
    </main>
  )
}
