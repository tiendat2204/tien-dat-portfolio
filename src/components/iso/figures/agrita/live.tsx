'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureInput, ProgressRef } from '@/components/iso/figure-contract'
import { movesOf } from '@/components/iso/figures/agrita/geometry'
import { agritaModel, poseOf } from '@/components/iso/figures/agrita/model'
import { AgritaStatic, LineDrawing, SETTLED_READOUT, type Shown } from '@/components/iso/figures/agrita/static'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'

const JOG_STEP = 0.5
const KEYS_LABEL = 'Traceability line. Scroll to carry a harvest lot along the belt, under the recording arch, to the label printer; hover or use the arrow keys to jog the crate on the belt, Escape to let it settle.'

const START = agritaModel.init()
const START_POSE = poseOf(START)
const START_MOVES = movesOf(START_POSE.x, START_POSE.press)
const START_SHOWN: Shown = { label: START_POSE.label, lamp: START_POSE.recorded }

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

// The scroll-driven figure. One frame loop steps the pure model and writes transforms, opacities and the readout
// straight onto the DOM; React renders it once.
export function AgritaLive ({ progressRef }: { progressRef: ProgressRef }) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const slots = useRef<Map<string, SVGGElement>>(new Map())
  const state = useRef(START)
  const pointer = useRef<FigureInput['pointer']>(null)
  const jog = useRef(0)
  const drawn = useRef('')

  const slotRef = useCallback((key: string) => (node: SVGGElement | null) => {
    if (node) slots.current.set(key, node)
    else slots.current.delete(key)
  }, [])

  useLoop((dt) => {
    const input: FigureInput = {
      progress: progressRef.current,
      pointer: pointer.current ?? (jog.current ? { x: jog.current, y: 0 } : null),
    }
    const next = agritaModel.step(state.current, dt, input)
    state.current = next
    const key = `${next.run}|${next.jog}`
    // Keep polling while near the viewport (useLoop stops it offscreen): scroll progress arrives through the ref, not
    // through React, so a settled frame only skips the DOM writes.
    if (key === drawn.current) return true
    drawn.current = key
    const pose = poseOf(next)
    const moves = movesOf(pose.x, pose.press)
    const shown: Shown = { label: pose.label, lamp: pose.recorded }
    for (const node of slots.current.values()) {
      const move = node.dataset.move
      if (move === 'crate' || move === 'pad') node.setAttribute('transform', moves[move])
      const show = node.dataset.show
      if (show === 'label' || show === 'lamp') {
        if (shown[show]) node.removeAttribute('opacity')
        else node.setAttribute('opacity', '0')
      }
    }
    say(agritaModel.readout(next))
    return true
  }, active)

  // Only the pointer's x is read: it jogs the crate along the belt.
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
      className='trace-line'
      role='group'
      tabIndex={0}
      aria-label={KEYS_LABEL}
      onPointerMove={onPointerMove}
      onPointerLeave={() => { pointer.current = null }}
      onPointerCancel={() => { pointer.current = null }}
      onKeyDown={onKeyDown}
      onBlur={() => { jog.current = 0 }}
    >
      <LineDrawing moves={START_MOVES} shown={START_SHOWN} slotRef={slotRef} />
    </div>
  )
}

// Reduced motion: the settled pose, with its readout written once.
export function AgritaStill () {
  const { anchor, say } = useReadout<HTMLDivElement>()
  useEffect(() => say(SETTLED_READOUT), [say])
  return (
    <div ref={anchor} className='trace-line'>
      <AgritaStatic />
    </div>
  )
}
