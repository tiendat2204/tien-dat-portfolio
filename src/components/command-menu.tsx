'use client'

import { Command } from 'cmdk'
import {
  ArrowRightIcon,
  CopyIcon,
  CpuIcon,
  DownloadIcon,
  FileTextIcon,
  HashIcon,
  MoonIcon,
  SearchIcon,
} from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useLenis } from 'lenis/react'
import { useEffect, useState } from 'react'

import { DATA } from '@/data/resume'
import { playSound } from '@/lib/sound'

export const OPEN_COMMAND_MENU = 'open-command-menu'

export function openCommandMenu () {
  window.dispatchEvent(new Event(OPEN_COMMAND_MENU))
}

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'insights', label: 'Insights' },
  { id: 'work', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'awards', label: 'Awards' },
  { id: 'blog', label: 'Recent articles' },
]

const itemClass =
  'flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground aria-selected:bg-muted aria-selected:text-foreground'

export function CommandMenu ({ posts }: { posts: { slug: string; title: string }[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const lenis = useLenis()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_COMMAND_MENU, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_COMMAND_MENU, onOpen)
    }
  }, [])

  // Pause the page's smooth scroll while open so wheel/touch scroll the list, not the page.
  useEffect(() => {
    if (!open) return
    playSound('open')
    lenis?.stop()
    return () => lenis?.start()
  }, [open, lenis])

  const run = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0' />
        <Dialog.Content
          className='fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 border bg-background font-ibm shadow-2xl outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
        >
          <Dialog.Title className='sr-only'>Command menu</Dialog.Title>
          <Dialog.Description className='sr-only'>Search sections, articles and actions</Dialog.Description>
          <Command loop>
            <div className='flex items-center gap-2 border-b px-3'>
              <SearchIcon className='size-4 shrink-0 text-muted-foreground' />
              <Command.Input
                autoFocus
                placeholder='Type a command or search…'
                className='h-12 w-full border-0 bg-transparent text-sm shadow-none outline-none ring-0 placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              />
              <kbd className='hidden shrink-0 border px-1.5 py-0.5 text-[11px] text-muted-foreground sm:block'>esc</kbd>
            </div>
            <Command.List data-lenis-prevent className='max-h-[60vh] overflow-y-auto overscroll-contain py-2'>
              <Command.Empty className='px-3 py-6 text-center text-sm text-muted-foreground'>
                No results. Try “blog” or “resume”.
              </Command.Empty>

              <Command.Group heading='# sections' className='[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground/70'>
                {SECTIONS.map((s) => (
                  <Command.Item
                    key={s.id}
                    value={`section ${s.label}`}
                    onSelect={() => run(() => router.push(`/#${s.id}`))}
                    className={itemClass}
                  >
                    <HashIcon className='size-4' />
                    {s.label}
                  </Command.Item>
                ))}
              </Command.Group>

              {posts.length > 0 && (
                <Command.Group heading='# blog' className='[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground/70'>
                  {posts.map((p) => (
                    <Command.Item
                      key={p.slug}
                      value={`blog ${p.title}`}
                      onSelect={() => run(() => router.push(`/blog/${p.slug}`))}
                      className={itemClass}
                    >
                      <FileTextIcon className='size-4 shrink-0' />
                      <span className='truncate'>{p.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group heading='# actions' className='[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground/70'>
                <Command.Item value='uses ai workflow tools setup claude codex' onSelect={() => run(() => router.push('/uses'))} className={itemClass}>
                  <CpuIcon className='size-4' />
                  Uses: how I work with AI
                </Command.Item>
                <Command.Item value='download resume cv pdf' onSelect={() => run(() => window.open('/TrieuTienDatCV.pdf', '_blank'))} className={itemClass}>
                  <DownloadIcon className='size-4' />
                  Download resume
                </Command.Item>
                <Command.Item value='copy email contact' onSelect={() => run(() => navigator.clipboard?.writeText(DATA.contact.email))} className={itemClass}>
                  <CopyIcon className='size-4' />
                  Copy email
                  <span className='ml-auto truncate text-xs text-muted-foreground/70'>{DATA.contact.email}</span>
                </Command.Item>
                <Command.Item value='toggle theme dark light mode' onSelect={() => run(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'))} className={itemClass}>
                  <MoonIcon className='size-4' />
                  Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'} theme
                </Command.Item>
              </Command.Group>

              <Command.Group heading='# connect' className='[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground/70'>
                {Object.values(DATA.contact.social).map((s) => (
                  <Command.Item
                    key={s.name}
                    value={`social ${s.name}`}
                    onSelect={() => run(() => window.open(s.url, '_blank', 'noopener'))}
                    className={itemClass}
                  >
                    <s.icon className='size-4' />
                    {s.name}
                    <ArrowRightIcon className='ml-auto size-3.5 -rotate-45 opacity-60' />
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
            <div className='flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground'>
              <span><kbd className='border px-1'>↑</kbd> <kbd className='border px-1'>↓</kbd> navigate</span>
              <span><kbd className='border px-1'>↵</kbd> select</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
