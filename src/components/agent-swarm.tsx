'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { sectionAt, wallSlots } from '@/lib/agent-cursors-plan'
import { AgentDot, type AgentDotMood } from '@/registry/AgentDot/agent-dot'

/*
  The home page's agents, Ori, Quill and Boo (AgentDot characters), in two places that never cover the content:

  - AgentDock: the three sit small in the bottom-right corner of the window. They are quiet. They give a little hop
    when the visitor reaches a new section, say a line when poked, and offer a ▶ that goes to the stage.
  - AgentStage: a box inside "How I build" where they act out one build of this site (BUILD_STEPS) with a wall of
    voxel bricks, the same cubes as the hero figure: Ori marks out the slots, Quill lays a brick in each, Boo
    checks them and kicks out a bad one, the gates ripple through the wall, and it ships. The characters there are
    also the buttons that open each agent's details.

  Nothing runs per frame or per scroll event, and the canvases stop drawing off screen and in a hidden tab.
*/

const REJECTED = '#ef4444'
const STORAGE_KEY = 'agent-cursors'
const TOGGLE_EVENT = 'agent-swarm:toggle'
const RUN_EVENT = 'agent-swarm:run'
const BUSY_EVENT = 'agent-swarm:busy'

// The wall is narrower on a phone, where the stage has little room beside it.
const WALL = { cols: 10, narrowCols: 6, rows: 3 }
const BRICK = { w: 18, h: 20, rise: 11 }
const STAGE = { height: 196, ground: 150, actor: 52 }

const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as { [K in AgentId]: Extract<typeof AGENTS[number], { id: K }> }

// A per-brick callback for a staggered tween: recolours the brick as its own tween starts.
const tint = (color: string) => function (this: gsap.core.Tween) {
  const el = this.targets()[0] as HTMLElement
  el.style.color = color
  el.removeAttribute('data-ghost')
}

// One voxel brick: an isometric cube in the current colour, lit from the top.
function Brick () {
  return (
    <svg width={BRICK.w} height={BRICK.h} viewBox='0 0 16 18' className='block overflow-visible'>
      <path className='agent-brick-face' d='M8 0l8 4.5-8 4.5-8-4.5z' fill='currentColor' fillOpacity='0.95' />
      <path className='agent-brick-face' d='M0 4.5l8 4.5v9l-8-4.5z' fill='currentColor' fillOpacity='0.6' />
      <path className='agent-brick-face' d='M16 4.5l-8 4.5v9l8-4.5z' fill='currentColor' fillOpacity='0.32' />
      <path className='agent-brick-edge' d='M8 0l8 4.5v9l-8 4.5-8-4.5v-9zM0 4.5l8 4.5 8-4.5M8 9v9' fill='none' stroke='currentColor' strokeWidth='0.8' strokeLinejoin='round' />
    </svg>
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

// `on`: the visitor has not sent the dock home. `wide`: there is room for it. `still`: reduced motion.
function usePrefs () {
  const [state, setState] = useState({ on: true, wide: false, still: true })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia('(min-width: 640px)')
    const sync = () => setState({ on: storedOn(), wide: wide.matches, still: motion.matches })
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

// True while the tab is in the background, so the canvases can stop drawing.
function useTabHidden () {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const sync = () => setHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return hidden
}

// The three in the corner of the window. Quiet until someone is curious.
export function AgentDock () {
  const rootRef = useRef<HTMLDivElement>(null)
  const { on, wide, still } = usePrefs()
  const enabled = on && wide && !still
  const hidden = useTabHidden()
  const [said, setSaid] = useState<{ id: AgentId; line: number } | null>(null)
  const [away, setAway] = useState(false)

  // The stage borrows the cast while a build is playing.
  useEffect(() => {
    const onBusy = (e: Event) => setAway((e as CustomEvent<boolean>).detail)
    window.addEventListener(BUSY_EVENT, onBusy)
    return () => window.removeEventListener(BUSY_EVENT, onBusy)
  }, [])

  // A little hop, one after another, when scrolling stops in a new section.
  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    let settle: ReturnType<typeof setTimeout> | undefined
    let last = -1
    const check = () => {
      const rects = [...document.querySelectorAll('main > section[id]')].map((s) => s.getBoundingClientRect())
      const index = sectionAt(rects, window.innerHeight / 2)
      if (index === last || index < 0) return
      const first = last < 0
      last = index
      if (!first) gsap.to(root.querySelectorAll('[data-bot]'), { keyframes: [{ y: -9, duration: 0.14, ease: 'power2.out' }, { y: 0, duration: 0.2, ease: 'bounce.out' }], stagger: 0.08 })
    }
    const onScroll = () => {
      clearTimeout(settle)
      settle = setTimeout(check, 160)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(settle)
      window.removeEventListener('scroll', onScroll)
      gsap.killTweensOf(root.querySelectorAll('[data-bot]'))
    }
  }, [enabled])

  // A poked character keeps its line up for a moment.
  useEffect(() => {
    if (!said) return
    const timer = setTimeout(() => setSaid(null), 2600)
    return () => clearTimeout(timer)
  }, [said])

  if (!enabled) return null

  const watch = () => {
    document.getElementById('how-i-build')?.scrollIntoView({ block: 'center' })
    window.dispatchEvent(new CustomEvent(RUN_EVENT))
  }

  return (
    <div ref={rootRef} className={`group/dock fixed bottom-3 right-3 z-30 flex items-end gap-1 font-ibm transition-[opacity,scale] duration-300 ${away ? 'pointer-events-none scale-75 opacity-0' : ''}`}>
      <span className='mb-1 mr-1 flex flex-col items-end gap-1 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover/dock:opacity-100'>
        <button type='button' onClick={watch} className='border bg-background px-1.5 py-0.5 transition-colors hover:text-foreground'>▶ watch us build</button>
        <button type='button' onClick={() => storeOn(false)} className='border bg-background px-1.5 py-0.5 transition-colors hover:text-foreground'>× send us home</button>
      </span>
      {AGENTS.map(({ id, name, verb, avatar, color, lines }, i) => (
        <button
          key={id}
          type='button'
          aria-label={`${name}, ${verb}. Press to hear a line.`}
          onClick={() => setSaid((prev) => ({ id, line: prev?.id === id ? (prev.line + 1) % lines.length : 0 }))}
          className='cursor-pointer'
        >
          <span data-bot='' className='block origin-bottom'>
            <AgentDot type={avatar} color={color} size={40} seed={i / AGENTS.length} paused={hidden || away} mood={said?.id === id ? 'happy' : 'idle'} bubble={said?.id === id ? `${name}: ${lines[said.line]}` : undefined} />
          </span>
        </button>
      ))}
    </div>
  )
}

interface Actor { mood: AgentDotMood; task: string; busy: boolean; alert: boolean }
type Cast = Record<AgentId, Actor>

const resting = (): Cast => Object.fromEntries(AGENTS.map((a) => [a.id, { mood: 'idle', task: a.verb, busy: false, alert: false }])) as Cast

// The stage in "How I build": the build played out with a wall of voxel bricks, and the cast as real controls.
export function AgentStage () {
  const boxRef = useRef<HTMLDivElement>(null)
  const { on, wide, still } = usePrefs()
  const hidden = useTabHidden()
  const [cast, setCast] = useState<Cast>(resting)
  const [open, setOpen] = useState<AgentId | null>(null)
  const [status, setStatus] = useState('')
  const [seen, setSeen] = useState(false)
  const current = AGENTS.find((a) => a.id === open)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return

    // The avatars only draw while the stage is on screen.
    const watcher = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting))
    watcher.observe(box)
    if (still) return () => watcher.disconnect()

    const cols = wide ? WALL.cols : WALL.narrowCols
    const count = cols * WALL.rows
    const bricks = () => gsap.utils.toArray<HTMLElement>('[data-brick]', box).slice(0, count)
    const card = (kind: 'ticket' | 'write' | 'review') => box.querySelector<HTMLElement>(`[data-card='${kind}']`)!
    const stamp = box.querySelector<HTMLElement>('[data-part="stamp"]')!
    const actor = (id: AgentId) => box.querySelector<HTMLElement>(`[data-actor='${id}']`)!
    const bot = (id: AgentId) => actor(id).querySelector<HTMLElement>('[data-bot]')!
    const act = (id: AgentId, patch: Partial<Actor>) => setCast((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    const everything = () => [...box.querySelectorAll('[data-brick], [data-card], [data-actor], [data-bot]'), stamp]
    const at = {} as Record<AgentId, number>
    let run = { dead: true }
    let timers: gsap.core.Tween[] = []

    const wait = (seconds: number) => new Promise<void>((resolve) => { timers.push(gsap.delayedCall(seconds, resolve)) })
    const narrate = (step: number, text: string) => setStatus(`${step}/${BUILD_STEPS.length}  ${text}`)

    // Everything is laid out from the box's width, so the stage works at any size.
    const layout = () => {
      const width = box.clientWidth
      const wallWidth = cols * BRICK.w + BRICK.w / 2
      const x0 = (width - wallWidth) / 2
      return {
        marks: { orca: Math.max(28, x0 - 150), claude: Math.max(76, x0 - 44), codex: Math.min(width - 30, x0 + wallWidth + 96) } as Record<AgentId, number>,
        slots: wallSlots(cols, WALL.rows, BRICK, x0, STAGE.ground - BRICK.h),
        wall: { left: x0, right: x0 + wallWidth, top: STAGE.ground - BRICK.h - (WALL.rows - 1) * BRICK.rise },
      }
    }
    const place = () => {
      const { marks } = layout()
      AGENTS.forEach(({ id }) => {
        at[id] = marks[id]
        gsap.set(actor(id), { x: marks[id] })
      })
    }

    // A character does not glide: it hops, leans into the jump and squashes on landing.
    const go = (id: AgentId, x: number, duration = 0.6) => {
      const lean = Math.sign(x - at[id])
      at[id] = x
      gsap.timeline()
        .to(bot(id), { y: -14, rotation: lean * 10, scaleY: 1.08, duration: duration / 2, ease: 'power2.out' })
        .to(bot(id), { y: 0, rotation: 0, scaleY: 1, duration: duration / 2, ease: 'power2.in' })
        .to(bot(id), { scaleY: 0.82, scaleX: 1.12, duration: 0.07 })
        .to(bot(id), { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)' })
      return gsap.to(actor(id), { x, duration, ease: 'power1.inOut' }).then()
    }

    // A task card is thrown in an arc, and whoever it reaches catches it with a little swell.
    const pass = async (kind: 'ticket' | 'write' | 'review', from: number, to: number, catcher: AgentId, duration = 0.8) => {
      const el = card(kind)
      const y = STAGE.ground - STAGE.actor - 6
      gsap.set(el, { x: from, y, xPercent: -50, yPercent: -50, autoAlpha: 1, scale: 1, rotation: -10 })
      gsap.to(el, { x: to, rotation: 8, duration, ease: 'power1.inOut' })
      await gsap.timeline()
        .to(el, { y: y - 30, duration: duration / 2, ease: 'power2.out' })
        .to(el, { y, duration: duration / 2, ease: 'power2.in' })
        .then()
      gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.2 })
      gsap.fromTo(bot(catcher), { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    }

    const story = async () => {
      run.dead = true
      timers.forEach((t) => t.kill())
      timers = []
      gsap.killTweensOf(everything())
      const me = run = { dead: false }
      const ori = BY_ID.orca
      const quill = BY_ID.claude
      const boo = BY_ID.codex
      const { marks, slots, wall } = layout()
      const top = (i: number) => slots[i].y

      setCast(resting())
      place()
      AGENTS.forEach(({ id }) => gsap.set(bot(id), { y: 0, rotation: 0, scale: 1 }))
      gsap.set(bricks(), { x: (i) => slots[i].x, y: top, opacity: 0, scale: 1, rotation: 0, color: ori.color })
      bricks().forEach((b) => b.toggleAttribute('data-ghost', true))
      gsap.set([stamp, ...box.querySelectorAll('[data-card]')], { autoAlpha: 0 })
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: true }))

      // 1. The ticket flies in from the left, and Ori catches it.
      narrate(1, `me → ${ori.name}: build tien-dat-profile`)
      await pass('ticket', -40, marks.orca, 'orca', 0.9)
      if (me.dead) return
      act('orca', { task: 'got the ticket' })
      await wait(0.3)
      if (me.dead) return

      // 2. The plan: one dashed slot per brick. Then the ticket becomes two task cards.
      narrate(2, `${ori.name} plans the wall, then hands out the tasks`)
      act('orca', { mood: 'focused', task: 'plan', busy: true })
      await gsap.fromTo(bricks(), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, stagger: 0.025 }).then()
      if (me.dead) return
      act('orca', { mood: 'idle', task: 'tasks out', busy: false })
      await Promise.all([pass('write', marks.orca, marks.claude, 'claude', 0.6), pass('review', marks.orca, marks.codex, 'codex', 0.9)])
      if (me.dead) return
      // Its part is done for now: Ori dozes off until the gates.
      act('orca', { mood: 'asleep' })

      // 3. Quill lays a brick in every slot, course by course.
      narrate(3, `${quill.name} writes the change`)
      act('claude', { mood: 'working', task: 'write', busy: true })
      const lay = gsap.fromTo(bricks(),
        { y: (i) => top(i) - 26, opacity: 0 },
        { y: top, opacity: 1, duration: 0.38, ease: 'bounce.out', immediateRender: false, stagger: { each: 0.055, onStart: tint(quill.color) } })
      await go('claude', wall.left + 30)
      await go('claude', wall.left - 30)
      await lay.then()
      if (me.dead) return
      act('claude', { mood: 'idle', task: `diff → ${boo.name}`, busy: false })

      // 4. Boo checks them one by one and turns each approved brick green; one is wrong.
      const bad = Math.floor(count * 0.57)
      const approve = (start: number, end: number) => gsap.to(bricks().slice(start, end), {
        keyframes: [{ scale: 1.3, duration: 0.07 }, { scale: 1, duration: 0.15 }],
        stagger: { each: 0.05, onStart: tint(boo.color) },
      }).then()
      narrate(4, `${boo.name} reviews it`)
      act('codex', { mood: 'focused', task: 'review', busy: true })
      await go('codex', wall.right + 40)
      await approve(0, bad)
      if (me.dead) return
      const wrong = bricks()[bad]
      wrong.style.color = REJECTED
      gsap.fromTo(wrong, { rotation: -14 }, { rotation: 14, duration: 0.07, repeat: 7, yoyo: true })
      narrate(4, `${boo.name}: 1 issue. Back to ${quill.name}.`)
      act('codex', { task: '1 issue', busy: false })
      // The writer jumps at the news.
      act('claude', { mood: 'surprised', alert: true, task: '!' })
      gsap.fromTo(bot('claude'), { y: 0 }, { y: -12, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
      await wait(0.9)
      if (me.dead) return
      // The bad brick is kicked out and a new one laid.
      gsap.to(wrong, { x: '+=70', y: '-=46', rotation: 260, opacity: 0, duration: 0.55, ease: 'power2.out' })
      act('claude', { mood: 'working', alert: false, task: 'fix', busy: true })
      await go('claude', wall.left + 10, 0.5)
      gsap.killTweensOf(wrong)
      wrong.style.color = quill.color
      await gsap.fromTo(wrong, { x: slots[bad].x, y: top(bad) - 26, rotation: 0, opacity: 0 }, { y: top(bad), opacity: 1, duration: 0.38, ease: 'bounce.out' }).then()
      if (me.dead) return
      act('claude', { mood: 'idle', task: 'fixed', busy: false })
      go('claude', marks.claude, 0.5)
      act('codex', { task: 'review', busy: true })
      await approve(bad, count)
      if (me.dead) return
      act('codex', { mood: 'happy', task: 'review ✓', busy: false })
      await wait(0.5)
      if (me.dead) return

      // 5. Each gate sends a ripple through the wall.
      act('orca', { mood: 'idle' })
      act('codex', { mood: 'idle' })
      const gates = ['tsc', 'test', 'build']
      for (const [i, { id }] of AGENTS.entries()) {
        narrate(5, `gates: ${gates.slice(0, i + 1).map((g) => `${g} ✓`).join('  ')}`)
        act(id, { task: `${gates[i]} ✓` })
        await gsap.to(bricks(), { keyframes: [{ y: '-=6', duration: 0.1, ease: 'power2.out' }, { y: '+=6', duration: 0.16, ease: 'power2.in' }], stagger: 0.012 }).then()
        if (me.dead) return
      }

      // 6. Shipped: the stamp lands on the wall, and the wall stays up until the next run.
      narrate(6, 'me: ship it. Deployed to tiendat.work.')
      gsap.set(stamp, { x: (wall.left + wall.right) / 2, y: wall.top - 16, xPercent: -50, yPercent: -50 })
      gsap.fromTo(stamp, { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' })
      go('codex', marks.codex, 0.5)
      AGENTS.forEach(({ id, verb }) => act(id, { mood: 'happy', task: verb }))
      await wait(2.6)
      if (me.dead) return
      setCast(resting())
      run.dead = true
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: false }))
    }

    place()
    // It plays by itself once, the first time most of the stage is on screen.
    let played = false
    const starter = new IntersectionObserver(([entry]) => {
      if (played || !entry.isIntersecting) return
      played = true
      story()
    }, { threshold: 0.8 })
    starter.observe(box)
    const replay = () => {
      played = true
      story()
    }
    const onResize = () => { if (run.dead) place() }
    window.addEventListener(RUN_EVENT, replay)
    window.addEventListener('resize', onResize)

    return () => {
      run.dead = true
      watcher.disconnect()
      starter.disconnect()
      timers.forEach((t) => t.kill())
      window.removeEventListener(RUN_EVENT, replay)
      window.removeEventListener('resize', onResize)
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: false }))
      gsap.killTweensOf(everything())
    }
  }, [still, wide])

  return (
    <div className='flex flex-col gap-3'>
      <div ref={boxRef} className='relative overflow-hidden border bg-muted/20' style={{ height: STAGE.height }}>
        <span aria-hidden='true' className='absolute inset-x-0 border-t border-dashed' style={{ top: STAGE.ground }} />
        <span aria-hidden='true' className='absolute left-2 top-1.5 text-[11px] text-muted-foreground'>fig.02 — build.voxel</span>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0'>
          {Array.from({ length: WALL.cols * WALL.rows }, (_, i) => (
            <span key={i} data-brick='' className='absolute left-0 top-0 opacity-0'>
              <Brick />
            </span>
          ))}
          <span data-part='stamp' className='invisible absolute left-0 top-0 w-max border bg-background px-1.5 py-0.5 text-[11px] leading-4' style={{ borderColor: BY_ID.codex.color, color: BY_ID.codex.color }}>✓ shipped</span>
          {([['ticket', 'ticket: build', 'currentColor'], ['write', 'task: write', BY_ID.claude.color], ['review', 'task: review', BY_ID.codex.color]] as const).map(([kind, text, color]) => (
            <span key={kind} data-card={kind} className='invisible absolute left-0 top-0 flex w-max items-center gap-1.5 border bg-background px-1.5 py-1 text-[11px] leading-none shadow-sm' style={{ borderColor: color }}>
              <span className='size-1.5' style={{ backgroundColor: color }} />
              {text}
            </span>
          ))}
        </div>
        {AGENTS.map(({ id, name, avatar, color }, i) => (
          <button
            key={id}
            type='button'
            data-actor={id}
            aria-expanded={open === id}
            aria-controls='agent-details'
            aria-label={`${name}: ${cast[id].task}. Show details.`}
            onClick={() => setOpen(open === id ? null : id)}
            className='absolute left-0 cursor-pointer outline-offset-4'
            // Before the script lays the stage out (or with reduced motion), spread the three evenly.
            style={{ top: STAGE.ground - STAGE.actor, left: still ? `${20 + i * 30}%` : undefined }}
          >
            <span data-bot='' className='block origin-[50%_52px] -translate-x-1/2'>
              <AgentDot type={avatar} color={color} size={STAGE.actor} name={name} seed={i / AGENTS.length} paused={still || hidden || !seen} {...cast[id]} task={wide ? cast[id].task : undefined} mood={open === id && cast[id].mood === 'idle' ? 'happy' : cast[id].mood} />
            </span>
          </button>
        ))}
      </div>

      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs'>
        <p aria-live='polite' className='min-h-4 text-muted-foreground'>{status || 'Pick a character to see what it does.'}</p>
        <span className='flex gap-3 text-muted-foreground'>
          {!still && (
            <button type='button' className='transition-colors hover:text-foreground' onClick={() => window.dispatchEvent(new CustomEvent(RUN_EVENT))}>
              [▶ run build]
            </button>
          )}
          {wide && !still && (
            <button type='button' aria-pressed={on} className='transition-colors hover:text-foreground' onClick={() => storeOn(!on)}>
              [dock: {on ? 'on' : 'off'}]
            </button>
          )}
        </span>
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
    </div>
  )
}
