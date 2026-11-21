'use client'

import { gsap } from 'gsap'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { sectionAt, type Point } from '@/lib/agent-cursors-plan'
import { AgentDot, type AgentDotMood } from '@/registry/AgentDot/agent-dot'

/*
  The home page's agents: Ori, Quill and Boo (AgentDot characters). Nothing happens unless the visitor asks.

  - AgentDock: the three sit small in the bottom-right corner, in the empty gutter beside the content (so only on
    wide screens). They hop when a new section is reached and say a line when poked. Its ▶ starts a build of the section in view,
    and a character picked up and dropped on a section starts one there.
  - AgentScene: where the work shows. The crew builds a section of the page out of that section's own pieces: Ori
    plans it (the content goes and a dashed outline stands in for every block), Quill builds the pieces one by one
    with a thrown voxel brick, Boo approves them and sends one back, the gates pulse through, and it ships. Then
    the section is exactly as it was and the cast returns to the dock.
  - AgentCast: the same cast as real controls in "How I build", with the build as text.

  Nothing runs per frame or per scroll event, and the canvases stop drawing off screen and in a hidden tab.
*/

const REJECTED = '#ef4444'
const STORAGE_KEY = 'agent-cursors'
const TOGGLE_EVENT = 'agent-swarm:toggle'
/** detail: `{ section?: string }` — the section id to build on; the one in view when left out. */
const RUN_EVENT = 'agent-swarm:run'
/** detail: `{ id, x, y }` — a character let go at a viewport point. */
const DROP_EVENT = 'agent-swarm:drop'
const BUSY_EVENT = 'agent-swarm:busy'
const STATUS_EVENT = 'agent-swarm:status'

const BRICK = { w: 18, h: 20 }
// Size of a character while it is out on the page.
const ACTOR = 52
// A section is built from at most this many pieces; a busier one is taken in bigger blocks.
const MAX_PIECES = 26
// A section's top rule must be this far below the header, and this far above the bottom, to build on it.
const HEADROOM = 230
const FOOTROOM = 140

const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as { [K in AgentId]: Extract<typeof AGENTS[number], { id: K }> }

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

// `on`: the visitor has not sent the dock home. `roomy`: an empty gutter beside the content column, wide enough
// to hold the dock without covering anything. `still`: reduced motion.
function usePrefs () {
  const [state, setState] = useState({ on: true, roomy: false, still: true })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    // The column is 768px; the dock needs about 150px of gutter to its right.
    const roomy = window.matchMedia('(min-width: 1080px)')
    const sync = () => setState({ on: storedOn(), roomy: roomy.matches, still: motion.matches })
    sync()
    motion.addEventListener('change', sync)
    roomy.addEventListener('change', sync)
    window.addEventListener(TOGGLE_EVENT, sync)
    return () => {
      motion.removeEventListener('change', sync)
      roomy.removeEventListener('change', sync)
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

// True while a build or a dropped character is at work on the page.
function useBusy () {
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onBusy = (e: Event) => setBusy((e as CustomEvent<boolean>).detail)
    window.addEventListener(BUSY_EVENT, onBusy)
    return () => window.removeEventListener(BUSY_EVENT, onBusy)
  }, [])

  return busy
}

const sections = () => [...document.querySelectorAll<HTMLElement>('main > section[id]')]

// The three in the corner of the window. Quiet until someone is curious.
export function AgentDock () {
  const rootRef = useRef<HTMLDivElement>(null)
  const heldRef = useRef<HTMLSpanElement>(null)
  const { on, roomy, still } = usePrefs()
  const enabled = on && roomy && !still
  const hidden = useTabHidden()
  const away = useBusy()
  const [said, setSaid] = useState<{ id: AgentId; line: number } | null>(null)
  const [held, setHeld] = useState<AgentId | null>(null)

  // A little hop, one after another, when scrolling stops in a new section.
  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    let settle: ReturnType<typeof setTimeout> | undefined
    let last = -1
    const check = () => {
      const index = sectionAt(sections().map((s) => s.getBoundingClientRect()), window.innerHeight / 2)
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

  // Press and release to poke; press and move to pick the character up and carry it to a section.
  const grab = (id: AgentId, lines: readonly string[]) => (down: ReactPointerEvent<HTMLButtonElement>) => {
    const el = down.currentTarget
    const start = { x: down.clientX, y: down.clientY }
    let carrying = false
    el.setPointerCapture(down.pointerId)
    const move = (e: PointerEvent) => {
      if (!carrying && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return
      if (!carrying) {
        carrying = true
        setSaid(null)
        setHeld(id)
      }
      // The carried copy follows the pointer directly, without a render per move.
      if (heldRef.current) heldRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    const up = (e: PointerEvent) => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      if (!carrying) {
        setSaid((prev) => ({ id, line: prev?.id === id ? (prev.line + 1) % lines.length : 0 }))
        return
      }
      setHeld(null)
      if (e.type === 'pointerup') window.dispatchEvent(new CustomEvent(DROP_EVENT, { detail: { id, x: e.clientX, y: e.clientY } }))
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }

  return (
    <>
      {/* A column no wider than the three characters, so the bubble and the controls stay in the gutter too. */}
      <div ref={rootRef} className={`group/dock pointer-events-none fixed bottom-3 right-3 z-30 flex w-32 flex-col items-end gap-1 font-ibm transition-[opacity,scale] duration-300 ${away ? 'scale-75 opacity-0' : '*:pointer-events-auto'}`}>
        <span role='status' className='w-full text-[11px] leading-4'>
          {said && <span className='block border bg-background px-2 py-1 shadow-sm'>{BY_ID[said.id].name}: {BY_ID[said.id].lines[said.line]}</span>}
        </span>
        {/* Hidden until the dock is hovered or focused, and takes no clicks while hidden. */}
        <span className='invisible flex w-full flex-col gap-1 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:visible focus-within:opacity-100 group-hover/dock:visible group-hover/dock:opacity-100 group-focus-within/dock:visible group-focus-within/dock:opacity-100'>
          <button type='button' onClick={() => window.dispatchEvent(new CustomEvent(RUN_EVENT, { detail: {} }))} className='border bg-background px-1.5 py-0.5 text-left transition-colors hover:text-foreground'>▶ watch us build</button>
          <button type='button' onClick={() => storeOn(false)} className='border bg-background px-1.5 py-0.5 text-left transition-colors hover:text-foreground'>× send us home</button>
        </span>
        <span className='flex items-end gap-1'>
          {AGENTS.map(({ id, name, verb, avatar, color, lines }, i) => (
            <button
              key={id}
              type='button'
              aria-label={`${name}, ${verb}. Press to hear a line, or drag onto a section.`}
              onPointerDown={grab(id, lines)}
              // The pointer handlers do the poking; this is for the keyboard.
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSaid((prev) => ({ id, line: prev?.id === id ? (prev.line + 1) % lines.length : 0 })) }}
              className={`cursor-grab touch-none select-none active:cursor-grabbing ${held === id ? 'opacity-30' : ''}`}
            >
              <span data-bot='' className='block origin-bottom'>
                <AgentDot type={avatar} color={color} size={40} seed={i / AGENTS.length} paused={hidden || away} mood={said?.id === id ? 'happy' : 'idle'} />
              </span>
            </button>
          ))}
        </span>
      </div>
      {held && (
        <span ref={heldRef} aria-hidden='true' className='pointer-events-none fixed left-0 top-0 z-50' style={{ transform: 'translate(-200px, -200px)' }}>
          <span className='block -translate-x-1/2 -translate-y-1/2'>
            <AgentDot type={BY_ID[held].avatar} color={BY_ID[held].color} size={52} mood='surprised' interactive={false} />
          </span>
        </span>
      )}
    </>
  )
}

interface Actor { mood: AgentDotMood; busy: boolean; alert: boolean }
type Cast = Record<AgentId, Actor>

const resting = (): Cast => Object.fromEntries(AGENTS.map((a) => [a.id, { mood: 'idle', busy: false, alert: false }])) as Cast

// Tags that are one piece of a section however much they hold; anything else is opened up to find its pieces.
const WHOLE = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'A', 'BUTTON', 'IMG', 'SVG', 'CANVAS', 'SPAN', 'TIME', 'CODE', 'PRE', 'FIGURE', 'BLOCKQUOTE', 'LI', 'LABEL', 'INPUT', 'VIDEO'])

/**
 * The pieces a section is built from: its visible blocks, in reading order, as fine-grained as fits in MAX_PIECES.
 * Only what is on screen counts, so a tall section is built a screenful at a time.
 */
function piecesOf (section: HTMLElement): HTMLElement[] {
  const onScreen = (el: Element) => {
    const r = el.getBoundingClientRect()
    return r.width > 8 && r.height > 8 && r.bottom > 80 && r.top < window.innerHeight - 8
  }
  const collect = (maxDepth: number) => {
    const found: HTMLElement[] = []
    const open = (el: Element, depth: number) => {
      for (const child of el.children) {
        // The section's own `+` corner marks and other decoration are not content.
        if (child.getAttribute('aria-hidden') === 'true' || !onScreen(child)) continue
        const kids = [...child.children].filter(onScreen)
        if (kids.length > 0 && depth < maxDepth && !WHOLE.has(child.tagName.toUpperCase())) open(child, depth + 1)
        else found.push(child as HTMLElement)
      }
    }
    open(section, 0)
    return found
  }
  let pieces = collect(6)
  for (let depth = 5; pieces.length > MAX_PIECES && depth >= 0; depth--) pieces = collect(depth)
  return pieces
    .slice(0, MAX_PIECES)
    .sort((a, b) => {
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      return Math.abs(ra.top - rb.top) > 12 ? ra.top - rb.top : ra.left - rb.left
    })
}

// Where the work shows: the cast builds a section of the page out of its own pieces, and only when asked to.
export function AgentScene () {
  const rootRef = useRef<HTMLDivElement>(null)
  const { still } = usePrefs()
  const hidden = useTabHidden()
  const lenis = useLenis()
  const scrollRef = useRef<(top: number) => void>(undefined)
  const [cast, setCast] = useState<Cast>(resting)
  const [line, setLine] = useState('')
  const [live, setLive] = useState(false)

  useEffect(() => {
    scrollRef.current = (top) => { if (lenis) lenis.scrollTo(top); else window.scrollTo({ top, behavior: 'smooth' }) }
  }, [lenis])

  useEffect(() => {
    const root = rootRef.current
    if (still || !root) return

    const frames = () => gsap.utils.toArray<HTMLElement>('[data-frame]', root)
    const bricks = () => gsap.utils.toArray<HTMLElement>('[data-brick]', root)
    const card = (kind: 'ticket' | 'write' | 'review') => root.querySelector<HTMLElement>(`[data-card='${kind}']`)!
    const stamp = root.querySelector<HTMLElement>('[data-part="stamp"]')!
    const chip = root.querySelector<HTMLElement>('[data-part="chip"]')!
    const actor = (id: AgentId) => root.querySelector<HTMLElement>(`[data-actor='${id}']`)!
    const bot = (id: AgentId) => actor(id).querySelector<HTMLElement>('[data-bot]')!
    const act = (id: AgentId, patch: Partial<Actor>) => setCast((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    const props = () => [...root.querySelectorAll('[data-frame], [data-brick], [data-card], [data-actor]'), stamp, chip]
    const at = {} as Record<AgentId, Point>
    // The section's pieces while they are being built, with the inline styles to put back afterwards.
    let held: { el: HTMLElement; opacity: string; clipPath: string }[] = []
    let run = { dead: true }
    let timers: gsap.core.Tween[] = []

    const wait = (seconds: number) => new Promise<void>((resolve) => { timers.push(gsap.delayedCall(seconds, resolve)) })
    const narrate = (text: string, step: number) => {
      const full = `${step}/${BUILD_STEPS.length}  ${text}`
      setLine(full)
      // The scene is hidden from assistive tech; AgentCast announces the same line.
      window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: full }))
    }

    const appear = (id: AgentId, to: Point) => {
      at[id] = to
      gsap.set(actor(id), { x: to.x, y: to.y, autoAlpha: 1 })
      return gsap.fromTo(bot(id), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.6)' }).then()
    }

    // A character does not glide: it hops, leans into the jump and squashes on landing.
    const go = (id: AgentId, to: Point, duration = 0.45) => {
      const lean = Math.sign(to.x - at[id].x)
      at[id] = to
      gsap.timeline()
        .to(bot(id), { y: -14, rotation: lean * 10, scaleY: 1.08, duration: duration / 2, ease: 'power2.out' })
        .to(bot(id), { y: 0, rotation: 0, scaleY: 1, duration: duration / 2, ease: 'power2.in' })
        .to(bot(id), { scaleY: 0.82, scaleX: 1.12, duration: 0.07 })
        .to(bot(id), { scaleY: 1, scaleX: 1, duration: 0.22, ease: 'back.out(3)' })
      return gsap.to(actor(id), { x: to.x, y: to.y, duration, ease: 'power1.inOut' }).then()
    }

    // A task card is thrown in an arc, and whoever it reaches catches it with a little swell.
    const pass = async (kind: 'ticket' | 'write' | 'review', from: Point, to: Point, catcher: AgentId, duration = 0.8) => {
      const el = card(kind)
      gsap.set(el, { x: from.x, y: from.y - 34, xPercent: -50, yPercent: -50, autoAlpha: 1, scale: 1, rotation: -10 })
      gsap.to(el, { x: to.x, rotation: 8, duration, ease: 'power1.inOut' })
      await gsap.timeline()
        .to(el, { y: Math.min(from.y, to.y) - 70, duration: duration / 2, ease: 'power2.out' })
        .to(el, { y: to.y - 34, duration: duration / 2, ease: 'power2.in' })
        .then()
      gsap.to(el, { scale: 0, autoAlpha: 0, duration: 0.2 })
      gsap.fromTo(bot(catcher), { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' })
    }

    // Stop whatever is playing, give the section its content back exactly as it was, and clear the scene away.
    const strike = () => {
      run.dead = true
      timers.forEach((t) => t.kill())
      timers = []
      gsap.killTweensOf([...props(), ...held.map((h) => h.el)])
      const restore = held
      held = []
      const putBack = () => {
        for (const { el, opacity, clipPath } of restore) {
          el.style.opacity = opacity
          el.style.clipPath = clipPath
        }
      }
      putBack()
      // And once more on the next frame: a tween killed in the same tick it rendered can still flush a late write.
      if (restore.length > 0) requestAnimationFrame(putBack)
      gsap.set(props(), { autoAlpha: 0 })
      setCast(resting())
      setLive(false)
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: false }))
    }

    // The build: the section is taken apart into its pieces and put back together by the three of them.
    const story = async (section: HTMLElement) => {
      strike()
      const me = run = { dead: false }
      const ori = BY_ID.orca
      const quill = BY_ID.claude
      const boo = BY_ID.codex

      // Bring the section's top rule to a clear part of the view first.
      let rect = section.getBoundingClientRect()
      if (rect.top < HEADROOM || rect.top > window.innerHeight - FOOTROOM) {
        scrollRef.current?.(window.scrollY + rect.top - window.innerHeight * 0.38)
        await wait(1.1)
        if (me.dead) return
        rect = section.getBoundingClientRect()
      }
      const origin = root.getBoundingClientRect()
      const left = rect.left - origin.left
      const rule = rect.top - origin.top
      const pieces = piecesOf(section)
      if (pieces.length === 0) {
        run.dead = true
        return
      }
      held = pieces.map((el) => ({ el, opacity: el.style.opacity, clipPath: el.style.clipPath }))
      const spots = pieces.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height }
      })
      const count = pieces.length
      const outline = frames().slice(0, count)
      gsap.set(outline, { x: (i) => spots[i].x - 3, y: (i) => spots[i].y - 3, width: (i) => spots[i].w + 6, height: (i) => spots[i].h + 6, autoAlpha: 0, scale: 1, borderStyle: 'dashed', borderColor: ori.color, backgroundColor: 'transparent' })
      gsap.set(chip, { x: left + 8, y: rule - 150, autoAlpha: 1 })
      gsap.set(stamp, { x: left + rect.width - 14, y: rule, xPercent: -100, yPercent: -50, scale: 1 })
      AGENTS.forEach(({ id }) => gsap.set(bot(id), { y: 0, rotation: 0, scale: 1 }))
      setLive(true)
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: true }))

      // They start out standing on the section's top rule; while working, each stands beside its piece.
      const onRule = (along: number): Point => ({ x: left + 40 + (rect.width - 80) * along, y: rule - ACTOR / 2 })
      const beside = (i: number, side: -1 | 1): Point => ({
        x: gsap.utils.clamp(left + 22, left + rect.width - 22, side < 0 ? spots[i].x - 14 : spots[i].x + spots[i].w + 14),
        y: spots[i].y + Math.min(spots[i].h / 2, 30),
      })
      const stride = Math.max(1, Math.ceil(count / 5))

      await appear('orca', onRule(0.2))
      if (me.dead) return

      // 1. The ticket flies in from the left, and Ori catches it.
      narrate(`me → ${ori.name}: build ${section.id}`, 1)
      await pass('ticket', { x: left - 60, y: rule - ACTOR / 2 }, at.orca, 'orca', 0.9)
      if (me.dead) return

      // 2. The plan: the section's content goes, and a dashed outline stands in for every piece.
      narrate(`${ori.name} plans it: ${count} pieces`, 2)
      act('orca', { mood: 'focused', busy: true })
      gsap.to(pieces, { opacity: 0, duration: 0.2, stagger: 0.025 })
      await gsap.fromTo(outline, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.25, stagger: 0.025 }).then()
      if (me.dead) return
      act('orca', { mood: 'idle', busy: false })
      appear('claude', onRule(0.5))
      appear('codex', onRule(0.8))
      await Promise.all([pass('write', at.orca, onRule(0.5), 'claude', 0.6), pass('review', at.orca, onRule(0.8), 'codex', 0.9)])
      if (me.dead) return
      // Its part is done for now: Ori dozes off until the gates.
      act('orca', { mood: 'asleep' })

      // A piece is built by a voxel brick thrown at its slot: the outline goes solid and the content wipes in.
      const build = (i: number) => {
        const brick = bricks()[i % bricks().length]
        gsap.fromTo(brick, { x: at.claude.x, y: at.claude.y - 20, autoAlpha: 1, scale: 1, rotation: 0 }, { x: spots[i].x, y: spots[i].y, rotation: 180, duration: 0.2, ease: 'power1.in', onComplete: () => { gsap.set(brick, { autoAlpha: 0 }) } })
        // Started when the brick lands, through a tracked timer, so a strike in between cancels it cleanly.
        timers.push(gsap.delayedCall(0.2, () => {
          gsap.set(outline[i], { borderStyle: 'solid', borderColor: quill.color, backgroundColor: `${quill.color}26` })
          gsap.to(outline[i], { backgroundColor: `${quill.color}00`, duration: 0.5, delay: 0.1 })
          gsap.fromTo(pieces[i], { opacity: 1, clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'power2.out' })
        }))
      }

      // 3. Quill works down the section, building one piece after another.
      narrate(`${quill.name} writes ${section.id}`, 3)
      act('claude', { mood: 'working', busy: true })
      for (let i = 0; i < count; i++) {
        if (i % stride === 0) await go('claude', beside(i, -1))
        if (me.dead) return
        build(i)
        await wait(0.13)
        if (me.dead) return
      }
      await wait(0.45)
      if (me.dead) return
      act('claude', { mood: 'idle', busy: false })

      // 4. Boo follows, approving each piece (its outline turns green). One is wrong.
      const bad = Math.min(count - 1, Math.floor(count * 0.6))
      const approve = async (start: number, end: number) => {
        for (let i = start; i < end; i++) {
          if (i % stride === 0) await go('codex', beside(i, 1))
          if (me.dead) return
          gsap.set(outline[i], { borderColor: boo.color })
          gsap.fromTo(outline[i], { scale: 1.04 }, { scale: 1, duration: 0.2 })
          await wait(0.07)
          if (me.dead) return
        }
      }
      narrate(`${boo.name} reviews it`, 4)
      act('codex', { mood: 'focused', busy: true })
      await approve(0, bad)
      if (me.dead) return
      await go('codex', beside(bad, 1))
      gsap.set(outline[bad], { borderColor: REJECTED, backgroundColor: `${REJECTED}26` })
      gsap.fromTo(outline[bad], { x: spots[bad].x - 6 }, { x: spots[bad].x, duration: 0.06, repeat: 7, yoyo: true })
      gsap.to(pieces[bad], { opacity: 0.25, duration: 0.2 })
      narrate(`${boo.name}: 1 issue. Back to ${quill.name}.`, 4)
      act('codex', { busy: false })
      // The writer jumps at the news, then comes back and builds that piece again.
      act('claude', { mood: 'surprised', alert: true })
      gsap.fromTo(bot('claude'), { y: 0 }, { y: -12, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
      await wait(0.9)
      if (me.dead) return
      act('claude', { mood: 'working', alert: false, busy: true })
      await go('claude', beside(bad, -1))
      if (me.dead) return
      gsap.killTweensOf(outline[bad])
      gsap.set(outline[bad], { x: spots[bad].x - 3 })
      build(bad)
      await wait(0.7)
      if (me.dead) return
      act('claude', { mood: 'idle', busy: false })
      act('codex', { busy: true })
      await approve(bad, count)
      if (me.dead) return
      act('codex', { mood: 'happy', busy: false })
      await wait(0.4)
      if (me.dead) return

      // 5. Each gate pulses through every piece and ticks off on a stamp on the section's rule.
      act('orca', { mood: 'idle' })
      act('codex', { mood: 'idle' })
      const gates = ['tsc', 'test', 'build']
      for (let i = 0; i < gates.length; i++) {
        const done = gates.slice(0, i + 1).map((g) => `${g} ✓`).join('  ')
        narrate(`gates: ${done}`, 5)
        stamp.textContent = done
        gsap.fromTo(stamp, { autoAlpha: 1, scale: 1.25 }, { scale: 1, duration: 0.25, ease: 'back.out(2)' })
        await gsap.fromTo(outline, { opacity: 0.35 }, { opacity: 1, duration: 0.2, stagger: 0.012 }).then()
        if (me.dead) return
      }

      // 6. Shipped: the outlines let go and the section is itself again.
      narrate('me: ship it. Deployed to tiendat.work.', 6)
      stamp.textContent = '✓ shipped'
      gsap.fromTo(stamp, { scale: 1.6 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' })
      gsap.to(outline, { autoAlpha: 0, scale: 1.04, duration: 0.4, stagger: 0.015 })
      AGENTS.forEach(({ id }, i) => {
        act(id, { mood: 'happy' })
        go(id, onRule(0.2 + i * 0.3), 0.5)
      })
      await wait(2.8)
      if (me.dead) return
      gsap.to([stamp, chip], { autoAlpha: 0, duration: 0.3 })
      await gsap.to(AGENTS.map(({ id }) => bot(id)), { scale: 0, duration: 0.3, ease: 'back.in(2)', stagger: 0.06 }).then()
      if (me.dead) return
      strike()
    }

    // The section to build when none is named: the first whose top rule is clear in the view, else "How I build".
    const pick = () => {
      const list = sections()
      return list.find((s) => { const top = s.getBoundingClientRect().top; return top >= HEADROOM && top <= window.innerHeight - FOOTROOM }) ??
        document.getElementById('how-i-build') ?? list[0] ?? null
    }
    const onRun = (e: Event) => {
      const id = (e as CustomEvent<{ section?: string } | undefined>).detail?.section
      const section = (id ? document.getElementById(id) : null) ?? pick()
      if (section) story(section)
    }
    // Whichever character is dropped, the whole crew comes to build the section it landed on.
    const onDrop = (e: Event) => {
      const { x, y } = (e as CustomEvent<{ id: AgentId; x: number; y: number }>).detail
      const section = document.elementsFromPoint(x, y).map((el) => el.closest<HTMLElement>('main > section[id]')).find(Boolean)
      if (section) story(section)
    }
    // Scrolled out of sight there is nobody to play to: stop, and put everything back.
    const leaver = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && !run.dead) strike() })
    leaver.observe(chip)
    window.addEventListener(RUN_EVENT, onRun)
    window.addEventListener(DROP_EVENT, onDrop)
    window.addEventListener('resize', strike)

    return () => {
      leaver.disconnect()
      window.removeEventListener(RUN_EVENT, onRun)
      window.removeEventListener(DROP_EVENT, onDrop)
      window.removeEventListener('resize', strike)
      strike()
    }
  }, [still])

  if (still) return null

  return (
    <div ref={rootRef} aria-hidden='true' className='pointer-events-none absolute inset-0 z-30 font-ibm'>
      {Array.from({ length: MAX_PIECES }, (_, i) => <span key={i} data-frame='' className='invisible absolute left-0 top-0 border' />)}
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} data-brick='' className='invisible absolute left-0 top-0' style={{ color: BY_ID.claude.color }}>
          <Brick />
        </span>
      ))}
      <span data-part='chip' className='invisible absolute left-0 top-0 w-max border bg-background px-1.5 py-0.5 text-[11px] leading-4 text-muted-foreground shadow-sm'>{line}</span>
      <span data-part='stamp' className='invisible absolute left-0 top-0 w-max border bg-background px-1.5 py-0.5 text-[11px] leading-4' style={{ borderColor: BY_ID.codex.color, color: BY_ID.codex.color }}>✓ shipped</span>
      {([['ticket', 'ticket: build', 'currentColor'], ['write', 'task: write', BY_ID.claude.color], ['review', 'task: review', BY_ID.codex.color]] as const).map(([kind, text, color]) => (
        <span key={kind} data-card={kind} className='invisible absolute left-0 top-0 flex w-max items-center gap-1.5 border bg-background px-1.5 py-1 text-[11px] leading-none shadow-sm' style={{ borderColor: color }}>
          <span className='size-1.5' style={{ backgroundColor: color }} />
          {text}
        </span>
      ))}
      {AGENTS.map(({ id, avatar, color }, i) => (
        <span key={id} data-actor={id} className='invisible absolute left-0 top-0'>
          <span data-bot='' className='absolute -left-[26px] -top-[26px] block origin-bottom'>
            {/* Only drawn while a scene is on, so an idle page pays nothing for them. */}
            {live && <AgentDot type={avatar} color={color} size={ACTOR} seed={i / AGENTS.length} paused={hidden} interactive={false} {...cast[id]} />}
          </span>
        </span>
      ))}
    </div>
  )
}

// Both halves of the on-page agents, for the page to mount once.
export function AgentSwarm () {
  return (
    <>
      <AgentScene />
      <AgentDock />
    </>
  )
}

// The same cast as real controls in "How I build": who each agent is, the build as text, and the switches.
export function AgentCast () {
  const { on, roomy, still } = usePrefs()
  const hidden = useTabHidden()
  const [open, setOpen] = useState<AgentId | null>(null)
  const [status, setStatus] = useState('')
  const [seen, setSeen] = useState(false)
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
            className={`flex items-center gap-2.5 border px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50 ${open === id ? 'border-foreground/60 bg-muted/50' : ''}`}
          >
            <AgentDot type={avatar} color={color} size={44} seed={i / AGENTS.length} paused={still || hidden || !seen} mood={open === id ? 'happy' : 'idle'} />
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
