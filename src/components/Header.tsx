'use client'

import React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { DATA } from '@/data/resume'
import Link from 'next/link'
import { ArrowRightIcon, DownloadIcon, SearchIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useScroll } from '@/hooks/use-scroll'
import { MenuToggleIcon } from './ui/menu-toggle-icon'
import BlurFadeText from './magicui/blur-fade-text'
import { BLUR_FADE_DELAY } from '@/data/config'
import { Icon } from './Icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useLenis } from 'lenis/react'
import { openCommandMenu } from './command-menu'
import { HeaderGreeting } from './time-greeting'

const MENU_SECTIONS = [
  { id: 'about', label: 'about' },
  { id: 'skills', label: 'skills' },
  { id: 'work', label: 'experience' },
  { id: 'projects', label: 'projects' },
  { id: 'awards', label: 'awards' },
  { id: 'blog', label: 'articles' },
]

export function Header () {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(10)
  const lenis = useLenis()
  React.useEffect(() => {
    // Lock the page (and its smooth scroll) behind the open menu.
    if (open) {
      document.body.style.overflow = 'hidden'
      lenis?.stop()
    } else {
      document.body.style.overflow = ''
      lenis?.start()
    }

    return () => {
      document.body.style.overflow = ''
      lenis?.start()
    }
  }, [open, lenis])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 screen-line-before   mx-auto w-full max-w-3xl border-b border-transparent transition-all ease-out',
        {
          'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg':
            scrolled && !open,
          'bg-background/90': open,
        }
      )}
    >
      {!scrolled && !open && (
        <>
          <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
          <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        </>
      )}

      <nav
        className={cn(
          'flex h-14 w-full items-center justify-between px-4 transition-all ease-out border-x',
          {
            'px-2': scrolled,
          }
        )}
      >
        {/* Logo or Brand - Desktop */}
        <div className='hidden md:flex items-center gap-4'>
          <Link
            key='home'
            href='/'
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'size-10 dark:hover:bg-transparent  hover:bg-transparent'
            )}
          >
            <BlurFadeText
              delay={BLUR_FADE_DELAY}
              className='text-4xl  font-extrabold  tracking-normal sm:text-4xl font-doto ml-8'
              yOffset={0}
              text='TTD'
            />

          </Link>
        </div>

        {/* Right Side - Desktop */}
        <div className='hidden md:flex items-center gap-2'>
          <HeaderGreeting className='min-[1440px]:hidden' />
          {DATA.navbar.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'size-10'
              )}
            >
              <item.icon className='size-4' />
            </Link>
          ))}
          <Link
            href='/TrieuTienDatCV.pdf'
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'size-10'
            )}
            download
          >
            <DownloadIcon className='size-4' />
          </Link>
          <Separator orientation='vertical' className='h-10' />
          {Object.entries(DATA.contact.social)
            .filter(([_, social]) => social.navbar)
            .map(([name, social]) => (
              <TooltipProvider key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={social.url}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'icon' }),
                        'size-10'
                      )}
                    >
                      {social.icon && (
                        <social.icon className='size-4' />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          <Separator orientation='vertical' className='h-10' />
          <button
            type='button'
            onClick={openCommandMenu}
            aria-label='Open command menu'
            className='flex h-8 items-center gap-2 border px-2 text-xs text-muted-foreground transition-colors hover:text-foreground'
          >
            <SearchIcon className='size-3.5' />
            <kbd className='font-ibm'>⌘K</kbd>
          </button>
          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <Link
          key='home'
          href='/'
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            'size-10 hover:bg-transparent md:hidden'
          )}
        >
          <BlurFadeText
            delay={BLUR_FADE_DELAY}
            className='text-3xl   font-extrabold  tracking-normal sm:text-4xl font-doto ml-8'
            yOffset={0}
            text='TTD'
          />

        </Link>
        <div className='flex items-center gap-4 justify-center md:hidden'>
          <HeaderGreeting />
          <ModeToggle />

          <Button
            size='icon'
            variant='outline'
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls='mobile-menu'
          >
            <MenuToggleIcon open={open} className='size-5' duration={300} />
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div
          id='mobile-menu'
          data-lenis-prevent
          className='fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto overscroll-contain bg-background px-4 md:hidden'
        >
          <div className='mx-auto flex min-h-full max-w-3xl flex-col border-x font-ibm'>
            <button
              type='button'
              onClick={() => { setOpen(false); openCommandMenu() }}
              className='menu-row m-4 flex items-center gap-2 border px-3 py-2.5 text-sm text-muted-foreground'
              style={{ '--i': 0 } as React.CSSProperties}
            >
              <SearchIcon className='size-4' />
              Search the site…
              <kbd className='ml-auto border px-1.5 text-[11px]'>⌘K</kbd>
            </button>

            <p className='px-4 pb-1 text-xs text-muted-foreground'># navigate</p>
            <ul className='border-y border-dashed'>
              {MENU_SECTIONS.map((item, i) => (
                <li key={item.id} className='menu-row border-b border-dashed last:border-b-0' style={{ '--i': i + 1 } as React.CSSProperties}>
                  <Link
                    href={`/#${item.id}`}
                    onClick={() => setOpen(false)}
                    className='group flex min-h-12 items-center gap-4 px-4 text-base active:bg-muted'
                  >
                    <span className='tabular-nums text-xs text-muted-foreground'>{String(i + 1).padStart(2, '0')}</span>
                    <span className='font-doto text-xl font-extrabold'>{item.label}</span>
                    <ArrowRightIcon className='ml-auto size-4 text-muted-foreground transition-transform group-active:translate-x-1' />
                  </Link>
                </li>
              ))}
            </ul>

            <p className='px-4 pt-5 pb-1 text-xs text-muted-foreground'># actions</p>
            <div className='grid grid-cols-3 gap-px border-y bg-border'>
              {DATA.navbar.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className='menu-row flex min-h-14 items-center gap-2 bg-background px-4 text-sm active:bg-muted'
                  style={{ '--i': MENU_SECTIONS.length + 1 + i } as React.CSSProperties}
                >
                  <item.icon className='size-4' />
                  {item.label}
                </Link>
              ))}
              <Link
                href='/TrieuTienDatCV.pdf'
                target='_blank'
                rel='noopener noreferrer'
                download
                className='menu-row flex min-h-14 items-center gap-2 bg-background px-4 text-sm active:bg-muted'
                style={{ '--i': MENU_SECTIONS.length + 2 } as React.CSSProperties}
              >
                <DownloadIcon className='size-4' />
                Resume
              </Link>
            </div>

            <p className='px-4 pt-5 pb-1 text-xs text-muted-foreground'># connect</p>
            <div className='grid grid-cols-4 gap-px border-y bg-border'>
              {Object.entries(DATA.contact.social)
                .filter(([, social]) => social.navbar)
                .map(([name, social], i) => (
                  <Link
                    key={name}
                    href={social.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='menu-row flex min-h-16 flex-col items-center justify-center gap-1.5 bg-background text-[11px] text-muted-foreground active:bg-muted'
                    style={{ '--i': MENU_SECTIONS.length + 3 + i } as React.CSSProperties}
                  >
                    {social.icon && <social.icon className='size-5 text-foreground' />}
                    {name}
                  </Link>
                ))}
            </div>

            <div className='mt-auto flex items-center justify-between border-t px-4 py-3'>
              <span className='text-sm'>
                <span className='text-muted-foreground'>~/</span>tiendat.work
                <span className='ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-foreground motion-safe:animate-pulse' />
              </span>
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
