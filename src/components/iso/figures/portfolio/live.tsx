'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureInput, ProgressRef } from '@/components/iso/figure-contract'
import { INK_FULL, inkOf, movesOf } from '@/components/iso/figures/portfolio/geometry'
import { portfolioModel, poseOf, STROKES } from '@/components/iso/figures/portfolio/model'
import { PlotterDrawing, PortfolioStatic, SETTLED_READOUT } from '@/components/iso/figures/portfolio/static'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'

type Moving = 'gantry' | 'head' | 'pen'

const JOG_STEP = 0.5
const KEYS_LABEL = 'Drafting plotter. Scroll to draft the page layout; hover or use the arrow keys to lift the pen and jog the gantry, Escape to let it settle.'

const START = portfolioModel.init()
const START_POSE = poseOf(START)
const START_MOVES = movesOf(START_POSE.at, START_POSE.lift, START_POSE.nudge)
const START_INK = STROKES.map(() => '')

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

// The scroll-driven figure. One frame loop steps the pure model and writes transforms, ink paths and the readout
// straight onto the DOM; React renders it once.
export function PortfolioLive ({ progressRef }: { progressRef: ProgressRef }) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const slots = useRef<Record<Moving, SVGGElement[]>>({ gantry: [], head: [], pen: [] })
  const inks = useRef<(SVGPathElement | null)[]>([])
  const state = useRef(START)
  const pointer = useRef<FigureInput['pointer']>(null)
  const jog = useRef(0)
  const drawn = useRef('')

  const slotRef = useCallback((move: Moving) => (node: SVGGElement | null) => {
    if (node && !slots.current[move].includes(node)) slots.current[move].push(node)
  }, [])
  const inkRef = useCallback((index: number) => (node: SVGPathElement | null) => {
    inks.current[index] = node
  }, [])

  const inputOf = (): FigureInput => ({
    progress: progressRef.current,
    pointer: pointer.current ?? (jog.current ? { x: jog.current, y: 0 } : null),
  })

  useLoop((dt) => {
    const input = inputOf()
    const next = portfolioModel.step(state.current, dt, input)
    state.current = next
    const key = `${next.draft}|${next.hover}|${next.nudge}`
    // Keep polling while near the viewport (useLoop stops it offscreen): scroll progress arrives through the ref, not
    // through React, so a settled frame only skips the DOM writes.
    if (key === drawn.current) return true
    drawn.current = key
    const pose = poseOf(next)
    const moves = movesOf(pose.at, pose.lift, pose.nudge)
    for (const move of ['gantry', 'head', 'pen'] as const) {
      for (const node of slots.current[move]) node.setAttribute('transform', moves[move])
    }
    inks.current.forEach((node, index) => {
      if (!node) return
      const d = index < pose.stroke ? INK_FULL[index] : index === pose.stroke ? inkOf(pose.reach) : ''
      if (node.getAttribute('d') !== d) node.setAttribute('d', d)
    })
    say(portfolioModel.readout(next))
    return true
  }, active)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    if (!box.width || !box.height) return
    pointer.current = {
      x: clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1),
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
      className='plotter'
      role='group'
      tabIndex={0}
      aria-label={KEYS_LABEL}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointer.current = null }}
      onPointerCancel={() => { pointer.current = null }}
      onKeyDown={onKeyDown}
      onBlur={() => { jog.current = 0 }}
    >
      <PlotterDrawing moves={START_MOVES} ink={START_INK} slotRef={slotRef} inkRef={inkRef} />
    </div>
  )
}

// Reduced motion: the settled pose, with its readout written once.
export function PortfolioStill () {
  const { anchor, say } = useReadout<HTMLDivElement>()
  useEffect(() => say(SETTLED_READOUT), [say])
  return (
    <div ref={anchor} className='plotter'>
      <PortfolioStatic />
    </div>
  )
}
