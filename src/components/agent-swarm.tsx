'use client'

import type { BotAvatarProps } from 'bot-avatars'
import { gsap } from 'gsap'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { nextVisible, perimeterPoints, rowPoints, toLocalBox, type Box, type Point } from '@/lib/agent-cursors-plan'

/*
  The home page's agents at work. Each agent is a plush little character (bot-avatars, drawn on a canvas). It hops over to
  the block it works on, throws out a swarm of small dots that settle on the block, then gathers them back in.
  Together they act out one build of this site (BUILD_STEPS): ticket, plan, write, review, gates, ship. It plays
  once, on whatever section is on screen, and can be replayed. AgentCast is the same cast as real controls, and is
  what phones and reduced-motion visitors get.
*/

const DOT = 4
// How many small dots one agent throws out.
const SWARM = 36
const STORAGE_KEY = 'agent-cursors'
const TOGGLE_EVENT = 'agent-swarm:toggle'
const RUN_EVENT = 'agent-swarm:run'
const OPEN_EVENT = 'agent-swarm:open'
const STATUS_EVENT = 'agent-swarm:status'

// The avatars draw on a canvas, so they only exist in the browser.
const BotAvatar = dynamic(() => import('bot-avatars').then((m) => m.BotAvatar), { ssr: false })

// What a character is feeling. `focused` and `surprised` hold the head still: down at the work, or thrown back.
type Mood = 'idle' | 'working' | 'happy' | 'focused' | 'surprised' | 'asleep'

const MOODS: Record<Mood, Pick<BotAvatarProps, 'state' | 'pose'>> = {
  idle: { state: 'default' },
  working: { state: 'working' },
  happy: { state: 'working' },
  focused: { state: 'default', pose: { pitch: -0.45, yaw: -0.25 } },
  surprised: { state: 'default', pose: { pitch: 0.5, roll: 0.12 } },
  asleep: { state: 'sleeping' },
}

function Bot ({ id, size, mood = 'idle', still = false }: { id: AgentId; size: number; mood?: Mood; still?: boolean }) {
  const agent = AGENTS.find((a) => a.id === id)!
  return (
    <span aria-hidden='true' className='block shrink-0' style={{ width: size, height: size }}>
      <BotAvatar type={agent.avatar} color={agent.color} face='mouth' size={size} seed={AGENTS.indexOf(agent) / AGENTS.length} paused={still} interactive={!still} {...MOODS[mood]} />
    </span>
  )
}

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
  const [state, setState] = useState({ on: true, able: false, still: false })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia('(min-width: 640px)')
    const sync = () => setState({ on: storedOn(), able: !motion.matches && wide.matches, still: motion.matches })
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
  const [moods, setMoods] = useState<Partial<Record<AgentId, Mood>>>({})

  useEffect(() => {
    const root = rootRef.current
    const hud = hudRef.current
    if (!enabled || !root || !hud) return

    const dots = (id: AgentId) => gsap.utils.toArray<HTMLElement>(`[data-dot='${id}']`, root)
    const anchor = (id: AgentId) => root.querySelector<HTMLElement>(`[data-anchor='${id}']`)!
    const bot = (id: AgentId) => anchor(id).querySelector<HTMLElement>('[data-part="bot"]')!
    const feel = (id: AgentId, mood: Mood) => setMoods((prev) => ({ ...prev, [id]: mood }))
    const everything = () => [...root.querySelectorAll('[data-dot], [data-anchor], [data-part="bot"]'), hud]
    const at = {} as Record<AgentId, Point>
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
      // The overlay is hidden from assistive tech; AgentCast announces the same line.
      window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: `Step ${step} of ${BUILD_STEPS.length}: ${text}` }))
    }

    // A character does not glide: it hops, leans into the jump, and squashes on landing.
    const go = (id: AgentId, to: Point, duration = 0.75) => {
      const lean = Math.sign(to.x - (at[id]?.x ?? to.x))
      at[id] = to
      gsap.timeline()
        .to(bot(id), { y: -16, rotation: lean * 10, scaleY: 1.08, duration: duration / 2, ease: 'power2.out' })
        .to(bot(id), { y: 0, rotation: 0, scaleY: 1, duration: duration / 2, ease: 'power2.in' })
        .to(bot(id), { scaleY: 0.8, scaleX: 1.14, duration: 0.07 })
        .to(bot(id), { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)' })
      return gsap.to(anchor(id), { x: to.x, y: to.y, autoAlpha: 1, duration, ease: 'power1.inOut' }).then()
    }

    const appear = (id: AgentId, to: Point) => {
      at[id] = to
      gsap.set(anchor(id), { x: to.x, y: to.y, autoAlpha: 1 })
      return gsap.fromTo(bot(id), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }).then()
    }

    // Move dots that are already out to new points.
    const send = (id: AgentId, points: Point[], duration = 1) => gsap.to(dots(id), {
      x: (i) => points[i % points.length].x - DOT / 2,
      y: (i) => points[i % points.length].y - DOT / 2,
      duration,
      ease: 'power2.out',
      stagger: { amount: 0.4, from: 'random' },
    }).then()

    // Throw the dots out from where the character stands; each one flies to its own point.
    const emit = (id: AgentId, points: Point[], duration = 1) => {
      gsap.killTweensOf(dots(id))
      gsap.set(dots(id), { x: at[id].x - DOT / 2, y: at[id].y - DOT / 2, opacity: 1 })
      return send(id, points, duration)
    }

    // Gather the dots back into the character, which swells for a moment as they land.
    const collect = async (id: AgentId) => {
      await gsap.to(dots(id), { x: at[id].x - DOT / 2, y: at[id].y - DOT / 2, duration: 0.6, ease: 'power2.in', stagger: { amount: 0.25, from: 'random' } }).then()
      gsap.set(dots(id), { opacity: 0 })
      gsap.fromTo(bot(id), { scale: 1.18 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    }

    const twinkle = (id: AgentId, times = 3) =>
      gsap.to(dots(id), { opacity: 0.2, duration: 0.2, repeat: times * 2 - 1, yoyo: true, stagger: { amount: 0.35, from: 'random' } }).then()

    // Where the characters wait: down the right-hand gutter, or just inside the edge when there is no gutter.
    const seat = (i: number): Point => {
      const rect = edge()
      const gutter = window.innerWidth - rect.right
      return { x: gutter > 190 ? rect.width + 52 : rect.width - 40, y: -rect.top + window.innerHeight * 0.24 + i * 84 }
    }
    // A character works perched on the top edge of its block.
    const perch = (box: Box, along = 0): Point => ({ x: box.x + 36 + box.w * along, y: box.y - 26 })

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

      AGENTS.forEach(({ id, verb }) => {
        gsap.set(dots(id), { opacity: 0 })
        gsap.set(anchor(id), { autoAlpha: 0 })
        anchor(id).removeAttribute('data-alert')
        gsap.set(bot(id), { x: 0, y: 0, rotation: 0, scale: 1 })
        say(id, verb)
        feel(id, 'idle')
      })
      gsap.to(hud, { autoAlpha: 1, y: 0, duration: 0.3 })

      // The ticket arrives: orca hops in from the left edge and takes its seat.
      narrate(1, 'me → orca: build tien-dat-profile')
      const home = seat(0)
      at.orca = { x: -50, y: home.y }
      gsap.set(anchor('orca'), { x: at.orca.x, y: at.orca.y, autoAlpha: 1 })
      say('orca', 'ticket')
      await wait(0.4)
      await go('orca', { x: home.x * 0.35, y: home.y }, 0.6)
      await go('orca', { x: home.x * 0.7, y: home.y }, 0.6)
      await go('orca', home, 0.6)
      let on = await stage(me)
      if (!on) return

      narrate(2, `orca splits the job: plan ${on.name}`, AGENTS[0].color)
      const heading = local((on.section.querySelector('h2') ?? on.section).getBoundingClientRect())
      say('orca', `plan ${on.name}`, true)
      await go('orca', perch(heading))
      feel('orca', 'working')
      await emit('orca', perimeterPoints(heading, SWARM))
      await twinkle('orca', 2)
      if (me.dead) return
      await collect('orca')
      feel('orca', 'idle')
      say('orca', 'tasks out')
      await go('orca', seat(0))
      if (me.dead) return

      // The hand-off: orca throws one stream of dots at each empty seat, and a worker pops up where it lands.
      narrate(2, 'orca → claude: write · orca → codex: review', AGENTS[0].color)
      await emit('orca', [seat(1), seat(2)], 0.7)
      gsap.to(dots('orca'), { opacity: 0, duration: 0.2 })
      await Promise.all([appear('claude', seat(1)), appear('codex', seat(2))])
      // Its part is done for now: orca dozes off until the gates.
      feel('orca', 'asleep')
      await wait(0.4)

      // The visitor may have scrolled on: each phase works on the section that is on screen now.
      on = await stage(me)
      if (!on) return
      narrate(3, `claude writes ${on.name}`, AGENTS[1].color)
      say('claude', `write ${on.name}`, true)
      await go('claude', perch(on.body))
      feel('claude', 'working')
      await emit('claude', perimeterPoints(on.body, SWARM))
      await twinkle('claude', 4)

      // The reviewer's dots line up into one row and sweep the block from top to bottom.
      on = await stage(me)
      if (!on) return
      const { name, body } = on
      narrate(4, 'codex reviews the diff', AGENTS[2].color)
      say('claude', 'diff → codex')
      feel('claude', 'idle')
      say('codex', `review ${name}`, true)
      if (at.claude.y !== perch(body).y) {
        await go('claude', perch(body))
        await send('claude', perimeterPoints(body, SWARM), 0.6)
      }
      await go('codex', perch(body, 0.72))
      // Head down, eyes on the diff.
      feel('codex', 'focused')
      await emit('codex', rowPoints(body, body.y, SWARM))
      await gsap.to(dots('codex'), { y: body.y + body.h - DOT / 2, duration: 1.1, ease: 'none' }).then()
      if (me.dead) return
      narrate(4, 'codex: 1 issue → claude fixes it', AGENTS[1].color)
      say('codex', '1 issue')
      // The writer jumps at the news, then gets back to it.
      feel('claude', 'surprised')
      anchor('claude').toggleAttribute('data-alert', true)
      gsap.fromTo(bot('claude'), { y: 0 }, { y: -14, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
      say('claude', '!')
      await wait(0.9)
      anchor('claude').toggleAttribute('data-alert', false)
      feel('claude', 'working')
      say('claude', 'fix', true)
      await twinkle('claude', 2)
      await gsap.to(dots('codex'), { y: body.y - DOT / 2, duration: 0.8, ease: 'none' }).then()
      if (me.dead) return
      narrate(4, 'codex: review ✓', AGENTS[2].color)
      say('codex', `${name} ✓`)
      say('claude', 'done')
      feel('codex', 'happy')
      feel('claude', 'idle')
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
        feel(id, 'idle')
        await go(id, { x: on.body.x + on.body.w * (i / 3 + 1 / 6), y: floor + 40 })
        const row = rowPoints(on.body, floor, SWARM, i / 3 + 0.01, (i + 1) / 3 - 0.01)
        await (id === 'orca' ? emit(id, row, 0.7) : send(id, row, 0.7))
      }
      await wait(0.7)
      if (me.dead) return

      narrate(6, 'me: ship it → deployed tiendat.work')
      await Promise.all(AGENTS.map(async ({ id, verb }, i) => {
        await collect(id)
        say(id, verb)
        await go(id, seat(i))
        // Shipped: everyone celebrates for a moment.
        feel(id, 'happy')
      }))
      await wait(3.5)
      if (me.dead) return
      AGENTS.forEach(({ id }) => feel(id, 'idle'))
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
          <span data-part='bot' className='absolute -left-8 -top-8 block origin-bottom'>
            <Bot id={id} size={64} mood={moods[id]} />
            <span className='absolute -right-1 -top-2 hidden size-5 place-items-center rounded-full bg-foreground text-xs font-bold text-background group-data-[alert]/agent:grid'>!</span>
          </span>
          <span className='ml-9 mt-7 flex w-max items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-black' style={{ backgroundColor: color }}>
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
  const { on, able, still } = useSwarm()
  const [open, setOpen] = useState<AgentId | null>(null)
  const [status, setStatus] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const current = AGENTS.find((a) => a.id === open)

  // A click on a character out on the page lands here, and so does each line of the running build.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen((e as CustomEvent<AgentId>).detail)
      ref.current?.scrollIntoView({ block: 'center' })
    }
    const onStatus = (e: Event) => setStatus((e as CustomEvent<string>).detail)
    window.addEventListener(OPEN_EVENT, onOpen)
    window.addEventListener(STATUS_EVENT, onStatus)
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen)
      window.removeEventListener(STATUS_EVENT, onStatus)
    }
  }, [])

  return (
    <div ref={ref} className='flex flex-col gap-3'>
      <p aria-live='polite' className='sr-only'>{status}</p>
      <div className='flex flex-wrap items-center gap-2'>
        {AGENTS.map(({ id, verb }) => (
          <button
            key={id}
            type='button'
            aria-expanded={open === id}
            aria-controls='agent-details'
            onClick={() => setOpen(open === id ? null : id)}
            className={`flex items-center gap-2.5 border px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50 ${open === id ? 'border-foreground/60 bg-muted/50' : ''}`}
          >
            <Bot id={id} size={44} still={still} mood={open === id ? 'happy' : 'idle'} />
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
