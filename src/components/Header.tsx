'use client'

import React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { DATA } from '@/data/resume'
import Link from 'next/link'
import Image from 'next/image'
import { DownloadIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useScroll } from '@/hooks/use-scroll'
import { MenuToggleIcon } from './ui/menu-toggle-icon'

export function Header () {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(10)

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 screen-line-before   mx-auto w-full max-w-5xl border-b border-transparent transition-all ease-out',
        {
          'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg shadow':
            scrolled && !open,
          'bg-background/90': open,
        }
      )}
    >
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
        </div>

        {/* Right Side - Desktop */}
        <div className='hidden md:flex items-center gap-2'>
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
          <Separator orientation='vertical' className='h-6' />
          {Object.entries(DATA.contact.social)
            .filter(([_, social]) => social.navbar)
            .map(([name, social]) => (
              <Link
                key={name}
                href={social.url}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-10'
                )}
              >
                {social.icon && (
                  <Image
                    src={`/icons/${social.icon}`}
                    alt={social.icon}
                    width={20}
                    height={20}
                    className='w-5 h-5'
                  />
                )}
              </Link>
            ))}
          <Separator orientation='vertical' className='h-6' />
          <ModeToggle />
        </div>

        {/* Mobile Menu Button */}
        <Button
          size='icon'
          variant='outline'
          onClick={() => setOpen(!open)}
          className='md:hidden'
        >
          <MenuToggleIcon open={open} className='size-5' duration={300} />
        </Button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
          open ? 'block' : 'hidden'
        )}
      >
        <div
          data-slot={open ? 'open' : 'closed'}
          className={cn(
            'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
            'flex h-full w-full flex-col justify-between gap-y-4 p-4'
          )}
        >
          {/* Navigation Links */}
          <div className='grid gap-y-2'>
            {DATA.navbar.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={buttonVariants({
                  variant: 'ghost',
                  className: 'justify-start',
                })}
              >
                <item.icon className='size-4 mr-2' />
                {item.label}
              </Link>
            ))}
            <Separator className='my-2' />
            <Link
              href='/TrieuTienDatCV.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className={buttonVariants({
                variant: 'ghost',
                className: 'justify-start',
              })}
              download
            >
              <DownloadIcon className='size-4 mr-2' />
              Download Resume
            </Link>
          </div>

          {/* Social Links & Theme Toggle */}
          <div className='flex flex-col gap-2'>
            <div className='grid grid-cols-4 gap-2'>
              {Object.entries(DATA.contact.social)
                .filter(([_, social]) => social.navbar)
                .map(([name, social]) => (
                  <Link
                    key={name}
                    href={social.url}
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'icon' }),
                      'size-12'
                    )}
                  >
                    {social.icon && (
                      <Image
                        src={`/icons/${social.icon}`}
                        alt={social.icon}
                        width={20}
                        height={20}
                        className='w-5 h-5'
                      />
                    )}
                  </Link>
                ))}
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
