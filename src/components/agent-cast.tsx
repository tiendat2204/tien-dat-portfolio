'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { RUN_EVENT, STATUS_EVENT, storeOn, usePrefs, useTabHidden } from '@/components/agent-shared'
import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'

// The avatars draw on a canvas with a sizeable library behind them, so they load after the page, on their own.
const AgentDot = dynamic(() => import('@/registry/AgentDot/agent-dot').then((m) => m.AgentDot), { ssr: false })

// The same cast as real controls in "How I build": who each agent is, the build as text, and the switches.
export function AgentCast () {
  const { on, roomy, still } = usePrefs()
  const hidden = useTabHidden()
  const [open, setOpen] = useState<AgentId | null>(null)
  const [status, setStatus] = useState('')
  const [seen, setSeen] = useState(false)
  // The plush avatars are costly to animate: only the one under the pointer, or the open one, moves.
  const [near, setNear] = useState<AgentId | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const current = AGENTS.find((a) => a.id === open)

  // Each line of a running build is announced from here.
  useEffect(() => {
    const onStatus = (e: Event) => setStatus((e as CustomEvent<string>).detail)
    window.addEventListener(STATUS_EVENT, onStatus)
    return () => window.removeEventListener(STATUS_EVENT, onStatus)
  }, [])

  // The avatars only draw while this block is on screen.
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className='flex flex-col gap-3'>
      <p aria-live='polite' className='sr-only'>{status}</p>
      <div className='flex flex-wrap items-center gap-2'>
        {AGENTS.map(({ id, name, verb, avatar, color }, i) => (
          <button
            key={id}
            type='button'
            aria-expanded={open === id}
            aria-controls='agent-details'
            onClick={() => setOpen(open === id ? null : id)}
            onPointerEnter={() => setNear(id)}
            onPointerLeave={() => setNear(null)}
            onFocus={() => setNear(id)}
            onBlur={() => setNear(null)}
            className={`flex items-center gap-2.5 border px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50 ${open === id ? 'border-foreground/60 bg-muted/50' : ''}`}
          >
            {/* The box keeps the avatar's place while it loads. */}
            <span className='block size-11 shrink-0'>
              {seen && <AgentDot type={avatar} color={color} size={44} seed={i / AGENTS.length} paused={still || hidden || !(open === id || near === id)} mood={open === id ? 'happy' : 'idle'} />}
            </span>
            <span className='text-left'>
              <span className='block font-medium'>{name}</span>
              <span className='block text-muted-foreground'>{verb}</span>
            </span>
          </button>
        ))}
        {!still && (
          <span className='ml-auto flex gap-3 text-xs text-muted-foreground'>
            <button type='button' className='transition-colors hover:text-foreground' onClick={() => window.dispatchEvent(new CustomEvent(RUN_EVENT, { detail: { section: 'how-i-build' } }))}>
              [▶ run build]
            </button>
            {roomy && (
              <button type='button' aria-pressed={on} className='transition-colors hover:text-foreground' onClick={() => storeOn(!on)}>
                [dock: {on ? 'on' : 'off'}]
              </button>
            )}
          </span>
        )}
      </div>

      <div id='agent-details'>
        {current && (
          <div className='border-l-2 py-1 pl-3 text-xs' style={{ borderColor: current.color }}>
            <p><span className='font-medium'>{current.name}.</span> {current.role}</p>
            <p className='mt-1 text-muted-foreground'>Runs on {current.runsOn}.</p>
            <ul className='mt-1 list-inside list-["–_"] text-muted-foreground'>
              {current.setup.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <Link href={current.href} className='mt-1 inline-block underline underline-offset-2 hover:text-foreground'>
              see the {current.runsOn} workflow →
            </Link>
          </div>
        )}
      </div>

      <ol className='grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2'>
        {BUILD_STEPS.map((step, i) => (
          <li key={step} className='flex gap-2'>
            <span className='text-foreground/60'>{String(i + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {roomy && on && !still && <p className='text-xs text-muted-foreground'>They wait in the corner of the window: poke one, or drag it onto a section to put it to work.</p>}
    </div>
  )
}
