'use client'

import { ArrowLeftIcon, NotebookIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { openCommandMenu } from '@/components/command-menu'

const ACTION_CLASS = 'flex min-h-12 items-center gap-2 bg-background px-4 text-sm transition-colors hover:bg-muted'

export function NotFoundTerminal () {
  const pathname = usePathname()

  return (
    <>
      <div className='px-4 py-4 text-sm leading-7'>
        <p>
          <span className='text-muted-foreground'>$</span> cd {pathname}
        </p>
        <p className='text-muted-foreground'>cd: no such file or directory: {pathname}</p>
        <p>
          <span className='text-muted-foreground'>$</span>
          <span className='ml-1 inline-block h-4 w-2 translate-y-0.5 bg-foreground motion-safe:animate-pulse' />
        </p>
      </div>

      <div className='grid grid-cols-1 gap-px border-t bg-border sm:grid-cols-3'>
        <Link href='/' className={ACTION_CLASS}>
          <ArrowLeftIcon className='size-4' />
          back home
        </Link>
        <Link href='/blog' className={ACTION_CLASS}>
          <NotebookIcon className='size-4' />
          read the blog
        </Link>
        <button type='button' onClick={openCommandMenu} className={ACTION_CLASS}>
          <SearchIcon className='size-4' />
          search the site
          <kbd className='ml-auto border px-1.5 text-[11px] text-muted-foreground'>⌘K</kbd>
        </button>
      </div>
    </>
  )
}
