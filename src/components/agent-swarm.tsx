'use client'

import { gsap } from 'gsap'
import { useLenis } from 'lenis/react'
import Link from 'next/link'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { AGENTS, BUILD_STEPS, type AgentId } from '@/data/agents'
import { sectionAt, wallSlots } from '@/lib/agent-cursors-plan'
import { AgentDot, type AgentDotMood } from '@/registry/AgentDot/agent-dot'

/*
  The home page's agents: Ori, Quill and Boo (AgentDot characters). Nothing happens unless the visitor asks.

  - AgentDock: the three sit small in the bottom-right corner, in the empty gutter beside the content (so only on
    wide screens). They hop when a new section is reached and say a line when poked. Its ▶ starts a build, and a
    character can be picked up and dropped on a section.
  - AgentScene: where the work shows, standing on the top rule of a section of the page. A build (BUILD_STEPS) is a
    wall of voxel bricks, the same cubes as the hero figure: Ori marks out the slots, Quill lays a brick in each,
    Boo checks them and kicks out a bad one, the gates ripple through the wall, and it ships. A dropped character
    does only its own part. When it is over the wall goes and the cast returns to the dock.
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

// The wall is narrower where the section is, as on a phone.
const WALL = { cols: 10, narrowCols: 6, rows: 3 }
const BRICK = { w: 18, h: 20, rise: 11 }
// The scene's box sits on a section so that `ground` is the section's own top rule.
const STAGE = { height: 150, ground: 150, actor: 52 }
// A section's top rule must be this far below the header, and this far above the bottom, to build on it.
const HEADROOM = 230
const FOOTROOM = 140

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

// Where the work shows: on the top rule of a section of the page, and only when asked for.
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
    const box = root.querySelector<HTMLElement>('[data-stage]')!

    const allBricks = () => gsap.utils.toArray<HTMLElement>('[data-brick]', box)
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
    const narrate = (text: string, step?: number) => {
      const full = step ? `${step}/${BUILD_STEPS.length}  ${text}` : text
      setLine(full)
      // The scene is hidden from assistive tech; AgentCast announces the same line.
      window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: full }))
    }

    // Everything is laid out from the section's width, so the scene works at any size.
    const layout = () => {
      const width = box.clientWidth
      const cols = width < 520 ? WALL.narrowCols : WALL.cols
      const wallWidth = cols * BRICK.w + BRICK.w / 2
      const x0 = (width - wallWidth) / 2
      return {
        count: cols * WALL.rows,
        marks: { orca: Math.max(28, x0 - 150), claude: Math.max(76, x0 - 44), codex: Math.min(width - 30, x0 + wallWidth + 96) } as Record<AgentId, number>,
        slots: wallSlots(cols, WALL.rows, BRICK, x0, STAGE.ground - BRICK.h),
        wall: { left: x0, right: x0 + wallWidth, top: STAGE.ground - BRICK.h - (WALL.rows - 1) * BRICK.rise },
      }
    }

    const appear = (id: AgentId, x: number) => {
      at[id] = x
      gsap.set(actor(id), { x, autoAlpha: 1 })
      return gsap.fromTo(bot(id), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(2.6)' }).then()
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

    // Stop whatever is playing and clear the scene away.
    const strike = () => {
      run.dead = true
      timers.forEach((t) => t.kill())
      timers = []
      gsap.killTweensOf(everything())
      gsap.set([...box.querySelectorAll('[data-card], [data-actor]'), stamp], { autoAlpha: 0 })
      gsap.set(allBricks(), { opacity: 0 })
      setCast(resting())
      setLive(false)
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: false }))
    }

    // The end of a run: everything leaves, and the dock gets its cast back.
    const curtain = async (me: { dead: boolean }) => {
      gsap.to([...allBricks(), stamp], { opacity: 0, scale: 0.4, duration: 0.35, stagger: { amount: 0.25, from: 'center' } })
      await gsap.to(AGENTS.map(({ id }) => bot(id)), { scale: 0, duration: 0.3, ease: 'back.in(2)', stagger: 0.06 }).then()
      if (me.dead) return
      strike()
    }

    // Put the scene on a section: scroll the section's top rule into a clear part of the view if it is not, then
    // sit the box on that rule.
    const setUp = async (section: HTMLElement) => {
      strike()
      const me = run = { dead: false }
      let rect = section.getBoundingClientRect()
      if (rect.top < HEADROOM || rect.top > window.innerHeight - FOOTROOM) {
        scrollRef.current?.(window.scrollY + rect.top - window.innerHeight * 0.45)
        await wait(1.1)
        if (me.dead) return null
        rect = section.getBoundingClientRect()
      }
      const origin = root.getBoundingClientRect()
      gsap.set(box, { x: rect.left - origin.left, y: rect.top - origin.top - STAGE.ground, width: rect.width })
      const plan = layout()
      const bricks = allBricks().slice(0, plan.count)
      gsap.set(bricks, { x: (i) => plan.slots[i].x, y: (i) => plan.slots[i].y, visibility: 'visible', opacity: 0, scale: 1, rotation: 0, color: BY_ID.orca.color })
      bricks.forEach((b) => b.toggleAttribute('data-ghost', true))
      gsap.set(stamp, { x: (plan.wall.left + plan.wall.right) / 2, y: plan.wall.top - 16, xPercent: -50, yPercent: -50, scale: 1, opacity: 1 })
      AGENTS.forEach(({ id }) => gsap.set(bot(id), { y: 0, rotation: 0, scale: 1 }))
      setLive(true)
      window.dispatchEvent(new CustomEvent(BUSY_EVENT, { detail: true }))
      return { me, name: section.id, bricks, top: (i: number) => plan.slots[i].y, ...plan }
    }

    const story = async (section: HTMLElement) => {
      const set = await setUp(section)
      if (!set) return
      const { me, bricks, slots, top, marks, wall, count } = set
      const ori = BY_ID.orca
      const quill = BY_ID.claude
      const boo = BY_ID.codex

      await appear('orca', marks.orca)
      if (me.dead) return

      // 1. The ticket flies in from the left, and Ori catches it.
      narrate(`me → ${ori.name}: build tien-dat-profile`, 1)
      await pass('ticket', -40, marks.orca, 'orca', 0.9)
      if (me.dead) return

      // 2. The plan: one dashed slot per brick. Then the ticket becomes two task cards.
      narrate(`${ori.name} plans the wall, then hands out the tasks`, 2)
      act('orca', { mood: 'focused', busy: true })
      await gsap.fromTo(bricks, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, stagger: 0.025 }).then()
      if (me.dead) return
      act('orca', { mood: 'idle', busy: false })
      appear('claude', marks.claude)
      appear('codex', marks.codex)
      await Promise.all([pass('write', marks.orca, marks.claude, 'claude', 0.6), pass('review', marks.orca, marks.codex, 'codex', 0.9)])
      if (me.dead) return
      // Its part is done for now: Ori dozes off until the gates.
      act('orca', { mood: 'asleep' })

      // 3. Quill lays a brick in every slot, course by course.
      narrate(`${quill.name} writes the change`, 3)
      act('claude', { mood: 'working', busy: true })
      const lay = gsap.fromTo(bricks,
        { y: (i) => top(i) - 26, opacity: 0 },
        { y: top, opacity: 1, duration: 0.38, ease: 'bounce.out', immediateRender: false, stagger: { each: 0.055, onStart: tint(quill.color) } })
      await go('claude', wall.left + 30)
      await go('claude', wall.left - 30)
      await lay.then()
      if (me.dead) return
      act('claude', { mood: 'idle', busy: false })

      // 4. Boo checks them one by one and turns each approved brick green; one is wrong.
      const bad = Math.floor(count * 0.57)
      const approve = (start: number, end: number) => gsap.to(bricks.slice(start, end), {
        keyframes: [{ scale: 1.3, duration: 0.07 }, { scale: 1, duration: 0.15 }],
        stagger: { each: 0.05, onStart: tint(boo.color) },
      }).then()
      narrate(`${boo.name} reviews it`, 4)
      act('codex', { mood: 'focused', busy: true })
      await go('codex', wall.right + 40)
      await approve(0, bad)
      if (me.dead) return
      const wrong = bricks[bad]
      wrong.style.color = REJECTED
      gsap.fromTo(wrong, { rotation: -14 }, { rotation: 14, duration: 0.07, repeat: 7, yoyo: true })
      narrate(`${boo.name}: 1 issue. Back to ${quill.name}.`, 4)
      act('codex', { busy: false })
      // The writer jumps at the news.
      act('claude', { mood: 'surprised', alert: true })
      gsap.fromTo(bot('claude'), { y: 0 }, { y: -12, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
      await wait(0.9)
      if (me.dead) return
      // The bad brick is kicked out and a new one laid.
      gsap.to(wrong, { x: '+=70', y: '-=46', rotation: 260, opacity: 0, duration: 0.55, ease: 'power2.out' })
      act('claude', { mood: 'working', alert: false, busy: true })
      await go('claude', wall.left + 10, 0.5)
      gsap.killTweensOf(wrong)
      wrong.style.color = quill.color
      await gsap.fromTo(wrong, { x: slots[bad].x, y: top(bad) - 26, rotation: 0, opacity: 0 }, { y: top(bad), opacity: 1, duration: 0.38, ease: 'bounce.out' }).then()
      if (me.dead) return
      act('claude', { mood: 'idle', busy: false })
      go('claude', marks.claude, 0.5)
      act('codex', { busy: true })
      await approve(bad, count)
      if (me.dead) return
      act('codex', { mood: 'happy', busy: false })
      await wait(0.5)
      if (me.dead) return

      // 5. Each gate sends a ripple through the wall.
      act('orca', { mood: 'idle' })
      act('codex', { mood: 'idle' })
      const gates = ['tsc', 'test', 'build']
      for (let i = 0; i < gates.length; i++) {
        narrate(`gates: ${gates.slice(0, i + 1).map((g) => `${g} ✓`).join('  ')}`, 5)
        await gsap.to(bricks, { keyframes: [{ y: '-=6', duration: 0.1, ease: 'power2.out' }, { y: '+=6', duration: 0.16, ease: 'power2.in' }], stagger: 0.012 }).then()
        if (me.dead) return
      }

      // 6. Shipped: the stamp lands on the wall, everyone cheers, and then it is all cleared away.
      narrate('me: ship it. Deployed to tiendat.work.', 6)
      stamp.textContent = '✓ shipped'
      gsap.fromTo(stamp, { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' })
      go('codex', marks.codex, 0.5)
      AGENTS.forEach(({ id }) => act(id, { mood: 'happy' }))
      await wait(3)
      if (me.dead) return
      await curtain(me)
    }

    // One character, dropped on a section, does only its own part of the build there.
    const solo = async (id: AgentId, section: HTMLElement) => {
      const set = await setUp(section)
      if (!set) return
      const { me, bricks, top, marks, name } = set
      const { name: who, color } = BY_ID[id]
      await appear(id, marks[id])
      if (me.dead) return
      if (id === 'orca') {
        narrate(`${who} plans ${name}`)
        act(id, { mood: 'focused', busy: true })
        await gsap.fromTo(bricks, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.22, stagger: 0.03 }).then()
      } else if (id === 'claude') {
        narrate(`${who} writes ${name}`)
        act(id, { mood: 'working', busy: true })
        await gsap.fromTo(bricks, { y: (i) => top(i) - 26, opacity: 0 }, { y: top, opacity: 1, duration: 0.38, ease: 'bounce.out', stagger: { each: 0.05, onStart: tint(color) } }).then()
      } else {
        // There has to be something to review: a finished wall, which Boo then goes over.
        narrate(`${who} reviews ${name}`)
        bricks.forEach((b) => b.removeAttribute('data-ghost'))
        gsap.set(bricks, { opacity: 1, color: BY_ID.claude.color })
        act(id, { mood: 'focused', busy: true })
        await gsap.to(bricks, { keyframes: [{ scale: 1.3, duration: 0.07 }, { scale: 1, duration: 0.15 }], stagger: { each: 0.05, onStart: tint(color) } }).then()
        if (me.dead) return
        stamp.textContent = '✓ reviewed'
        gsap.fromTo(stamp, { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' })
      }
      if (me.dead) return
      act(id, { mood: 'happy', busy: false })
      await wait(1.8)
      if (me.dead) return
      await curtain(me)
    }

    // The section to build on when none is named: the first whose top rule is clear in the view, else "How I build".
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
    const onDrop = (e: Event) => {
      const { id, x, y } = (e as CustomEvent<{ id: AgentId; x: number; y: number }>).detail
      const section = document.elementsFromPoint(x, y).map((el) => el.closest<HTMLElement>('main > section[id]')).find(Boolean)
      if (section) solo(id, section)
    }
    // Off screen there is nobody to play to: stop, and give the dock its cast back.
    const leaver = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && !run.dead) strike() })
    leaver.observe(box)
    window.addEventListener(RUN_EVENT, onRun)
    window.addEventListener(DROP_EVENT, onDrop)

    return () => {
      leaver.disconnect()
      window.removeEventListener(RUN_EVENT, onRun)
      window.removeEventListener(DROP_EVENT, onDrop)
      strike()
    }
  }, [still])

  if (still) return null

  return (
    <div ref={rootRef} aria-hidden='true' className='pointer-events-none absolute inset-0 z-30 font-ibm'>
      <div data-stage='' className='absolute left-0 top-0' style={{ height: STAGE.height }}>
        {live && line && <span className='absolute left-2 top-2 border bg-background px-1.5 py-0.5 text-[11px] leading-4 text-muted-foreground shadow-sm'>{line}</span>}
        {Array.from({ length: WALL.cols * WALL.rows }, (_, i) => (
          <span key={i} data-brick='' className='invisible absolute left-0 top-0'>
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
        {AGENTS.map(({ id, avatar, color }, i) => (
          <span key={id} data-actor={id} className='invisible absolute left-0' style={{ top: STAGE.ground - STAGE.actor }}>
            <span data-bot='' className='block origin-bottom -translate-x-1/2'>
              {/* Only drawn while a scene is on, so an idle page pays nothing for them. */}
              {live && <AgentDot type={avatar} color={color} size={STAGE.actor} seed={i / AGENTS.length} paused={hidden} interactive={false} {...cast[id]} />}
            </span>
          </span>
        ))}
      </div>
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
