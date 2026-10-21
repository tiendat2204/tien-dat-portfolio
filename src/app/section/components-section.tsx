import Link from 'next/link'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Icon } from '@/components/Icon'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ComponentList } from '@/app/components/_components/component-list'
import { getAllComponents } from '@/data/blog'
import { BLUR_FADE_DELAY } from '@/data/config'

export default function ComponentsSection () {
  const components = getAllComponents()

  if (components.length === 0) return null

  return (
    <section id='components' className='relative screen-line-after border-x font-ibm'>
      <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      <div className='border-b'>
        <div className='flex items-center justify-between'>
          <BlurFade delay={BLUR_FADE_DELAY * 13} offset={0}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>Components</h2>
          </BlurFade>
          <Link
            href='/components'
            className='flex items-center px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
          >
            View all
            <ArrowRightIcon className='ml-1 h-4 w-4' />
          </Link>
        </div>
      </div>

      <ComponentList components={components} delay={BLUR_FADE_DELAY * 14} />
    </section>
  )
}
