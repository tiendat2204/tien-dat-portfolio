'use client'

import { useCallback, useLayoutEffect, useRef } from 'react'

import { useFigureActive } from '@/components/iso/figure-activity'
import type { FigureModule, ProgressRef } from '@/components/iso/figure-contract'
import { useLoop, useReadout } from '@/components/iso/kit/react/live'
import { readoutAt, sheetPose, terminalAt } from '@/components/iso/stack/engine'
import { stackArt, type StackArt } from '@/components/iso/stack/geometry'
import { scanClip, titleBlockOf } from '@/components/iso/stack/sheet-parts'
import { SIDE_ROWS_AT, SheetView, revealOf, scanMove, skinClip, titleRules, type SheetMoment } from '@/components/iso/stack/sheet-view'
import { skinShare } from '@/components/iso/stack/skins/index'
import { axisMove, balloonMove } from '@/components/iso/stack/stack-drawing'
import { writeTerminal, type TerminalState } from '@/components/iso/stack/terminal-panel'
import type { StackConfig } from '@/components/iso/stack/types'
import { USER } from '@/data/user'

import '@/components/iso/stack/stack.css'

// One moment of the sheet from scroll progress, through the pure engine. The board, balloon and BOM row of the layer
// the packet is in light while it travels (`step` > 0); nothing is lit before the packet sets off or at rest.
function momentAt (config: StackConfig, art: StackArt, progress: number): SheetMoment {
  const pose = sheetPose(progress, art.count)
  return {
    skin: pose.skin,
    scan: pose.scan,
    step: pose.step,
    drawing: {
      explode: pose.explode,
      packetY: pose.packetY,
      plate: pose.step > 0 ? art.count - pose.step : -1,
      reveal: Array.from({ length: art.count }, (_, k) => revealOf(pose.explode, k, art.count)),
    },
    title: titleBlockOf(config, USER.displayName, pose.view),
  }
}

const labelOf = (config: StackConfig) =>
  `${config.title}, drawn as a spec sheet: a line-art ${config.skin} skin that an X-ray scan turns into an exploded stack of ` +
  `${config.layers.length} numbered parts, top to bottom ${config.layers.map(layer => layer.label).join(', ')}. ` +
  'A packet runs down the parts and back up; the part it is in lights with its balloon and parts-list row, and the notes type its code.'

// The frame's readout pill is filled by the figure (FigureSlot passes no readout), so the settled text is written
// before the first paint: the pill never shows an empty or placeholder state.
function SettledReadout ({ text }: { text: string }) {
  const { anchor, say } = useReadout<HTMLSpanElement>()
  useLayoutEffect(() => say(text), [say, text])
  return <span ref={anchor} hidden />
}

const keyOf = (moment: SheetMoment, terminal: TerminalState) => {
  const typed = terminal.blocks.map(block => `${block.prompt.length}.${block.typed.map(text => text.length).join('.')}.${block.result === null ? 0 : 1}`).join('|')
  const { block, line, col } = terminal.cursor
  const { drawing } = moment
  return `${moment.skin.toFixed(3)}|${moment.scan.toFixed(4)}|${drawing.explode.toFixed(4)}|${drawing.packetY.toFixed(4)}|${moment.step}|${moment.title.view}|${typed}|${block}.${line}.${col}`
}

const toggle = (node: Element, name: string, on: boolean) => {
  if (node.hasAttribute(name) !== on) node.toggleAttribute(name, on)
}

const setStyle = (node: HTMLElement | SVGElement, name: 'clipPath' | 'transform' | 'visibility', value: string) => {
  if (node.style[name] !== value) node.style[name] = value
}

const setAttr = (node: Element, name: string, value: string | null) => {
  if (value === null) {
    if (node.hasAttribute(name)) node.removeAttribute(name)
  } else if (node.getAttribute(name) !== value) node.setAttribute(name, value)
}

const setHidden = (node: HTMLElement, hidden: boolean) => {
  if (node.hidden !== hidden) node.hidden = hidden
}

// The first render is the sheet at progress 0 (the skin not yet drawn, an empty notes block); the loop's first frame
// moves it to wherever the section already is.
type LiveProps = { config: StackConfig, art: StackArt, progressRef: ProgressRef, start: { moment: SheetMoment, terminal: TerminalState } }

// The scroll-driven sheet. One frame loop reads the section's progress, runs the pure engine and writes clips,
// transforms, opacities, dash offsets, attributes and text straight onto the DOM; React renders it once.
function StackLive ({ config, art, progressRef, start }: LiveProps) {
  const active = useFigureActive()
  const { anchor, say } = useReadout<HTMLDivElement>()
  const groups = useRef<Map<string, SVGGElement>>(new Map())
  const skinPaths = useRef<SVGPathElement[]>([])
  const skinLayer = useRef<HTMLDivElement>(null)
  const skeleton = useRef<HTMLDivElement>(null)
  const scanline = useRef<HTMLDivElement>(null)
  const bom = useRef<HTMLOListElement>(null)
  const title = useRef<HTMLDListElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const drawn = useRef('')

  const group = useCallback((key: string) => (node: SVGGElement | null) => {
    if (node) groups.current.set(key, node)
    else groups.current.delete(key)
  }, [])
  const skinPath = useCallback((index: number) => (node: SVGPathElement | null) => {
    if (node) skinPaths.current[index] = node
  }, [])

  // Rewrites the sheet for the current progress; skips every write when the pose has not changed.
  const paint = useCallback(() => {
    const progress = progressRef.current
    const moment = momentAt(config, art, progress)
    const terminal = terminalAt(config, progress)
    const key = keyOf(moment, terminal)
    if (key === drawn.current) return
    drawn.current = key
    const { drawing } = moment

    // The skin plots in, then the scan: skin below the scanline, skeleton above it; no clip once it has passed.
    const paths = skinPaths.current
    paths.forEach((path, index) => {
      const share = skinShare(moment.skin, index, paths.length)
      setAttr(path, 'stroke-dashoffset', (1 - share).toFixed(4))
      setAttr(path, 'opacity', share > 0 ? null : '0')
    })
    const scanned = moment.scan >= 1
    if (skinLayer.current) {
      setHidden(skinLayer.current, scanned)
      setStyle(skinLayer.current, 'clipPath', moment.scan > 0 && !scanned ? skinClip(moment.scan) : '')
    }
    if (skeleton.current) {
      // Not painted at all before the scan reaches it (a full clip still paints and hit-tests nothing).
      setStyle(skeleton.current, 'visibility', moment.scan > 0 ? '' : 'hidden')
      setStyle(skeleton.current, 'clipPath', scanned ? '' : scanClip(moment.scan))
    }
    if (scanline.current) {
      setHidden(scanline.current, moment.scan <= 0 || scanned)
      setStyle(scanline.current, 'transform', scanMove(moment.scan))
    }

    // The assembly: boards, the packet, the centerline and the balloons, and the lit part of the packet's layer.
    for (let i = 0; i < art.count; i++) {
      const board = groups.current.get(`board${i}`)
      if (board) {
        setAttr(board, 'transform', art.plateMove(i, drawing.explode))
        toggle(board, 'data-active', i === drawing.plate)
        const solid = board.querySelector('.stack-board')
        if (solid) toggle(solid, 'data-lit', i === drawing.plate)
      }
    }
    const packet = groups.current.get('packet')
    if (packet) setAttr(packet, 'transform', art.packetMove(drawing.packetY, drawing.explode))
    const axis = groups.current.get('axis')
    if (axis) {
      setAttr(axis, 'transform', axisMove(art, drawing.explode))
      setAttr(axis, 'opacity', drawing.explode > 0 ? null : '0')
    }
    drawing.reveal.forEach((reveal, k) => {
      const balloon = groups.current.get(`balloon${k}`)
      if (!balloon) return
      const plate = art.count - 1 - k
      setAttr(balloon, 'transform', balloonMove(art, plate, drawing.explode))
      toggle(balloon, 'data-active', plate === drawing.plate)
      const leader = balloon.querySelector('.sheet-leader')
      if (leader) {
        setAttr(leader, 'stroke-dashoffset', (1 - reveal.lead).toFixed(4))
        setAttr(leader, 'opacity', reveal.lead > 0 ? null : '0')
      }
      const root = balloon.querySelector('.sheet-leader-root')
      if (root) setAttr(root, 'opacity', reveal.lead > 0 ? null : '0')
      const face = balloon.querySelector('.sheet-balloon-face')
      if (face) setAttr(face, 'opacity', reveal.face > 0 ? reveal.face.toFixed(2) : '0')
    })

    // The parts list, the title block, the notes and the readout.
    if (bom.current) {
      for (const row of bom.current.querySelectorAll<HTMLLIElement>(':scope > li')) {
        const k = Number(row.dataset.row)
        const shown = row.hasAttribute('data-side') ? drawing.explode >= SIDE_ROWS_AT : (drawing.reveal[k]?.face ?? 0) >= 0.5
        toggle(row, 'data-shown', shown)
        toggle(row, 'data-active', !row.hasAttribute('data-side') && moment.step === k + 1)
      }
    }
    if (title.current) {
      const rules = titleRules(moment.skin)
      if (title.current.style.getPropertyValue('--rules') !== rules) title.current.style.setProperty('--rules', rules)
      const view = title.current.querySelector('[data-view]')
      if (view && view.textContent !== moment.title.view) view.textContent = moment.title.view
    }
    if (panel.current) writeTerminal(panel.current, terminal)
    say(readoutAt(config, progress))
  }, [config, art, progressRef, say])

  // A figure that mounts mid-section shows its pose from the first paint, not one frame of the progress-0 sheet.
  useLayoutEffect(() => paint(), [paint])

  // Keep polling while near the viewport (useLoop stops offscreen): progress arrives through the ref, so an unchanged
  // pose only skips the writes.
  useLoop(() => {
    paint()
    return true
  }, active)

  return (
    <SheetView
      config={config}
      art={art}
      moment={start.moment}
      terminal={start.terminal}
      label={labelOf(config)}
      withSkin
      bind={{ root: anchor, skinLayer, skinPath, scanline, group, bom, title, panel }}
      skeleton={skeleton}
    />
  )
}

// Builds a project's figure module from its stack config: id, card text, the settled Static and the scroll-driven Live.
// Static is the settled sheet (progress 1): the assembly view with every balloon and BOM row, nothing lit, the whole
// notes log printed (scrollable), the title block on `Assembly`, no skin; readout `ready`.
export function makeStackFigure (config: StackConfig): FigureModule {
  const art = stackArt(config.layers.length, config.side.length)
  const settled = momentAt(config, art, 1)
  const settledTerminal = terminalAt(config, 1)
  const settledReadout = readoutAt(config, 1)
  const start = { moment: momentAt(config, art, 0), terminal: terminalAt(config, 0) }

  function StackStatic () {
    return (
      <>
        <SheetView config={config} art={art} moment={settled} terminal={settledTerminal} label={labelOf(config)} withSkin={false} scroll />
        <SettledReadout text={settledReadout} />
      </>
    )
  }

  function StackLiveFigure ({ progressRef }: { progressRef: ProgressRef }) {
    return <StackLive config={config} art={art} progressRef={progressRef} start={start} />
  }

  return { id: config.id, fig: config.fig, title: config.title, hint: config.hint, Static: StackStatic, Live: StackLiveFigure }
}
