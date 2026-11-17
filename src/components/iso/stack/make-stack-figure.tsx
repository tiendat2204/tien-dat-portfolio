'use client'

import { useCallback, useEffect, useRef, type CSSProperties, type Ref } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureModule, ProgressRef } from '@/components/iso/figure-contract'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'
import { readoutAt, stackPose, terminalAt } from '@/components/iso/stack/engine'
import { stackArt, type StackArt } from '@/components/iso/stack/geometry'
import { StackChips, StackDrawing, chipOpacity, type GroupRef, type StackView } from '@/components/iso/stack/stack-drawing'
import { TerminalPanel, writeTerminal, type TerminalState } from '@/components/iso/stack/terminal-panel'
import type { StackConfig } from '@/components/iso/stack/types'

import '@/components/iso/stack/stack.css'

// One moment of the figure from scroll progress, through the pure engine. The scan sweeps the board under the
// packet while it travels (not while the stack opens, not once it rests at the top).
function viewAt (config: StackConfig, progress: number): StackView {
  const count = Math.max(1, config.layers.length)
  const pose = stackPose(progress, count)
  const travelling = pose.explode >= 0.999 && (pose.direction === 'down' || pose.packetY > 0)
  const along = count === 1 ? pose.packetY : Math.min(1, Math.max(0, pose.packetY * (count - 1) - pose.active + 0.5))
  return {
    explode: pose.explode,
    packetY: pose.packetY,
    layer: pose.active,
    scan: travelling,
    sweep: pose.direction === 'down' ? along : 1 - along,
  }
}

const labelOf = (config: StackConfig) =>
  `${config.title}: an exploded stack of ${config.layers.length} boards on guide posts, top to bottom ${config.layers.map(layer => layer.label).join(', ')}. ` +
  'A packet rides the bus riser down through the layers and back up; the board it passes lights and the terminal below types the matching code.'

type ViewProps = {
  config: StackConfig
  art: StackArt
  view: StackView
  terminal: TerminalState
  scroll?: boolean
  rootRef?: Ref<HTMLDivElement>
  groupRef?: GroupRef
  chipsRef?: Ref<HTMLDivElement>
  panelRef?: Ref<HTMLDivElement>
}

// The card body: the drawing with its layer chips beside it, and the terminal under them. Pure render, no hooks.
function StackFigureView ({ config, art, view, terminal, scroll, rootRef, groupRef, chipsRef, panelRef }: ViewProps) {
  return (
    <div ref={rootRef} className='stack-figure' style={{ '--stack-ratio': (art.width / art.height).toFixed(4) } as CSSProperties}>
      <div className='stack-row'>
        <div className='stack-art'>
          <StackDrawing art={art} view={view} label={labelOf(config)} groupRef={groupRef} />
          <div ref={chipsRef} className='stack-chips-slot'>
            <StackChips art={art} layers={config.layers} side={config.side} view={view} />
          </div>
        </div>
      </div>
      <TerminalPanel id={config.id} steps={config.steps} state={terminal} scroll={scroll} panelRef={panelRef} />
    </div>
  )
}

function SettledReadout ({ text }: { text: string }) {
  const { anchor, say } = useReadout<HTMLSpanElement>()
  useEffect(() => say(text), [say, text])
  return <span ref={anchor} hidden />
}

const keyOf = (view: StackView, terminal: TerminalState) => {
  const typed = terminal.blocks.map(block => `${block.prompt.length}.${block.typed.map(text => text.length).join('.')}.${block.result === null ? 0 : 1}`).join('|')
  const { block, line, col } = terminal.cursor
  return `${view.explode.toFixed(3)}|${view.packetY.toFixed(4)}|${view.layer}|${view.scan ? 1 : 0}|${view.sweep.toFixed(3)}|${typed}|${block}.${line}.${col}`
}

// The first render is the assembled stack at progress 0 with an empty terminal; the loop's first frame moves it to
// wherever the section already is.
type LiveProps = { config: StackConfig, art: StackArt, progressRef: ProgressRef, start: { view: StackView, terminal: TerminalState } }

// The scroll-driven figure. One frame loop reads the section's progress, runs the pure engine and writes transforms,
// opacities, attributes and text straight onto the DOM; React renders it once.
function StackLive ({ config, art, progressRef, start }: LiveProps) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const groups = useRef<Map<string, SVGGElement>>(new Map())
  const chips = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const drawn = useRef('')

  const groupRef = useCallback((key: string) => (node: SVGGElement | null) => {
    if (node) groups.current.set(key, node)
    else groups.current.delete(key)
  }, [])

  useLoop(() => {
    const progress = progressRef.current
    const view = viewAt(config, progress)
    const terminal = terminalAt(config, progress)
    const key = keyOf(view, terminal)
    // Keep polling while near the viewport (useLoop stops offscreen): progress arrives through the ref, so an unchanged
    // pose only skips the writes.
    if (key === drawn.current) return true
    drawn.current = key
    const plate = art.count - 1 - view.layer
    for (let i = 0; i < art.count; i++) {
      const board = groups.current.get(`board${i}`)
      if (board) {
        board.setAttribute('transform', art.plateMove(i, view.explode))
        board.toggleAttribute('data-active', i === plate)
        board.querySelector('.stack-board')?.toggleAttribute('data-lit', i === plate)
      }
      const scan = groups.current.get(`scan${i}`)
      if (scan) {
        if (i === plate && view.scan) {
          scan.removeAttribute('opacity')
          scan.setAttribute('transform', art.scanMove(view.sweep))
        } else scan.setAttribute('opacity', '0')
      }
    }
    groups.current.get('packet')?.setAttribute('transform', art.packetMove(view.packetY, view.explode))
    const list = chips.current
    if (list) {
      const holder = list.querySelector<HTMLElement>('.stack-chips')
      if (holder) holder.style.opacity = chipOpacity(view.explode)
      list.querySelectorAll<HTMLElement>('.stack-chip-list > .stack-chip').forEach((chip, k) => chip.toggleAttribute('data-active', k === view.layer))
    }
    if (panel.current) writeTerminal(panel.current, terminal)
    say(readoutAt(config, progress))
    return true
  }, active)

  return (
    <StackFigureView
      config={config}
      art={art}
      view={start.view}
      terminal={start.terminal}
      rootRef={anchor}
      groupRef={groupRef}
      chipsRef={chips}
      panelRef={panel}
    />
  )
}

// Builds a project's figure module from its stack config: id, card text, the settled Static and the scroll-driven Live.
// Static is the stack open and at rest after the round trip (progress 1): every board apart with its chip, the top
// board lit with the packet beside it, and the whole terminal printed (scrollable), readout `→ ready`.
export function makeStackFigure (config: StackConfig): FigureModule {
  const art = stackArt(config.layers.length, config.side.length)
  const settledView = viewAt(config, 1)
  const settledTerminal = terminalAt(config, 1)
  const settledReadout = readoutAt(config, 1)
  const start = { view: viewAt(config, 0), terminal: terminalAt(config, 0) }

  function StackStatic () {
    return (
      <>
        <StackFigureView config={config} art={art} view={settledView} terminal={settledTerminal} scroll />
        <SettledReadout text={settledReadout} />
      </>
    )
  }

  function StackLiveFigure ({ progressRef }: { progressRef: ProgressRef }) {
    return <StackLive config={config} art={art} progressRef={progressRef} start={start} />
  }

  return { id: config.id, fig: config.fig, title: config.title, hint: config.hint, Static: StackStatic, Live: StackLiveFigure }
}
