'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { nextVisible, perimeterPoints, rowPoints, toLocalBox, type Box, type Point } from '@/lib/agent-cursors-plan'

/*
  The home page's agents at work. Each agent is one solid, breathing dot. To work on a block of the page the dot
  bursts into a swarm of small ones, they fly over and settle on the block, then pour back into a single dot.
  The swarm acts out one build of this site (BUILD_STEPS): ticket, plan, write, review, gates, ship. It plays once,
  on whatever section is on screen, and can be replayed. AgentCast is the same cast as real controls, and is what
  phones and reduced-motion visitors get.
*/

const DOT = 4
// How many small dots one agent bursts into.
const SWARM = 36
const STORAGE_KEY = 'agent-cursors'
const TOGGLE_EVENT = 'agent-swarm:toggle'
const RUN_EVENT = 'agent-swarm:run'
const OPEN_EVENT = 'agent-swarm:open'

function storedOn () {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function storeOn (on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // Storage can be blocked; the toggle still works for this page view.
  }
  window.dispatchEvent(new CustomEvent(TOGGLE_EVENT))
}

// The swarm needs room and motion: off on phones, under reduced motion, or when the visitor sent it home.
function useSwarm () {
  const [state, setState] = useState({ on: true, able: false })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia('(min-width: 640px)')
    const sync = () => setState({ on: storedOn(), able: !motion.matches && wide.matches })
    sync()
    motion.addEventListener('change', sync)
    wide.addEventListener('change', sync)
    window.addEventListener(TOGGLE_EVENT, sync)
    return () => {
      motion.removeEventListener('change', sync)
      wide.removeEventListener('change', sync)
      window.removeEventListener(TOGGLE_EVENT, sync)
    }
  }, [])

  return state
}

export function AgentSwarm () {
  const rootRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const { on, able } = useSwarm()
  const enabled = on && able

  useEffect(() => {
    const root = rootRef.current
    const hud = hudRef.current
    if (!enabled || !root || !hud) return

    const dots = (id: AgentId) => gsap.utils.toArray<HTMLElement>(`[data-dot='${id}']`, root)
    const anchor = (id: AgentId) => root.querySelector<HTMLElement>(`[data-anchor='${id}']`)!
    const everything = () => [...root.querySelectorAll('[data-dot], [data-anchor], [data-part="orb"]'), hud]
    let run = { dead: false }
    let timers: gsap.core.Tween[] = []

    const wait = (seconds: number) => new Promise<void>((resolve) => { timers.push(gsap.delayedCall(seconds, resolve)) })
    const edge = () => root.getBoundingClientRect()
    const local = (rect: DOMRect): Box => toLocalBox(rect, edge(), window.innerHeight)

    const say = (id: AgentId, text: string, busy = false) => {
      anchor(id).querySelector('[data-part="task"]')!.textContent = text
      anchor(id).toggleAttribute('data-busy', busy)
    }
    const narrate = (step: number, text: string, color = 'currentColor') => {
      hud.querySelector('[data-part="step"]')!.textContent = `${step}/${BUILD_STEPS.length}`
      hud.querySelector('[data-part="text"]')!.textContent = text
      hud.querySelector<HTMLElement>('[data-part="lamp"]')!.style.backgroundColor = color
    }

    const orb = (id: AgentId) => anchor(id).querySelector<HTMLElement>('[data-part="orb"]')!

    // Pour the swarm back into one dot at `at`: the small dots converge, then the big one pops in over them.
    const form = (id: AgentId, at: Point, duration = 0.9) => {
      gsap.set(dots(id), { opacity: 1 })
      gsap.to(anchor(id), { x: at.x, y: at.y, autoAlpha: 1, duration: 0.4, delay: duration * 0.6 })
      gsap.to(orb(id), { scale: 1, duration: 0.4, ease: 'back.out(2.5)', delay: duration + 0.15 })
      gsap.to(dots(id), { opacity: 0, duration: 0.15, delay: duration + 0.35 })
      return gsap.to(dots(id), {
        x: at.x - DOT / 2,
        y: at.y - DOT / 2,
        duration,
        ease: 'power3.inOut',
        stagger: { amount: 0.3, from: 'random' },
      }).then()
    }

    // Burst: the big dot vanishes and every small one flies to its own point; the label waits at `label`.
    const scatter = (id: AgentId, points: Point[], label: Point, duration = 1.1) => {
      gsap.to(orb(id), { scale: 0, duration: 0.2, ease: 'power2.in' })
      gsap.killTweensOf(dots(id), 'opacity')
      gsap.set(dots(id), { opacity: 1 })
      gsap.to(anchor(id), { x: label.x, y: label.y, autoAlpha: 1, duration: 0.5 })
      return gsap.to(dots(id), {
        x: (i) => points[i % points.length].x - DOT / 2,
        y: (i) => points[i % points.length].y - DOT / 2,
        duration,
        ease: 'power2.inOut',
        stagger: { amount: 0.4, from: 'random' },
      }).then()
    }

    const twinkle = (id: AgentId, times = 3) =>
      gsap.to(dots(id), { opacity: 0.2, duration: 0.2, repeat: times * 2 - 1, yoyo: true, stagger: { amount: 0.35, from: 'random' } }).then()

    // Where the dots wait: down the right-hand gutter, or just inside the edge when there is no gutter.
    const seat = (i: number): Point => {
      const rect = edge()
      const gutter = window.innerWidth - rect.right
      return { x: gutter > 190 ? rect.width + 36 : rect.width - 26, y: -rect.top + window.innerHeight * 0.26 + i * 44 }
    }
    const labelAt = (box: Box): Point => ({ x: box.x + 18, y: box.y - 20 })

    // The section to work on: whichever is on screen now. Waits (the story pauses) while none is.
    const stage = async (me: { dead: boolean }) => {
      while (!me.dead) {
        const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')]
        const index = nextVisible(sections.map((s) => s.getBoundingClientRect()), window.innerHeight, -1)
        if (index >= 0) return { section: sections[index], name: sections[index].id, body: local(sections[index].getBoundingClientRect()) }
        await wait(0.6)
      }
      return null
    }

    const story = async () => {
      run.dead = true
      timers.forEach((t) => t.kill())
      timers = []
      gsap.killTweensOf(everything())
      const me = run = { dead: false }
      const count = () => SWARM

      AGENTS.forEach(({ id }, i) => {
        const from = seat(i)
        gsap.set(dots(id), { x: () => -60 - Math.random() * 80, y: () => from.y + (Math.random() - 0.5) * 240, opacity: 0 })
        gsap.set(anchor(id), { x: from.x, y: from.y, autoAlpha: 0 })
        gsap.set(orb(id), { scale: 0 })
        say(id, AGENTS[i].verb)
      })
      gsap.to(hud, { autoAlpha: 1, y: 0, duration: 0.3 })

      narrate(1, 'me → orca: build tien-dat-profile')
      await wait(0.9)
      if (me.dead) return
      await form('orca', seat(0), 1.1)
      let on = await stage(me)
      if (!on) return

      narrate(2, `orca splits the job: plan ${on.name}`, AGENTS[0].color)
      const heading = local((on.section.querySelector('h2') ?? on.section).getBoundingClientRect())
      say('orca', `plan ${on.name}`, true)
      await scatter('orca', perimeterPoints(heading, count()), labelAt(heading))
      await twinkle('orca', 2)
      if (me.dead) return
      say('orca', 'tasks out')
      await form('orca', seat(0))
      if (me.dead) return
      // The hand-off: the two workers pour out of orca, one stream each, and take their seats.
      narrate(2, 'orca → claude: write · orca → codex: review', AGENTS[0].color)
      const source = seat(0)
      for (const id of ['claude', 'codex'] as const) {
        gsap.set(dots(id), { x: () => source.x + (Math.random() - 0.5) * 24, y: () => source.y + (Math.random() - 0.5) * 24, opacity: 0 })
      }
      await Promise.all([form('claude', seat(1), 1.2), form('codex', seat(2), 1.2)])
      await wait(0.4)

      // The visitor may have scrolled on: each phase works on the section that is on screen now.
      on = await stage(me)
      if (!on) return
      narrate(3, `claude writes ${on.name}`, AGENTS[1].color)
      say('claude', `write ${on.name}`, true)
      await scatter('claude', perimeterPoints(on.body, count()), labelAt(on.body))
      await twinkle('claude', 4)

      // The reviewer's dots line up into one row and sweep the block from top to bottom.
      on = await stage(me)
      if (!on) return
      const { name, body } = on
      narrate(4, 'codex reviews the diff', AGENTS[2].color)
      say('claude', 'diff → codex')
      say('codex', `review ${name}`, true)
      await scatter('claude', perimeterPoints(body, count()), labelAt(body), 0.6)
      const top = rowPoints(body, body.y, count())
      await scatter('codex', top, { x: body.x + body.w - 150, y: body.y - 20 })
      await gsap.to(dots('codex'), { y: body.y + body.h - DOT / 2, duration: 1.1, ease: 'none' }).then()
      if (me.dead) return
      narrate(4, 'codex: 1 issue → claude fixes it', AGENTS[1].color)
      say('codex', '1 issue')
      say('claude', 'fix', true)
      await twinkle('claude', 2)
      await gsap.to(dots('codex'), { y: body.y - DOT / 2, duration: 0.8, ease: 'none' }).then()
      if (me.dead) return
      narrate(4, 'codex: review ✓', AGENTS[2].color)
      say('codex', `${name} ✓`)
      say('claude', 'done')
      await wait(0.6)

      // Each gate fills a third of the block's bottom edge.
      on = await stage(me)
      if (!on) return
      const floor = on.body.y + on.body.h
      const gates = ['tsc', 'test', 'build']
      for (const [i, { id, color }] of AGENTS.entries()) {
        if (me.dead) return
        narrate(5, `gates: ${gates.slice(0, i + 1).map((g) => `${g} ✓`).join('  ')}`, color)
        say(id, `${gates[i]} ✓`)
        await scatter(id, rowPoints(on.body, floor, count(), i / 3 + 0.01, (i + 1) / 3 - 0.01), { x: on.body.x + on.body.w * (i / 3) + 18, y: floor + 8 }, 0.8)
      }
      await wait(0.7)
      if (me.dead) return

      narrate(6, 'me: ship it → deployed tiendat.work')
      await Promise.all(AGENTS.map(({ id, verb }, i) => {
        say(id, verb)
        return form(id, seat(i), 1)
      }))
      await wait(3.5)
      if (me.dead) return
      gsap.to(hud, { autoAlpha: 0, y: 8, duration: 0.4 })
    }

    gsap.set(hud, { autoAlpha: 0, y: 8 })
    const start = gsap.delayedCall(1, story)
    window.addEventListener(RUN_EVENT, story)

    return () => {
      run.dead = true
      start.kill()
      timers.forEach((t) => t.kill())
      window.removeEventListener(RUN_EVENT, story)
      gsap.killTweensOf(everything())
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} aria-hidden='true' className='pointer-events-none absolute inset-0 z-40 font-ibm'>
      {AGENTS.map(({ id, color }) => Array.from({ length: SWARM }, (_, i) => (
        <span key={`${id}-${i}`} data-dot={id} className='absolute left-0 top-0 rounded-full opacity-0 will-change-transform' style={{ width: DOT, height: DOT, backgroundColor: color }} />
      )))}
      {AGENTS.map(({ id, verb, color }) => (
        <button
          key={id}
          type='button'
          tabIndex={-1}
          data-anchor={id}
          onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }))}
          className='group/agent pointer-events-auto invisible absolute left-0 top-0 cursor-pointer'
        >
          <span className='absolute -left-4 -top-4 size-8' />
          <span data-part='orb' className='absolute -left-2 -top-2 block size-4'>
            <span className='agent-orb block size-full rounded-full' style={{ backgroundColor: color, boxShadow: `0 0 0 4px ${color}33` }} />
          </span>
          <span className='ml-5 mt-3 flex w-max items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-black' style={{ backgroundColor: color }}>
            <span>{id}</span>
            <span className='opacity-50'>·</span>
            <span data-part='task'>{verb}</span>
            <span className='agent-dots hidden gap-0.5 pl-0.5 group-data-[busy]/agent:flex'>
              <i /><i /><i />
            </span>
          </span>
        </button>
      ))}
      <div ref={hudRef} className='invisible fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 border bg-background px-3 py-1.5 text-xs shadow-sm'>
        <span data-part='lamp' className='size-1.5 rounded-full' />
        <span data-part='step' className='text-muted-foreground' />
        <span data-part='text' />
      </div>
    </div>
  )
}

// The same cast as real controls: who each agent is, how the build goes, and the swarm's replay and off switch.
export function AgentCast () {
  const { on, able } = useSwarm()
  const [open, setOpen] = useState<AgentId | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const current = AGENTS.find((a) => a.id === open)

  // A click on a dot out on the page lands here.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen((e as CustomEvent<AgentId>).detail)
      ref.current?.scrollIntoView({ block: 'center' })
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  return (
    <div ref={ref} className='flex flex-col gap-3'>
      <div className='flex flex-wrap items-center gap-2'>
        {AGENTS.map(({ id, verb, color }) => (
          <button
            key={id}
            type='button'
            aria-expanded={open === id}
            aria-controls='agent-details'
            onClick={() => setOpen(open === id ? null : id)}
            className={`flex items-center gap-3 border px-3 py-1.5 text-xs transition-colors hover:bg-muted/50 ${open === id ? 'border-foreground/60 bg-muted/50' : ''}`}
          >
            <span aria-hidden='true' className='agent-orb size-3 shrink-0 rounded-full' style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${color}33` }} />
            <span className='text-left'>
              <span className='block font-medium'>{id}</span>
              <span className='block text-muted-foreground'>{verb}</span>
            </span>
          </button>
        ))}
        {able && (
          <span className='ml-auto flex gap-3 text-xs text-muted-foreground'>
            {on && (
              <button type='button' className='transition-colors hover:text-foreground' onClick={() => window.dispatchEvent(new CustomEvent(RUN_EVENT))}>
                [▶ run build]
              </button>
            )}
            <button type='button' aria-pressed={on} className='transition-colors hover:text-foreground' onClick={() => storeOn(!on)}>
              [agents: {on ? 'on' : 'off'}]
            </button>
          </span>
        )}
      </div>

      <div id='agent-details'>
        {current && (
          <div className='border-l-2 py-1 pl-3 text-xs' style={{ borderColor: current.color }}>
            <p>{current.role}</p>
            <p className='mt-1 text-muted-foreground'>Runs on {current.runsOn}.</p>
            <ul className='mt-1 list-inside list-["–_"] text-muted-foreground'>
              {current.setup.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <Link href={current.href} className='mt-1 inline-block underline underline-offset-2 hover:text-foreground'>
              see the {current.id} workflow →
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
    </div>
  )
}
