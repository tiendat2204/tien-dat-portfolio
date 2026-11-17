'use client'

import { useLayoutEffect, useRef, type CSSProperties, type Ref } from 'react'

import type { StackArt } from '@/components/iso/stack/geometry'
import { bomRows, scanClip, type TitleBlock } from '@/components/iso/stack/sheet-parts'
import { SkinDrawing } from '@/components/iso/stack/skins/skin-drawing'
import { StackDrawing, type DrawingView, type GroupRef } from '@/components/iso/stack/stack-drawing'
import { TerminalPanel, type TerminalState } from '@/components/iso/stack/terminal-panel'
import type { StackConfig } from '@/components/iso/stack/types'

// When balloon k of n draws in while the stack opens: its leader plots over its own slice, top board first, then its
// circle fades in and its BOM row fills. Every balloon is complete by explode 0.6, while the boards still separate.
const LEAD_FROM = 0.05
const LEAD_SPREAD = 0.25
const LEAD_SPAN = 0.2
const FACE_SPAN = 0.1
// More parts than this and the parts list switches to one-line rows (stack.css) so every row stays on the sheet.
const DENSE_ROWS = 6
// The side modules' rows fill once every balloon has drawn.
export const SIDE_ROWS_AT = LEAD_FROM + LEAD_SPREAD + LEAD_SPAN + FACE_SPAN

const clamp01 = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0)

export function revealOf (explode: number, k: number, count: number): { lead: number, face: number } {
  const start = LEAD_FROM + (count > 1 ? LEAD_SPREAD * k / (count - 1) : 0)
  return {
    lead: clamp01((explode - start) / LEAD_SPAN),
    face: clamp01((explode - start - LEAD_SPAN) / FACE_SPAN),
  }
}

// The skin layer's clip during the scan: the part below the scanline still shows the skin.
export const skinClip = (scan: number) => `inset(${(clamp01(scan) * 100).toFixed(2)}% 0 0 0)`

// The scanline's place: a share of the drawing area's height, moved by transform (composited, no layout).
export const scanMove = (scan: number) => `translateY(${(clamp01(scan) * 100).toFixed(2)}%)`

// The title block plots in left to right with the skin.
export const titleClip = (draw: number) => `inset(0 ${(100 - clamp01(draw) * 100).toFixed(2)}% 0 0)`

export type SheetMoment = {
  skin: number
  scan: number
  drawing: DrawingView
  step: number
  title: TitleBlock
}

export type SheetBindings = {
  root?: Ref<HTMLDivElement>
  skinLayer?: Ref<HTMLDivElement>
  skinPath?: (index: number) => Ref<SVGPathElement>
  scanline?: Ref<HTMLDivElement>
  group?: GroupRef
  bom?: Ref<HTMLOListElement>
  title?: Ref<HTMLDListElement>
  panel?: Ref<HTMLDivElement>
}

type SheetProps = {
  config: StackConfig
  art: StackArt
  moment: SheetMoment
  terminal: TerminalState
  label: string
  // Static leaves the skin out entirely: the settled sheet is the assembly view.
  withSkin: boolean
  scroll?: boolean
  // Live's handles on the parts it rewrites; the skeleton layer's node is shared through `skeleton`.
  bind?: SheetBindings
  skeleton?: { current: HTMLDivElement | null }
}

// The drawing's scale (rendered px per viewBox unit) as `--k`, so the balloons keep one size on screen at any card
// width. Measured before the first paint and on every resize; the layer is never transformed.
function useDrawingScale (art: StackArt, target: { current: HTMLDivElement | null }) {
  useLayoutEffect(() => {
    const node = target.current
    if (!node) return
    const measure = (): void => {
      const { width, height } = node.getBoundingClientRect()
      const k = Math.min(width / art.width, height / art.height)
      if (k > 0 && Number.isFinite(k)) node.style.setProperty('--k', k.toFixed(4))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [art, target])
}

function BomRow ({ n, label, tech, attrs }: { n: string, label: string, tech: string, attrs: Record<string, string | undefined> }) {
  return (
    <li {...attrs}>
      <span className='sheet-bom-n'>{n}</span>
      <span className='sheet-bom-part'>{label}</span>
      <span className='sheet-bom-spec' title={tech}>{tech}</span>
    </li>
  )
}

// The bill of materials: numbered rows that match the balloons, then the side modules marked `+` (they have no
// balloon). Each row stays a blank ruled line until its balloon has drawn.
function Bom ({ config, moment, bomRef }: { config: StackConfig, moment: SheetMoment, bomRef?: Ref<HTMLOListElement> }) {
  return (
    <div className='sheet-bom font-ibm'>
      <div className='sheet-strip bg-lines-pattern-light dark:bg-lines-pattern'>
        <span>parts</span>
        <span>bom</span>
      </div>
      <div className='sheet-bom-table'>
        <div className='sheet-bom-head' aria-hidden='true'>
          <span>no</span>
          <span>part</span>
          <span>spec</span>
        </div>
        <ol ref={bomRef} className='sheet-bom-list' aria-label='Parts, top to bottom'>
          {bomRows(config).map((row, k) => (
            <BomRow
              key={row.n}
              n={String(row.n).padStart(2, '0')}
              label={row.label}
              tech={row.tech}
              attrs={{
                'data-row': String(k),
                'data-shown': (moment.drawing.reveal[k]?.face ?? 1) >= 0.5 ? '' : undefined,
                'data-active': moment.step === row.n ? '' : undefined,
              }}
            />
          ))}
          {config.side.map(layer => (
            <BomRow
              key={layer.id}
              n='+'
              label={layer.label}
              tech={layer.tech.join(' · ')}
              attrs={{ 'data-side': '', 'data-shown': moment.drawing.explode >= SIDE_ROWS_AT ? '' : undefined }}
            />
          ))}
        </ol>
      </div>
    </div>
  )
}

function TitleBlockView ({ title, draw, titleRef }: { title: TitleBlock, draw: number, titleRef?: Ref<HTMLDListElement> }) {
  return (
    <div className='sheet-title-cell'>
      <dl ref={titleRef} className='sheet-title font-ibm' style={{ clipPath: draw < 1 ? titleClip(draw) : undefined }}>
        <div data-cell='title'><dt>title</dt><dd className='font-doto'>{title.title}</dd></div>
        <div data-cell='sheet'><dt>sheet</dt><dd>{title.sheet}</dd></div>
        <div data-cell='view'><dt>view</dt><dd data-view=''>{title.view}</dd></div>
        <div data-cell='drawn'><dt>drawn</dt><dd>{title.drawn}</dd></div>
      </dl>
    </div>
  )
}
// The card body as an engineering drawing sheet: the drawing area (the skin over the skeleton, split by the X-ray
// scanline), the bill of materials beside it, the notes and the title block under them. Pure render plus one
// measuring effect; Live rewrites it in place through `refs`.
export function SheetView ({ config, art, moment, terminal, label, withSkin, scroll, bind: { root, skinLayer, skinPath, scanline, group, bom, title, panel } = {}, skeleton }: SheetProps) {
  const own = useRef<HTMLDivElement>(null)
  const layer = skeleton ?? own
  useDrawingScale(art, layer)
  const scanning = moment.scan > 0 && moment.scan < 1
  return (
    <div ref={root} className='sheet' data-dense={config.layers.length + config.side.length > DENSE_ROWS ? '' : undefined} style={{ '--art-ratio': (art.width / art.height).toFixed(4) } as CSSProperties}>
      <div className='sheet-draw'>
        {withSkin && (
          <div ref={skinLayer} className='sheet-layer sheet-skin' hidden={moment.scan >= 1} style={{ clipPath: moment.scan > 0 ? skinClip(moment.scan) : undefined }}>
            <SkinDrawing kind={config.skin} draw={moment.skin} pathRef={skinPath} />
          </div>
        )}
        <div
          ref={layer}
          className='sheet-layer sheet-skeleton'
          style={{ clipPath: moment.scan < 1 ? scanClip(moment.scan) : undefined, visibility: moment.scan > 0 ? undefined : 'hidden' }}
        >
          <StackDrawing art={art} view={moment.drawing} label={label} groupRef={group} />
        </div>
        {withSkin && (
          <div ref={scanline} className='sheet-scan' aria-hidden='true' hidden={!scanning} style={{ transform: scanMove(moment.scan) }}>
            <span />
          </div>
        )}
      </div>
      <Bom config={config} moment={moment} bomRef={bom} />
      <TerminalPanel id={config.id} steps={config.steps} state={terminal} scroll={scroll} panelRef={panel} />
      <TitleBlockView title={moment.title} draw={withSkin ? moment.skin : 1} titleRef={title} />
    </div>
  )
}
