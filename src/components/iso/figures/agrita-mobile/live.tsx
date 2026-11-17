'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureInput, ProgressRef } from '@/components/iso/figure-contract'
import { movesOf, type Move } from '@/components/iso/figures/agrita-mobile/geometry'
import { poseOf, agritaMobileModel } from '@/components/iso/figures/agrita-mobile/model'
import { SETTLED_READOUT, StationDrawing, AgritaMobileStatic } from '@/components/iso/figures/agrita-mobile/static'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'

type Moving = Exclude<Move, 'still'>

const MOVING: Moving[] = ['card', 'mark', 'head', 'collar']
const JOG_STEP = 0.5
const KEYS_LABEL = 'Field journal station. Scroll to stamp a journal card and sync it to the rack; move the pointer away from the uplink mast or use the arrow keys to drop the signal and keep the card in the outbox, Escape to restore it.'

const START = agritaMobileModel.init()
const START_POSE = poseOf(START)
const START_MOVES = movesOf(START_POSE)

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

// The scroll-driven figure. One frame loop steps the pure model and writes transforms, the stamp mark's visibility and
// the readout straight onto the DOM; React renders it once.
export function AgritaMobileLive ({ progressRef }: { progressRef: ProgressRef }) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const slots = useRef<Record<Moving, SVGGElement[]>>({ card: [], mark: [], head: [], collar: [] })
  const state = useRef(START)
  const pointer = useRef<FigureInput['pointer']>(null)
  const jog = useRef(0)
  const drawn = useRef('')

  const slotRef = useCallback((move: Moving) => (node: SVGGElement | null) => {
    if (node && !slots.current[move].includes(node)) slots.current[move].push(node)
  }, [])

  const inputOf = (): FigureInput => ({
    progress: progressRef.current,
    pointer: pointer.current ?? (jog.current ? { x: jog.current, y: 0 } : null),
  })

  useLoop((dt) => {
    const next = agritaMobileModel.step(state.current, dt, inputOf())
    state.current = next
    const readout = agritaMobileModel.readout(next)
    const key = `${next.phase}|${next.signal}|${next.flush}|${readout}`
    // Keep polling while near the viewport (useLoop stops it offscreen): scroll progress arrives through the ref, not
    // through React, so a settled frame only skips the DOM writes.
    if (key === drawn.current) return true
    drawn.current = key
    const pose = poseOf(next)
    const moves = movesOf(pose)
    for (const move of MOVING) {
      for (const node of slots.current[move]) node.setAttribute('transform', moves[move])
    }
    for (const node of slots.current.mark) node.setAttribute('visibility', pose.stamped ? 'visible' : 'hidden')
    say(readout)
    return true
  }, active)

  // The signal is the pointer's offset from the uplink mast, in half-widths of the figure.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const lamp = anchor.current?.querySelector('[data-part="mast.lamp"]')?.getBoundingClientRect()
    if (!box.width || !lamp) return
    pointer.current = {
      x: clamp((event.clientX - (lamp.left + lamp.width / 2)) / (box.width / 2), -1, 1),
      y: clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1, 1),
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') jog.current = clamp(jog.current - JOG_STEP, -1, 1)
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') jog.current = clamp(jog.current + JOG_STEP, -1, 1)
    else if (event.key === 'Escape' || event.key === 'Home') jog.current = 0
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={anchor}
      className='station'
      role='group'
      tabIndex={0}
      aria-label={KEYS_LABEL}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointer.current = null }}
      onPointerCancel={() => { pointer.current = null }}
      onKeyDown={onKeyDown}
      onBlur={() => { jog.current = 0 }}
    >
      <StationDrawing moves={START_MOVES} stamped={START_POSE.stamped} slotRef={slotRef} />
    </div>
  )
}

// Reduced motion: the settled pose, with its readout written once.
export function AgritaMobileStill () {
  const { anchor, say } = useReadout<HTMLDivElement>()
  useEffect(() => say(SETTLED_READOUT), [say])
  return (
    <div ref={anchor} className='station'>
      <AgritaMobileStatic />
    </div>
  )
}
