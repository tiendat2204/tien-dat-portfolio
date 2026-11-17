'use client'

import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureInput, ProgressRef } from '@/components/iso/figure-contract'
import { flapPaths, MARKS, movesOf } from '@/components/iso/figures/eoffice/geometry'
import { eofficeModel, poseOf } from '@/components/iso/figures/eoffice/model'
import { EofficeStatic, flapDs, SETTLED_READOUT, SorterDrawing, type FlapKey } from '@/components/iso/figures/eoffice/static'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'

// How long an arrow key holds the presses' tap, in seconds.
const KEY_TAP = 0.6
const KEYS_LABEL = 'Document routing sorter. Scroll to route the sheet through the draft, review and approved stamps; hover or press an arrow key to tap the presses, Escape to let them settle.'

const START = eofficeModel.init()
const START_POSE = poseOf(START)
const START_MOVES = movesOf(START_POSE.x, START_POSE.lift)

// The scroll-driven figure. One frame loop steps the pure model and writes transforms, stamp marks, flap paths and the
// readout straight onto the DOM; React renders it once.
export function EofficeLive ({ progressRef }: { progressRef: ProgressRef }) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const sheet = useRef<SVGGElement | null>(null)
  const presses = useRef<(SVGGElement | null)[]>([])
  const flaps = useRef<(SVGGElement | null)[]>([])
  const stamps = useRef<(SVGPathElement | null)[]>([])
  const state = useRef(START)
  const hovering = useRef(false)
  const keyTap = useRef(0)
  const drawn = useRef('')
  const swung = useRef<number[]>([...START_POSE.gates])

  const sheetRef = useCallback((node: SVGGElement | null) => {
    sheet.current = node
  }, [])
  const pressRef = useCallback((index: number) => (node: SVGGElement | null) => {
    presses.current[index] = node
  }, [])
  const flapRef = useCallback((index: number) => (node: SVGGElement | null) => {
    flaps.current[index] = node
  }, [])
  const stampRef = useCallback((index: number) => (node: SVGPathElement | null) => {
    stamps.current[index] = node
  }, [])

  useLoop((dt) => {
    keyTap.current = Math.max(0, keyTap.current - dt)
    const input: FigureInput = { progress: progressRef.current, pointer: hovering.current || keyTap.current > 0 ? { x: 0, y: 0 } : null }
    const next = eofficeModel.step(state.current, dt, input)
    state.current = next
    const key = `${next.travel}|${next.tap}`
    // Keep polling while near the viewport (useLoop stops it offscreen): scroll progress arrives through the ref, not
    // through React, so a settled frame only skips the DOM writes.
    if (key === drawn.current) return true
    drawn.current = key
    const pose = poseOf(next)
    const moves = movesOf(pose.x, pose.lift)
    sheet.current?.setAttribute('transform', moves.sheet)
    presses.current.forEach((node, index) => node?.setAttribute('transform', moves.press[index]))
    stamps.current.forEach((node, index) => {
      const d = pose.stamped[index] ? MARKS[index] : ''
      if (node && node.getAttribute('d') !== d) node.setAttribute('d', d)
    })
    pose.gates.forEach((open, index) => {
      const node = flaps.current[index]
      if (!node || swung.current[index] === open) return
      swung.current[index] = open
      const d = flapDs(flapPaths(index, open))
      for (const path of node.querySelectorAll<SVGPathElement>('path[data-key]')) {
        const name = path.dataset.key as FlapKey
        path.setAttribute('d', d[name])
      }
    })
    say(eofficeModel.readout(next))
    return true
  }, active)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key.startsWith('Arrow')) keyTap.current = KEY_TAP
    else if (event.key === 'Escape' || event.key === 'Home') keyTap.current = 0
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={anchor}
      className='sorter'
      role='group'
      tabIndex={0}
      aria-label={KEYS_LABEL}
      onPointerEnter={() => { hovering.current = true }}
      onPointerLeave={() => { hovering.current = false }}
      onPointerCancel={() => { hovering.current = false }}
      onKeyDown={onKeyDown}
      onBlur={() => { keyTap.current = 0 }}
    >
      <SorterDrawing moves={START_MOVES} stamps={START_POSE.stamped} flaps={START_POSE.gates} sheetRef={sheetRef} pressRef={pressRef} flapRef={flapRef} stampRef={stampRef} />
    </div>
  )
}

// Reduced motion: the settled pose, with its readout written once.
export function EofficeStill () {
  const { anchor, say } = useReadout<HTMLDivElement>()
  useEffect(() => say(SETTLED_READOUT), [say])
  return (
    <div ref={anchor} className='sorter'>
      <EofficeStatic />
    </div>
  )
}
