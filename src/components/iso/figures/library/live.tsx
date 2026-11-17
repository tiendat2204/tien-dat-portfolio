'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureInput, ProgressRef } from '@/components/iso/figure-contract'
import { libraryModel } from '@/components/iso/figures/library/model'
import { CARD_PATHS, CatalogDrawing, HOOK_PATHS, LibraryStatic, poseOf, SETTLED_READOUT, type CardKey, type HookKey, type Moves } from '@/components/iso/figures/library/static'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'

type Moving = keyof Moves
type CardPath = (typeof CARD_PATHS)[number]
type HookPath = (typeof HOOK_PATHS)[number]
const MOVING = ['drawer', 'peek', 'stamp', 'trolley'] as const satisfies readonly Moving[]

const JOG_STEP = 0.5
const KEYS_LABEL = 'Library card catalog. Scroll to check a book out: a drawer opens, a hoist carries a catalog card to the loan desk and the date stamp records the loan. Hover or use the left arrow key to pull the neighbouring drawer, the right arrow or Escape to push it back.'

const START = libraryModel.init()
const START_POSE = poseOf(START)

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

// The scroll-driven figure. One frame loop steps the pure model and writes transforms, the card's paths and the
// readout straight onto the DOM; React renders it once.
export function LibraryLive ({ progressRef }: { progressRef: ProgressRef }) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const slots = useRef<Record<Moving, SVGGElement[]>>({ drawer: [], peek: [], stamp: [], trolley: [] })
  const cards = useRef<Record<CardKey, Partial<Record<CardPath, SVGPathElement | null>>>>({ 'card.low': {}, 'card.high': {} })
  const hooks = useRef<Record<HookKey, Partial<Record<HookPath, SVGPathElement | null>>>>({ 'hook.low': {}, 'hook.high': {} })
  const state = useRef(START)
  const pointer = useRef<number | null>(null)
  const jog = useRef(0)
  const drawn = useRef('')

  const slotRef = useCallback((move: Moving) => (node: SVGGElement | null) => {
    if (node && !slots.current[move].includes(node)) slots.current[move].push(node)
  }, [])
  const cardRef = useCallback((key: CardKey) => (name: CardPath) => (node: SVGPathElement | null) => {
    cards.current[key][name] = node
  }, [])
  const hookRef = useCallback((key: HookKey) => (name: HookPath) => (node: SVGPathElement | null) => {
    hooks.current[key][name] = node
  }, [])

  // The model reads only pointer.x: a hover's x across the figure, or the arrow keys' jog when nobody hovers.
  const inputOf = (): FigureInput => {
    const x = pointer.current ?? (jog.current ? jog.current : null)
    return { progress: progressRef.current, pointer: x === null ? null : { x, y: 0 } }
  }

  useLoop((dt) => {
    const next = libraryModel.step(state.current, dt, inputOf())
    state.current = next
    const key = `${next.flow}|${next.peek}|${next.recorded}`
    // Keep polling while near the viewport (useLoop stops it offscreen): scroll progress arrives through the ref, not
    // through React, so a settled frame only skips the DOM writes.
    if (key === drawn.current) return true
    drawn.current = key
    const pose = poseOf(next)
    for (const move of MOVING) {
      for (const node of slots.current[move]) node.setAttribute('transform', pose.moves[move])
    }
    for (const slot of ['card.low', 'card.high'] as const) {
      const paths = pose.cards[slot]
      for (const name of CARD_PATHS) {
        const node = cards.current[slot][name]
        if (node && node.getAttribute('d') !== paths[name]) node.setAttribute('d', paths[name])
      }
    }
    for (const slot of ['hook.low', 'hook.high'] as const) {
      const paths = pose.hooks[slot]
      for (const name of HOOK_PATHS) {
        const node = hooks.current[slot][name]
        if (node && node.getAttribute('d') !== paths[name]) node.setAttribute('d', paths[name])
      }
    }
    say(libraryModel.readout(next))
    return true
  }, active)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width) return
    pointer.current = clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1)
  }

  // Left pulls the neighbouring drawer out in two steps, right pushes it back.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') jog.current = clamp(jog.current - JOG_STEP, -1, 0)
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') jog.current = clamp(jog.current + JOG_STEP, -1, 0)
    else if (event.key === 'Escape' || event.key === 'Home') jog.current = 0
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={anchor}
      className='catalog'
      role='group'
      tabIndex={0}
      aria-label={KEYS_LABEL}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointer.current = null }}
      onPointerCancel={() => { pointer.current = null }}
      onKeyDown={onKeyDown}
      onBlur={() => { jog.current = 0 }}
    >
      <CatalogDrawing moves={START_POSE.moves} cards={START_POSE.cards} hooks={START_POSE.hooks} slotRef={slotRef} cardRef={cardRef} hookRef={hookRef} />
    </div>
  )
}

// Reduced motion: the settled pose, with its readout written once.
export function LibraryStill () {
  const { anchor, say } = useReadout<HTMLDivElement>()
  useEffect(() => say(SETTLED_READOUT), [say])
  return (
    <div ref={anchor} className='catalog'>
      <LibraryStatic />
    </div>
  )
}
