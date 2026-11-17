'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureInput, ProgressRef } from '@/components/iso/figure-contract'
import { movesOf, turnPaths, type Turning } from '@/components/iso/figures/betatruyen/geometry'
import { betatruyenModel, poseOf } from '@/components/iso/figures/betatruyen/model'
import { BetatruyenStatic, DeskDrawing, SETTLED_READOUT, type Moving } from '@/components/iso/figures/betatruyen/static'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'

const JOG_STEP = 0.5
const KEYS_LABEL = 'Story forum desk. Scroll to read a page, pin a comment, rate the story and rank it up; hover or use the arrow keys to nudge the ranking lever, Escape to let it settle.'
const MOVING: Moving[] = ['card', 'pin', 'rise', 'fall', 'panBack', 'panFront', 'knob']
const TURNING: Turning[] = ['leaf', 'beam', 'lever', 'dial']

const START = betatruyenModel.init()
const START_POSE = poseOf(START)
const START_MOVES = movesOf(START_POSE)
const START_TURNS = turnPaths(START_POSE)

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

// The scroll-driven figure. One frame loop steps the pure model and writes transforms, the turning parts' paths and
// the readout straight onto the DOM; React renders it once.
export function BetatruyenLive ({ progressRef }: { progressRef: ProgressRef }) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const slots = useRef<Record<Moving, SVGGElement[]>>({ card: [], pin: [], rise: [], fall: [], panBack: [], panFront: [], knob: [] })
  const turns = useRef<Partial<Record<Turning, SVGGElement>>>({})
  const state = useRef(START)
  const pointer = useRef<FigureInput['pointer']>(null)
  const jog = useRef(0)
  const drawn = useRef('')

  const slotRef = useCallback((move: Moving) => (node: SVGGElement | null) => {
    if (node && !slots.current[move].includes(node)) slots.current[move].push(node)
  }, [])
  const turnRef = useCallback((key: Turning) => (node: SVGGElement | null) => {
    if (node) turns.current[key] = node
  }, [])

  const inputOf = (): FigureInput => ({
    progress: progressRef.current,
    pointer: pointer.current ?? (jog.current ? { x: jog.current, y: 0 } : null),
  })

  useLoop((dt) => {
    const next = betatruyenModel.step(state.current, dt, inputOf())
    state.current = next
    const key = `${next.run}|${next.nudge}`
    // Keep polling while near the viewport (useLoop stops it offscreen): scroll progress arrives through the ref, not
    // through React, so a settled frame only skips the DOM writes.
    if (key === drawn.current) return true
    drawn.current = key
    const pose = poseOf(next)
    const moves = movesOf(pose)
    for (const move of MOVING) for (const node of slots.current[move]) node.setAttribute('transform', moves[move])
    const paths = turnPaths(pose)
    for (const turn of TURNING) {
      const node = turns.current[turn]
      if (!node) continue
      const { fill, shades, top, crease, outline } = paths[turn]
      const ds = [fill, ...[0, 1, 2, 3].map(shade => shades[shade] ?? ''), top, crease ?? '', outline]
      node.querySelectorAll('path').forEach((path, index) => path.setAttribute('d', ds[index] ?? ''))
    }
    say(betatruyenModel.readout(next))
    return true
  }, active)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width) return
    pointer.current = { x: clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1), y: 0 }
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
      className='forum-desk'
      role='group'
      tabIndex={0}
      aria-label={KEYS_LABEL}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointer.current = null }}
      onPointerCancel={() => { pointer.current = null }}
      onKeyDown={onKeyDown}
      onBlur={() => { jog.current = 0 }}
    >
      <DeskDrawing moves={START_MOVES} turns={START_TURNS} slotRef={slotRef} turnRef={turnRef} />
    </div>
  )
}

// Reduced motion: the settled pose, with its readout written once.
export function BetatruyenStill () {
  const { anchor, say } = useReadout<HTMLDivElement>()
  useEffect(() => say(SETTLED_READOUT), [say])
  return (
    <div ref={anchor} className='forum-desk'>
      <BetatruyenStatic />
    </div>
  )
}
