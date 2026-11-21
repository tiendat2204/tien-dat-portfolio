'use client'

import type { BotAvatarProps } from 'bot-avatars'
import { gsap } from 'gsap'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { nextVisible, rowPoints, toLocalBox, type Box, type Point } from '@/lib/agent-cursors-plan'

/*
  The home page's agents at work: Ori, Quill and Boo, three plush characters (bot-avatars, drawn on a canvas), act
  out one build of this site (BUILD_STEPS). Tasks are cards they throw to each other, and the work is a course of
  voxel bricks, the same cubes as the hero figure, laid along the top of the section on screen: Ori marks out the
  slots, Quill lays a brick in each, Boo checks them one by one and kicks out a bad one, the gates ripple down the
  row, and at the end the bricks sink into the section's top rule and its frame lights up. It plays once and can be replayed. AgentCast is the same
  cast as real controls, and is what phones and reduced-motion visitors get.
*/

const BRICKS = 30
const BRICK = { w: 18, h: 20 }
const REJECTED = '#ef4444'
// Bricks pop up into place from inside the block, so nothing ever crosses the site header above it.
const RISE = 24
const STORAGE_KEY = 'agent-cursors'
const TOGGLE_EVENT = 'agent-swarm:toggle'
const RUN_EVENT = 'agent-swarm:run'
const OPEN_EVENT = 'agent-swarm:open'
const STATUS_EVENT = 'agent-swarm:status'

const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as { [K in AgentId]: Extract<typeof AGENTS[number], { id: K }> }

// A per-brick callback for a staggered tween: recolours the brick as its own tween starts.
const tint = (color: string) => function (this: gsap.core.Tween) {
  const el = this.targets()[0] as HTMLElement
  el.style.color = color
  el.removeAttribute('data-ghost')
}

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
  const agent = BY_ID[id]
  return (
    <span aria-hidden='true' className='block shrink-0' style={{ width: size, height: size }}>
      <BotAvatar type={agent.avatar} color={agent.color} face='mouth' size={size} seed={AGENTS.indexOf(agent) / AGENTS.length} paused={still} interactive={!still} {...MOODS[mood]} />
    </span>
  )
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

// The scene needs room and motion: off on phones, under reduced motion, or when the visitor sent it home.
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

    const bricks = () => gsap.utils.toArray<HTMLElement>('[data-brick]', root)
    const card = (kind: 'ticket' | 'write' | 'review') => root.querySelector<HTMLElement>(`[data-card='${kind}']`)!
    const anchor = (id: AgentId) => root.querySelector<HTMLElement>(`[data-anchor='${id}']`)!
    const bot = (id: AgentId) => anchor(id).querySelector<HTMLElement>('[data-part="bot"]')!
    const feel = (id: AgentId, mood: Mood) => setMoods((prev) => ({ ...prev, [id]: mood }))
    const everything = () => [...root.querySelectorAll('[data-brick], [data-card], [data-anchor], [data-part="bot"], [data-part="frame"], [data-part="stamp"]'), hud]
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

    // A character does not glide: it hops, leans into the jump and squashes on landing.
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

    // A task card is thrown in an arc, and whoever it reaches catches it with a little swell.
    const pass = async (kind: 'ticket' | 'write' | 'review', from: Point, to: Point, catcher: AgentId | null, duration = 0.8) => {
      const el = card(kind)
      gsap.set(el, { x: from.x, y: from.y, xPercent: -50, yPercent: -50, autoAlpha: 1, scale: 1, rotation: -10 })
      gsap.to(el, { x: to.x, rotation: 8, duration, ease: 'power1.inOut' })
      await gsap.timeline()
        .to(el, { y: Math.min(from.y, to.y) - 54, duration: duration / 2, ease: 'power2.out' })
        .to(el, { y: to.y, duration: duration / 2, ease: 'power2.in' })
        .then()
      gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.2 })
      if (catcher) gsap.fromTo(bot(catcher), { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    }

    // Where the characters wait: down the right-hand gutter, or just inside the edge when there is no gutter.
    const seat = (i: number): Point => {
      const rect = edge()
      const gutter = window.innerWidth - rect.right
      return { x: gutter > 190 ? rect.width + 52 : rect.width - 40, y: -rect.top + window.innerHeight * 0.24 + i * 84 }
    }
    // A character works standing just under the course of bricks, inside the block (clear of the site header).
    const perch = (box: Box, along = 0): Point => ({ x: box.x + 44 + (box.w - 88) * along, y: box.y + 50 })
    // One slot per brick, along the block's top edge.
    const course = (box: Box) => rowPoints(box, box.y, BRICKS, 0.02, 0.98)
    const slot = (p: Point) => ({ x: p.x - BRICK.w / 2, y: p.y - BRICK.h / 2 })
    // The section to work on: whichever is on screen now. Waits (the story pauses) while none is.
    const stage = async (me: { dead: boolean }) => {
      while (!me.dead) {
        const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')]
        const index = nextVisible(sections.map((s) => s.getBoundingClientRect()), window.innerHeight, -1)
        if (index >= 0) {
          const rect = sections[index].getBoundingClientRect()
          const origin = edge()
          // `body` is the part on screen, where the cast works; `full` is the section's real box.
          return { name: sections[index].id, body: local(rect), full: { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height } }
        }
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
      const ori = BY_ID.orca
      const quill = BY_ID.claude
      const boo = BY_ID.codex

      AGENTS.forEach(({ id, verb }) => {
        gsap.set(anchor(id), { autoAlpha: 0 })
        anchor(id).removeAttribute('data-alert')
        gsap.set(bot(id), { x: 0, y: 0, rotation: 0, scale: 1 })
        say(id, verb)
        feel(id, 'idle')
      })
      gsap.set(bricks(), { opacity: 0, scale: 1, rotation: 0 })
      gsap.set(root.querySelectorAll('[data-card], [data-part="frame"], [data-part="stamp"]'), { autoAlpha: 0 })
      gsap.to(hud, { autoAlpha: 1, y: 0, duration: 0.3 })

      // 1. The ticket flies in from the page's left edge, and Ori catches it.
      narrate(1, `me → ${ori.name}: build tien-dat-profile`)
      const home = seat(0)
      await appear('orca', home)
      await pass('ticket', { x: -120, y: home.y - 20 }, { x: home.x, y: home.y - 8 }, 'orca', 1.2)
      say('orca', 'got the ticket')
      await wait(0.5)
      let on = await stage(me)
      if (!on) return

      // 2. The plan: Ori marks out one empty slot per brick along the top of the section.
      narrate(2, `${ori.name} plans ${on.name}`, ori.color)
      say('orca', `plan ${on.name}`, true)
      await go('orca', perch(on.body))
      feel('orca', 'focused')
      let slots = course(on.body)
      gsap.set(bricks(), { x: (i) => slot(slots[i]).x, y: (i) => slot(slots[i]).y, color: ori.color })
      bricks().forEach((b) => b.toggleAttribute('data-ghost', true))
      await gsap.fromTo(bricks(), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.25, stagger: 0.035 }).then()
      await wait(0.4)
      if (me.dead) return
      feel('orca', 'idle')
      say('orca', 'tasks out')
      await go('orca', seat(0))
      if (me.dead) return

      // The hand-off: the ticket becomes two task cards, thrown to the seats where the workers pop up.
      narrate(2, `${ori.name} → ${quill.name}: write · ${ori.name} → ${boo.name}: review`, ori.color)
      const from = { x: at.orca.x, y: at.orca.y - 10 }
      appear('claude', seat(1))
      appear('codex', seat(2))
      await Promise.all([pass('write', from, seat(1), 'claude', 0.7), pass('review', from, seat(2), 'codex', 0.9)])
      // Its part is done for now: Ori dozes off until the gates.
      feel('orca', 'asleep')
      await wait(0.5)

      // The visitor may have scrolled on: each phase re-reads the section on screen and moves the course to it.
      const follow = async () => {
        const now = await stage(me)
        if (!now) return null
        const next = course(now.body)
        const moved = (i: number) => Math.abs(next[i].x - slots[i].x) > 2 || Math.abs(next[i].y - slots[i].y) > 2
        // Both ends: a resize can leave the first slot almost where it was and move the last one a long way.
        if (moved(0) || moved(BRICKS - 1)) {
          slots = next
          await gsap.to(bricks(), { x: (i) => slot(slots[i]).x, y: (i) => slot(slots[i]).y, duration: 0.5, ease: 'power2.inOut' }).then()
        }
        return now
      }

      // 3. Quill hops along the course, and a brick pops up into each slot behind it.
      on = await follow()
      if (!on) return
      narrate(3, `${quill.name} writes ${on.name}`, quill.color)
      say('claude', `write ${on.name}`, true)
      await go('claude', perch(on.body))
      feel('claude', 'working')
      const lay = gsap.fromTo(bricks(),
        { y: (i) => slot(slots[i]).y + RISE, opacity: 0 },
        { y: (i) => slot(slots[i]).y, opacity: 1, duration: 0.4, ease: 'back.out(3)', immediateRender: false, stagger: { each: 0.07, onStart: tint(quill.color) } })
      for (const along of [0.33, 0.66, 0.96]) await go('claude', perch(on.body, along), 0.7)
      await lay.then()
      if (me.dead) return

      // 4. Boo walks the course and turns each brick it approves green; one is wrong.
      on = await follow()
      if (!on) return
      const { name, body } = on
      const bad = Math.floor(BRICKS * 0.62)
      const approve = (start: number, end: number) => gsap.to(bricks().slice(start, end), {
        keyframes: [{ scale: 1.25, y: '+=3', duration: 0.08 }, { scale: 1, y: '-=3', duration: 0.17 }],
        stagger: { each: 0.06, onStart: tint(boo.color) },
      }).then()
      narrate(4, `${boo.name} reviews the diff`, boo.color)
      say('claude', `diff → ${boo.name}`)
      feel('claude', 'idle')
      say('codex', `review ${name}`, true)
      await go('codex', perch(body, 0.04))
      // Head down, eyes on the bricks.
      feel('codex', 'focused')
      const firstPass = approve(0, bad)
      await go('codex', perch(body, 0.3), 0.6)
      await go('codex', perch(body, bad / BRICKS - 0.04), 0.6)
      await firstPass
      if (me.dead) return

      const wrong = bricks()[bad]
      wrong.style.color = REJECTED
      gsap.fromTo(wrong, { rotation: -14 }, { rotation: 14, duration: 0.07, repeat: 7, yoyo: true })
      narrate(4, `${boo.name}: 1 issue → ${quill.name} fixes it`, REJECTED)
      say('codex', '1 issue')
      // The writer jumps at the news.
      feel('claude', 'surprised')
      anchor('claude').toggleAttribute('data-alert', true)
      gsap.fromTo(bot('claude'), { y: 0 }, { y: -14, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
      say('claude', '!')
      await wait(0.9)
      if (me.dead) return
      anchor('claude').toggleAttribute('data-alert', false)
      // Boo kicks the bad brick out, and Quill comes back to lay a new one.
      gsap.to(wrong, { x: '+=110', y: '+=90', rotation: 260, opacity: 0, duration: 0.6, ease: 'power2.out' })
      feel('claude', 'working')
      say('claude', 'fix', true)
      await go('claude', { x: slots[bad].x - 30, y: perch(body).y })
      wrong.style.color = quill.color
      await gsap.fromTo(wrong, { x: slot(slots[bad]).x, y: slot(slots[bad]).y + RISE, rotation: 0, opacity: 0 }, { y: slot(slots[bad]).y, opacity: 1, duration: 0.4, ease: 'back.out(3)' }).then()
      say('claude', 'fixed')
      feel('claude', 'idle')
      const secondPass = approve(bad, BRICKS)
      await go('codex', perch(body, 0.97), 0.7)
      await secondPass
      if (me.dead) return
      narrate(4, `${boo.name}: review ✓`, boo.color)
      say('codex', `${name} ✓`)
      feel('codex', 'happy')
      await wait(0.6)

      // 5. Each gate sends a ripple down the course.
      on = await follow()
      if (!on) return
      feel('orca', 'idle')
      feel('codex', 'idle')
      const gates = ['tsc', 'test', 'build']
      for (const [i, { id, color }] of AGENTS.entries()) {
        if (me.dead) return
        narrate(5, `gates: ${gates.slice(0, i + 1).map((g) => `${g} ✓`).join('  ')}`, color)
        say(id, `${gates[i]} ✓`)
        await gsap.to(bricks(), { keyframes: [{ y: '+=9', duration: 0.12, ease: 'power2.out' }, { y: '-=9', duration: 0.18, ease: 'power2.in' }], stagger: 0.016 }).then()
      }
      await wait(0.4)
      if (me.dead) return

      // 6. Shipped: the bricks sink into the section's own top rule, its frame lights up once, and a small stamp
      // sits on the rule. Both follow the section's real box, so nothing is drawn over its content.
      narrate(6, 'me: ship it → deployed tiendat.work', boo.color)
      const { full: shipped } = on
      const frame = root.querySelector<HTMLElement>('[data-part="frame"]')!
      const stamp = root.querySelector<HTMLElement>('[data-part="stamp"]')!
      gsap.to(bricks(), { scaleY: 0, y: (i) => slots[i].y, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.02 })
      gsap.set(frame, { x: shipped.x, y: shipped.y, width: shipped.w, height: shipped.h, autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
      gsap.to(frame, { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.inOut' })
      gsap.set(stamp, { x: shipped.x + shipped.w - 14, y: shipped.y, xPercent: -100, yPercent: -50 })
      gsap.fromTo(stamp, { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', delay: 0.8 })
      await Promise.all(AGENTS.map(async ({ id, verb }, i) => {
        say(id, verb)
        await go(id, seat(i))
        feel(id, 'happy')
      }))
      await wait(3.5)
      if (me.dead) return
      AGENTS.forEach(({ id }) => feel(id, 'idle'))
      gsap.to([frame, stamp], { autoAlpha: 0, duration: 0.6 })
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
    <div ref={rootRef} aria-hidden='true' className='pointer-events-none absolute inset-0 z-30 font-ibm'>
      {Array.from({ length: BRICKS }, (_, i) => (
        <span key={i} data-brick='' className='absolute left-0 top-0 opacity-0 will-change-transform'>
          <Brick />
        </span>
      ))}
      {([['ticket', 'ticket: build', 'currentColor'], ['write', 'task: write', BY_ID.claude.color], ['review', 'task: review', BY_ID.codex.color]] as const).map(([kind, text, color]) => (
        <span key={kind} data-card={kind} className='invisible absolute left-0 top-0 flex w-max items-center gap-1.5 border bg-background px-1.5 py-1 text-[11px] leading-none shadow-sm' style={{ borderColor: color }}>
          <span className='size-1.5' style={{ backgroundColor: color }} />
          {text}
        </span>
      ))}
      <span data-part='frame' className='invisible absolute left-0 top-0 border' style={{ borderColor: BY_ID.codex.color, backgroundColor: `${BY_ID.codex.color}0d` }} />
      <span data-part='stamp' className='invisible absolute left-0 top-0 w-max border bg-background px-1.5 py-0.5 text-[11px] leading-4' style={{ borderColor: BY_ID.codex.color, color: BY_ID.codex.color }}>
        ✓ shipped
      </span>
      {AGENTS.map(({ id, name, verb, color }) => (
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
            <span>{name}</span>
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

// The same cast as real controls: who each agent is, how the build goes, and the scene's replay and off switch.
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
        {AGENTS.map(({ id, name, verb }) => (
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
              <span className='block font-medium'>{name}</span>
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
