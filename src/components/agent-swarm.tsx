'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { edgeInView, sectionAt, toLocalBox, type Point } from '@/lib/agent-cursors-plan'
import { AgentDot, type AgentDotMood } from '@/registry/AgentDot/agent-dot'

/*
  The home page's agents: Ori, Quill and Boo (AgentDot characters) live on the page. They stand on the top edge of
  the section in view and hop to the next one as the visitor scrolls. Poke one and it talks; pick one up and drop
  it on a section and it does its job there. They also act out one build of this site (BUILD_STEPS) on the section
  they stand on: tasks are cards thrown between them, and the work shows on the section's own frame (a dashed plan,
  a wash as it is written, a scanline as it is reviewed, a stamp when it ships). Scrolling ends the show and they go
  back to following. AgentCast is the same cast as real controls, and is what phones and reduced motion get.

  Cheap by design: nothing runs per frame or per scroll event. Positions are in page coordinates, so standing
  characters scroll with the page for free, and targets are only recomputed once scrolling stops.
*/

const REJECTED = '#ef4444'
const STORAGE_KEY = 'agent-cursors'
const TOGGLE_EVENT = 'agent-swarm:toggle'
const RUN_EVENT = 'agent-swarm:run'
const STATUS_EVENT = 'agent-swarm:status'
// Where along a section's top edge each character stands: clear of the heading on the left and the index on the right.
const ALONG = [0.38, 0.58, 0.78]
// How far above the edge a character's centre sits, so its feet touch the rule.
const STAND = 26

const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as { [K in AgentId]: Extract<typeof AGENTS[number], { id: K }> }

interface Actor { mood: AgentDotMood; task: string; busy: boolean; alert: boolean; bubble: string | null }
type Cast = Record<AgentId, Actor>

const resting = (): Cast => Object.fromEntries(AGENTS.map((a) => [a.id, { mood: 'idle', task: a.verb, busy: false, alert: false, bubble: null }])) as Cast

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

export function AgentSwarm () {
  const rootRef = useRef<HTMLDivElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const { on, able } = useSwarm()
  const enabled = on && able
  const hidden = useTabHidden()
  const [cast, setCast] = useState<Cast>(resting)

  useEffect(() => {
    const root = rootRef.current
    const hud = hudRef.current
    if (!enabled || !root || !hud) return

    const part = (name: string) => root.querySelector<HTMLElement>(`[data-part='${name}']`)!
    const card = (kind: 'ticket' | 'write' | 'review') => root.querySelector<HTMLElement>(`[data-card='${kind}']`)!
    const anchor = (id: AgentId) => root.querySelector<HTMLElement>(`[data-anchor='${id}']`)!
    const bot = (id: AgentId) => anchor(id).querySelector<HTMLElement>('[data-bot]')!
    const props = () => [part('frame'), part('wash'), part('scan'), part('stamp'), ...root.querySelectorAll<HTMLElement>('[data-card]')]
    const act = (id: AgentId, patch: Partial<Actor>) => setCast((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    const at = {} as Record<AgentId, Point>
    let run = { dead: true }
    let timers: gsap.core.Tween[] = []
    let where = ''
    let dragging = false

    const wait = (seconds: number) => new Promise<void>((resolve) => { timers.push(gsap.delayedCall(seconds, resolve)) })
    const later = (seconds: number, fn: () => void) => { timers.push(gsap.delayedCall(seconds, fn)) }
    const edge = () => root.getBoundingClientRect()
    const sections = () => [...document.querySelectorAll<HTMLElement>('main > section[id]')]

    const narrate = (step: number, text: string, color = 'currentColor') => {
      hud.querySelector('[data-hud="step"]')!.textContent = `${step}/${BUILD_STEPS.length}`
      hud.querySelector('[data-hud="text"]')!.textContent = text
      hud.querySelector<HTMLElement>('[data-hud="lamp"]')!.style.backgroundColor = color
      // The overlay is hidden from assistive tech; AgentCast announces the same line.
      window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: `Step ${step} of ${BUILD_STEPS.length}: ${text}` }))
    }

    // A character does not glide: it hops, leans into the jump and squashes on landing.
    const go = (id: AgentId, to: Point, duration = 0.7) => {
      const lean = Math.sign(to.x - (at[id]?.x ?? to.x))
      at[id] = to
      gsap.timeline()
        .to(bot(id), { y: -18, rotation: lean * 10, scaleY: 1.08, duration: duration / 2, ease: 'power2.out' })
        .to(bot(id), { y: 0, rotation: 0, scaleY: 1, duration: duration / 2, ease: 'power2.in' })
        .to(bot(id), { scaleY: 0.82, scaleX: 1.12, duration: 0.07 })
        .to(bot(id), { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)' })
      return gsap.to(anchor(id), { x: to.x, y: to.y, autoAlpha: 1, duration, ease: 'power1.inOut' }).then()
    }

    const appear = (id: AgentId, to: Point) => {
      at[id] = to
      gsap.set(anchor(id), { x: to.x, y: to.y, autoAlpha: 1 })
      return gsap.fromTo(bot(id), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.6)' }).then()
    }

    // A task card is thrown in an arc, and whoever it reaches catches it with a little swell.
    const pass = async (kind: 'ticket' | 'write' | 'review', from: Point, to: Point, catcher: AgentId, duration = 0.8) => {
      const el = card(kind)
      gsap.set(el, { x: from.x, y: from.y, xPercent: -50, yPercent: -50, autoAlpha: 1, scale: 1, rotation: -10 })
      gsap.to(el, { x: to.x, rotation: 8, duration, ease: 'power1.inOut' })
      await gsap.timeline()
        .to(el, { y: Math.min(from.y, to.y) - 54, duration: duration / 2, ease: 'power2.out' })
        .to(el, { y: to.y, duration: duration / 2, ease: 'power2.in' })
        .then()
      gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.2 })
      gsap.fromTo(bot(catcher), { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    }

    // Where the three should stand right now: on the top edge of the section in view, or, with no edge on screen,
    // down the right-hand side of the view.
    const spots = () => {
      const list = sections()
      const rects = list.map((s) => s.getBoundingClientRect())
      const origin = edge()
      const index = edgeInView(rects, window.innerHeight)
      if (index >= 0) {
        const r = rects[index]
        return { key: list[index].id, section: list[index], points: ALONG.map((a) => ({ x: r.left - origin.left + 44 + (r.width - 88) * a, y: r.top - origin.top - STAND })) }
      }
      const gutter = window.innerWidth - origin.right
      const x = gutter > 150 ? origin.width + 56 : origin.width - 44
      const under = sectionAt(rects, window.innerHeight / 2)
      return { key: 'side', section: under >= 0 ? list[under] : null, points: AGENTS.map((_, i) => ({ x, y: -origin.top + window.innerHeight * 0.3 + i * 104 })) }
    }

    // Hop to wherever they should be. Runs when scrolling stops, never while it is going on.
    const follow = () => {
      if (!run.dead || dragging) return
      const target = spots()
      // Side seats are tied to the view, so they move with every scroll; an edge only when the section changes.
      if (target.key === where && target.key !== 'side') return
      where = target.key
      AGENTS.forEach(({ id }, i) => later(i * 0.1, () => { if (at[id]) go(id, target.points[i], 0.6); else appear(id, target.points[i]) }))
    }

    const clearStage = () => {
      timers.forEach((t) => t.kill())
      timers = []
      gsap.killTweensOf([...props(), hud])
      gsap.set(props(), { autoAlpha: 0 })
      gsap.to(hud, { autoAlpha: 0, y: 8, duration: 0.2 })
      setCast(resting())
    }

    // The section's real box, and the part of it that is on screen.
    const boxes = (section: HTMLElement) => {
      const rect = section.getBoundingClientRect()
      const origin = edge()
      return { full: { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height }, view: toLocalBox(rect, origin, window.innerHeight) }
    }

    // Each role leaves its own mark on a section's frame. Also what a dropped character does.
    const plan = (section: HTMLElement) => {
      const { full } = boxes(section)
      gsap.set(part('frame'), { x: full.x, y: full.y, width: full.w, height: full.h, autoAlpha: 1, borderStyle: 'dashed', borderColor: BY_ID.orca.color, clipPath: 'inset(0 100% 0 0)' })
      return gsap.to(part('frame'), { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power2.inOut' }).then()
    }
    const write = (section: HTMLElement, duration = 1.6) => {
      const { full, view } = boxes(section)
      gsap.set(part('frame'), { x: full.x, y: full.y, width: full.w, height: full.h, autoAlpha: 1, borderStyle: 'solid', borderColor: BY_ID.claude.color, clipPath: 'none' })
      gsap.set(part('wash'), { x: view.x, y: view.y, width: view.w, height: view.h, autoAlpha: 1, backgroundColor: `${BY_ID.claude.color}14`, transformOrigin: '0 50%' })
      return gsap.fromTo(part('wash'), { scaleX: 0 }, { scaleX: 1, duration, ease: 'power1.inOut' }).then()
    }
    const scan = (section: HTMLElement, from: number, to: number, duration: number) => {
      const { view } = boxes(section)
      gsap.set(part('scan'), { x: view.x, width: view.w, autoAlpha: 1 })
      return gsap.fromTo(part('scan'), { y: view.y + view.h * from }, { y: view.y + view.h * to, duration, ease: 'none' }).then()
    }
    const fade = (names: string[], delay = 0) => gsap.to(names.map(part), { autoAlpha: 0, duration: 0.5, delay })

    const story = async () => {
      run.dead = true
      clearStage()
      const me = run = { dead: false }
      const ori = BY_ID.orca
      const quill = BY_ID.claude
      const boo = BY_ID.codex
      const target = spots()
      const section = target.section
      if (!section) {
        run.dead = true
        return
      }
      where = target.key
      const name = section.id
      const [p0, p1, p2] = target.points

      gsap.to(hud, { autoAlpha: 1, y: 0, duration: 0.3 })
      await Promise.all(AGENTS.map(({ id }, i) => at[id] ? go(id, target.points[i], 0.5) : appear(id, target.points[i])))
      if (me.dead) return

      // 1. The ticket flies in from the page's left edge, and Ori catches it.
      narrate(1, `me → ${ori.name}: build tien-dat-profile`)
      await pass('ticket', { x: -120, y: p0.y - 30 }, { x: p0.x, y: p0.y - 8 }, 'orca', 1)
      if (me.dead) return
      act('orca', { task: 'got the ticket' })
      await wait(0.4)
      if (me.dead) return

      // 2. The plan is a dashed outline round the section, then the ticket becomes two task cards.
      narrate(2, `${ori.name} plans ${name}`, ori.color)
      act('orca', { mood: 'focused', task: `plan ${name}`, busy: true })
      await plan(section)
      if (me.dead) return
      narrate(2, `${ori.name} → ${quill.name}: write · ${ori.name} → ${boo.name}: review`, ori.color)
      act('orca', { mood: 'idle', task: 'tasks out', busy: false })
      const hand = { x: p0.x, y: p0.y - 10 }
      await Promise.all([pass('write', hand, p1, 'claude', 0.7), pass('review', hand, p2, 'codex', 0.9)])
      if (me.dead) return
      // Its part is done for now: Ori dozes off until the gates.
      act('orca', { mood: 'asleep' })

      // 3. Writing washes across the section.
      narrate(3, `${quill.name} writes ${name}`, quill.color)
      act('claude', { mood: 'working', task: `write ${name}`, busy: true })
      await write(section)
      if (me.dead) return
      act('claude', { mood: 'idle', task: `diff → ${boo.name}`, busy: false })

      // 4. The review is a scanline; it stops on an issue, the writer fixes it, and it runs on.
      narrate(4, `${boo.name} reviews the diff`, boo.color)
      gsap.set(part('scan'), { backgroundColor: boo.color, color: boo.color })
      act('codex', { mood: 'focused', task: `review ${name}`, busy: true })
      await scan(section, 0, 0.6, 1)
      if (me.dead) return
      narrate(4, `${boo.name}: 1 issue → ${quill.name} fixes it`, REJECTED)
      const fx = boxes(section).full.x
      gsap.set(part('frame'), { borderColor: REJECTED })
      gsap.set(part('scan'), { backgroundColor: REJECTED, color: REJECTED })
      gsap.fromTo(part('frame'), { x: fx - 3 }, { x: fx + 3, duration: 0.06, repeat: 5, yoyo: true, onComplete: () => { gsap.set(part('frame'), { x: fx }) } })
      act('codex', { task: '1 issue', busy: false })
      // The writer jumps at the news.
      act('claude', { mood: 'surprised', alert: true, task: '!' })
      gsap.fromTo(bot('claude'), { y: 0 }, { y: -14, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
      await wait(0.9)
      if (me.dead) return
      act('claude', { mood: 'working', alert: false, task: 'fix', busy: true })
      gsap.set(part('frame'), { borderColor: quill.color })
      gsap.fromTo(part('wash'), { autoAlpha: 0.35 }, { autoAlpha: 1, duration: 0.25, repeat: 3, yoyo: true })
      await wait(0.9)
      if (me.dead) return
      act('claude', { mood: 'idle', task: 'fixed', busy: false })
      gsap.set(part('scan'), { backgroundColor: boo.color, color: boo.color })
      act('codex', { busy: true, task: `review ${name}` })
      await scan(section, 0.6, 1, 0.7)
      if (me.dead) return
      fade(['scan', 'wash'])
      gsap.set(part('frame'), { borderColor: boo.color })
      narrate(4, `${boo.name}: review ✓`, boo.color)
      act('codex', { mood: 'happy', task: `${name} ✓`, busy: false })
      await wait(0.6)
      if (me.dead) return

      // 5. The gates tick off on a stamp that sits on the section's top rule.
      act('orca', { mood: 'idle' })
      act('codex', { mood: 'idle' })
      const { full } = boxes(section)
      const stamp = part('stamp')
      gsap.set(stamp, { x: full.x + full.w - 14, y: full.y, xPercent: -100, yPercent: -50, autoAlpha: 1 })
      const gates = ['tsc', 'test', 'build']
      for (const [i, { id, color }] of AGENTS.entries()) {
        const done = gates.slice(0, i + 1).map((g) => `${g} ✓`).join('  ')
        narrate(5, `gates: ${done}`, color)
        stamp.textContent = done
        act(id, { task: `${gates[i]} ✓` })
        gsap.fromTo(stamp, { scale: 1.25 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
        await wait(0.55)
        if (me.dead) return
      }

      // 6. Shipped.
      narrate(6, 'me: ship it → deployed tiendat.work', boo.color)
      stamp.textContent = '✓ shipped'
      gsap.fromTo(stamp, { scale: 1.5 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' })
      AGENTS.forEach(({ id, verb }) => act(id, { mood: 'happy', task: verb }))
      await wait(3.2)
      if (me.dead) return
      fade(['frame', 'stamp'])
      gsap.to(hud, { autoAlpha: 0, y: 8, duration: 0.4 })
      setCast(resting())
      run.dead = true
    }

    // Poke: it says something and gives a little jump.
    const said = {} as Record<AgentId, number>
    const quiet = {} as Record<AgentId, gsap.core.Tween | undefined>
    const speak = (id: AgentId, bubble: string, mood: AgentDotMood, seconds = 2.4) => {
      quiet[id]?.kill()
      act(id, { bubble, mood })
      quiet[id] = gsap.delayedCall(seconds, () => act(id, { bubble: null, mood: 'idle' }))
    }
    const poke = (id: AgentId) => {
      const lines = BY_ID[id].lines
      said[id] = ((said[id] ?? -1) + 1) % lines.length
      speak(id, lines[said[id]], 'happy')
      gsap.fromTo(bot(id), { y: 0 }, { y: -12, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 })
    }

    // Drop: on a section it stands on that section's edge and does its job there.
    const drop = async (id: AgentId, clientX: number, clientY: number) => {
      const hit = document.elementsFromPoint(clientX, clientY).map((el) => el.closest<HTMLElement>('main > section[id]')).find(Boolean)
      if (!hit) {
        speak(id, 'Put me on a section.', 'idle')
        return
      }
      const rect = hit.getBoundingClientRect()
      const origin = edge()
      // With the section's top edge on screen it hops up onto it; otherwise it works from where it was put.
      if (rect.top >= 120) {
        const x = gsap.utils.clamp(rect.left + 44, rect.right - 44, clientX) - origin.left
        await go(id, { x, y: rect.top - origin.top - STAND }, 0.5)
      }
      speak(id, `${BY_ID[id].verb} ${hit.id}`, 'working', 2.6)
      gsap.killTweensOf(props())
      gsap.set(props(), { autoAlpha: 0 })
      if (id === 'orca') {
        await plan(hit)
        fade(['frame'], 0.8)
      } else if (id === 'claude') {
        await write(hit, 1.2)
        fade(['frame', 'wash'], 0.5)
      } else {
        gsap.set(part('scan'), { backgroundColor: BY_ID.codex.color, color: BY_ID.codex.color })
        await scan(hit, 0, 1, 1.4)
        fade(['scan'])
      }
    }

    // Press and move to pick a character up; press and release to poke it.
    const grabs = AGENTS.map(({ id }) => {
      const el = anchor(id)
      let start: { x: number; y: number } | null = null
      let moved = false
      const down = (e: PointerEvent) => {
        start = { x: e.clientX, y: e.clientY }
        moved = false
        el.setPointerCapture(e.pointerId)
      }
      const move = (e: PointerEvent) => {
        if (!start) return
        if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return
        if (!moved) {
          moved = true
          dragging = true
          // Picking one up ends the show.
          if (!run.dead) {
            run.dead = true
            clearStage()
          }
          gsap.killTweensOf([el, bot(id)])
          gsap.set(bot(id), { y: 0, rotation: 0, scale: 1.1 })
          act(id, { mood: 'surprised', bubble: null })
        }
        const origin = edge()
        at[id] = { x: e.clientX - origin.left, y: e.clientY - origin.top }
        gsap.set(el, { x: at[id].x, y: at[id].y })
      }
      const up = (e: PointerEvent) => {
        if (!start) return
        start = null
        if (!moved) {
          poke(id)
          return
        }
        dragging = false
        gsap.to(bot(id), { scale: 1, duration: 0.2 })
        // Leave it where it was put until the visitor scrolls to another section.
        where = `dropped:${id}`
        drop(id, e.clientX, e.clientY)
      }
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
      return () => {
        el.removeEventListener('pointerdown', down)
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
      }
    })

    // Scrolling ends the show at once; the hop to the new place waits until the scrolling stops.
    let settle: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      if (!run.dead) {
        run.dead = true
        clearStage()
      }
      clearTimeout(settle)
      settle = setTimeout(follow, 140)
    }

    gsap.set([...props(), hud], { autoAlpha: 0 })
    const start = gsap.delayedCall(1, story)
    window.addEventListener(RUN_EVENT, story)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      run.dead = true
      start.kill()
      clearTimeout(settle)
      timers.forEach((t) => t.kill())
      Object.values(quiet).forEach((t) => t?.kill())
      grabs.forEach((off) => off())
      window.removeEventListener(RUN_EVENT, story)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      gsap.killTweensOf([...props(), hud, ...root.querySelectorAll('[data-anchor], [data-bot]')])
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} aria-hidden='true' className='pointer-events-none absolute inset-0 z-30 font-ibm'>
      <span data-part='wash' className='invisible absolute left-0 top-0' />
      <span data-part='frame' className='invisible absolute left-0 top-0 border' />
      <span data-part='scan' className='invisible absolute left-0 top-0 h-px shadow-[0_0_10px_1px] shadow-current' style={{ backgroundColor: BY_ID.codex.color, color: BY_ID.codex.color }} />
      <span data-part='stamp' className='invisible absolute left-0 top-0 w-max border bg-background px-1.5 py-0.5 text-[11px] leading-4' style={{ borderColor: BY_ID.codex.color, color: BY_ID.codex.color }} />
      {([['ticket', 'ticket: build', 'currentColor'], ['write', 'task: write', BY_ID.claude.color], ['review', 'task: review', BY_ID.codex.color]] as const).map(([kind, text, color]) => (
        <span key={kind} data-card={kind} className='invisible absolute left-0 top-0 flex w-max items-center gap-1.5 border bg-background px-1.5 py-1 text-[11px] leading-none shadow-sm' style={{ borderColor: color }}>
          <span className='size-1.5' style={{ backgroundColor: color }} />
          {text}
        </span>
      ))}
      {AGENTS.map(({ id, name, avatar, color }, i) => (
        <button key={id} type='button' tabIndex={-1} data-anchor={id} className='pointer-events-auto invisible absolute left-0 top-0 cursor-grab touch-none select-none active:cursor-grabbing'>
          <span data-bot='' className='absolute -top-8 left-0 block origin-[50%_64px] -translate-x-1/2'>
            <AgentDot type={avatar} color={color} name={name} seed={i / AGENTS.length} paused={hidden} {...cast[id]} />
          </span>
        </button>
      ))}
      <div ref={hudRef} className='invisible fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 border bg-background px-3 py-1.5 text-xs shadow-sm'>
        <span data-hud='lamp' className='size-1.5 rounded-full' />
        <span data-hud='step' className='text-muted-foreground' />
        <span data-hud='text' />
      </div>
    </div>
  )
}

// The same cast as real controls: who each agent is, how the build goes, and the scene's replay and off switch.
export function AgentCast () {
  const { on, able, still } = useSwarm()
  const hidden = useTabHidden()
  const [open, setOpen] = useState<AgentId | null>(null)
  const [status, setStatus] = useState('')
  const [seen, setSeen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = AGENTS.find((a) => a.id === open)

  // Each line of the running build is announced from here.
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
            className={`flex items-center gap-2.5 border px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50 ${open === id ? 'border-foreground/60 bg-muted/50' : ''}`}
          >
            <AgentDot type={avatar} color={color} size={44} seed={i / AGENTS.length} paused={still || hidden || !seen} mood={open === id ? 'happy' : 'idle'} />
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
      {able && on && <p className='text-xs text-muted-foreground'>Out on the page: poke one to hear it, or pick it up and drop it on a section.</p>}
    </div>
  )
}
