'use client'

import { Dialog } from 'radix-ui'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { playSound } from '@/lib/sound'

const GO_TO: Record<string, { href: string; label: string }> = {
  h: { href: '/', label: 'Home' },
  b: { href: '/blog', label: 'Blog' },
  u: { href: '/uses', label: 'Uses' },
}

const TAPS_TO_BURST = 5
const TAP_WINDOW_MS = 1500

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']

function isTyping (target: EventTarget | null) {
  const el = target as HTMLElement | null
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
}

// Make the hero voxels fly apart and snap back.
function burstVoxels () {
  const svg = document.querySelector('.voxel')?.closest('svg')
  if (!svg) return
  svg.classList.remove('voxel-burst')
  svg.getBoundingClientRect() // restart the animation if it is already running
  svg.classList.add('voxel-burst')
  playSound('open')
  window.setTimeout(() => svg.classList.remove('voxel-burst'), 2200)
}

// Terminal-style shortcuts: "g" then a letter to jump, "?" for help, plus a Konami easter egg.
export function KeyboardShortcuts () {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let pendingG = false
    let gTimer = 0
    let konami: string[] = []

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return
      const key = e.key.toLowerCase()

      konami = [...konami, key].slice(-KONAMI.length)
      if (konami.join() === KONAMI.join()) {
        konami = []
        burstVoxels()
        return
      }

      if (e.key === '?') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (pendingG && GO_TO[key]) {
        pendingG = false
        router.push(GO_TO[key].href)
        return
      }
      if (key === 'g') {
        pendingG = true
        window.clearTimeout(gTimer)
        gTimer = window.setTimeout(() => { pendingG = false }, 1000)
      }
    }

    // Touch screens have no arrow keys: tapping the TD hero 5 times quickly does the same.
    let taps: number[] = []
    const onTap = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.('#background')) return
      const now = Date.now()
      taps = [...taps.filter((t) => now - t < TAP_WINDOW_MS), now]
      if (taps.length >= TAPS_TO_BURST) {
        taps = []
        burstVoxels()
      }
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerup', onTap)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerup', onTap)
      window.clearTimeout(gTimer)
    }
  }, [router])

  const rows = [
    ...Object.entries(GO_TO).map(([k, v]) => ({ keys: ['g', k], label: `Go to ${v.label}` })),
    { keys: ['⌘', 'K'], label: 'Search & commands' },
    { keys: ['?'], label: 'Show shortcuts' },
    { keys: ['↑↑↓↓←→←→', 'B', 'A'], label: '???' },
    { keys: ['TD ×5'], label: '??? (touch)' },
  ]

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0' />
        <Dialog.Content className='fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 border bg-background font-ibm shadow-2xl outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'>
          <div className='border-b px-4 py-2 text-xs text-muted-foreground'>
            <Dialog.Title className='inline'># keyboard shortcuts</Dialog.Title>
          </div>
          <Dialog.Description className='sr-only'>Keyboard shortcuts available on this site</Dialog.Description>
          <ul className='divide-y divide-dashed'>
            {rows.map((row) => (
              <li key={row.label} className='flex items-center justify-between gap-4 px-4 py-2.5 text-sm'>
                <span className='text-muted-foreground'>{row.label}</span>
                <span className='flex gap-1'>
                  {row.keys.map((k) => <kbd key={k} className='min-w-6 border px-1.5 py-0.5 text-center text-xs'>{k}</kbd>)}
                </span>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
