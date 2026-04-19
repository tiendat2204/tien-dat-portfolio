'use client'

import * as Primitive from 'fumadocs-core/toc'
import type { TOCItemType } from 'fumadocs-core/server'
import {
  type CSSProperties,
  type ComponentProps,
  type ReactNode,
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { cn } from '@/utils/cn'
import { mergeRefs } from '@/utils/merge-refs'

type BlogTOCProps = {
  items: TOCItemType[];
  className?: string;
}

type TOCItemWithStep = TOCItemType & {
  _step?: string | number;
}

const TOCContext = createContext<TOCItemWithStep[]>([])

export function useTOCItems (): TOCItemWithStep[] {
  return use(TOCContext)
}

export type TOCProviderProps = Primitive.AnchorProviderProps

export const { useActiveAnchor, useActiveAnchors } = Primitive
export const useItems = useTOCItems

export function TOCProvider ({ toc, children, ...props }: TOCProviderProps) {
  return (
    <TOCContext value={toc as TOCItemWithStep[]}>
      <Primitive.AnchorProvider
        toc={toc}
        {...props}
      >
        {children}
      </Primitive.AnchorProvider>
    </TOCContext>
  )
}

export function TOCScrollArea ({ ref, className, ...props }: ComponentProps<'div'>) {
  const viewRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={mergeRefs(viewRef, ref)}
      className={cn(
        'relative min-h-0 text-sm ms-px overflow-auto [scrollbar-width:none] mask-[linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] py-3',
        className
      )}
      {...props}
    >
      <Primitive.ScrollProvider containerRef={viewRef}>{props.children}</Primitive.ScrollProvider>
    </div>
  )
}

interface ComputedSVG {
  width: number;
  height: number;
  content: ReactNode;
  d: string;
  positions: [top: number, bottom: number, x: number][];
  itemLineLengths: [top: number, bottom: number][];
}

export interface TOCItemsProps extends ComponentProps<'div'> {
  thumbBox?: boolean;
}

export function TOCItems ({
  ref,
  className,
  thumbBox = true,
  children,
  ...props
}: TOCItemsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useTOCItems()
  const [svg, setSvg] = useState<ComputedSVG | null>(null)

  const onPrint = useCallback(() => {
    const container = containerRef.current
    if (!container || container.clientHeight === 0) return

    if (items.length === 0) {
      setSvg(null)
      return
    }

    let width = 0
    let height = 0
    let d = ''
    const positions: [top: number, bottom: number, x: number][] = []
    const output: ReactNode[] = []
    let previousIndex = -1
    const anchorsByHref = new Map<string, HTMLElement>()

    for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const href = anchor.getAttribute('href')
      if (!href) continue
      anchorsByHref.set(href, anchor)
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      const x = getLineOffset(item.depth) + 0.5
      const element = anchorsByHref.get(item.url)

      if (!element) {
        positions.push([0, 0, x])
        continue
      }

      const styles = getComputedStyle(element)
      const top = element.offsetTop + Number.parseFloat(styles.paddingTop)
      const bottom = element.offsetTop + element.clientHeight - Number.parseFloat(styles.paddingBottom)

      positions.push([top, bottom, x])

      width = Math.max(x + 8, width)
      height = Math.max(height, bottom)

      if (previousIndex === -1) {
        d += ` M${x} ${top} L${x} ${bottom}`
      } else {
        const [, upperBottom, upperX] = positions[previousIndex]
        d += ` C ${upperX} ${top - 4} ${x} ${upperBottom + 4} ${x} ${top} L${x} ${bottom}`
      }
      previousIndex = index

      if (item._step !== undefined) {
        output.push(
          <circle
            key={`${index}-circle`}
            cx={x}
            cy={(top + bottom) / 2}
            r='8'
            className='fill-primary'
          />,
          <text
            key={`${index}-text`}
            x={x}
            y={(top + bottom) / 2}
            textAnchor='middle'
            alignmentBaseline='central'
            dominantBaseline='middle'
            className='fill-primary-foreground font-mono text-xs font-medium leading-none'
          >
            {item._step}
          </text>
        )
      }
    }

    if (d.length > 0) {
      output.unshift(
        <path
          key='path'
          d={d}
          className='stroke-primary'
          strokeWidth='1'
          fill='none'
        />
      )
    }

    const itemLineLengths: [top: number, bottom: number][] = positions.map(([top, bottom]) => [top, bottom])

    if (thumbBox && d.length > 0) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', d)

      const totalLength = path.getTotalLength()
      for (let index = 0; index < positions.length; index += 1) {
        const [top, bottom] = positions[index]
        if (bottom <= top) {
          const previous = index > 0 ? itemLineLengths[index - 1][1] : 0
          itemLineLengths[index] = [previous, previous]
          continue
        }

        let length = index > 0
          ? itemLineLengths[index - 1][1] + Math.max(top - positions[index - 1][1], 0)
          : top

        while (length < totalLength && path.getPointAtLength(length).y < top) {
          length += 1
        }

        itemLineLengths[index] = [length, length + bottom - top]
      }
    }

    setSvg({
      width,
      height,
      content: output,
      d,
      positions,
      itemLineLengths,
    })
  }, [items, thumbBox])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(onPrint)
    observer.observe(container)
    const frame = requestAnimationFrame(onPrint)

    return () => {
      cancelAnimationFrame(frame)
      observer.unobserve(container)
      observer.disconnect()
    }
  }, [onPrint])

  return (
    <div
      ref={mergeRefs(containerRef, ref)}
      className={cn('relative flex flex-col', className)}
      {...props}
    >
      {svg
        ? <ThumbTrack computed={svg} thumbBox={thumbBox} />
        : null}
      {children}
    </div>
  )
}

export function TOCEmpty () {
  return (
    <div className='rounded-lg border bg-background p-3 text-xs text-muted-foreground'>
      No headings in this article.
    </div>
  )
}

interface ThumbBoxInfo {
  startIdx: number;
  endIdx: number;
  isUp: boolean;
}

type TOCItemInfoLike = {
  active: boolean;
  original: TOCItemWithStep;
}

function ThumbTrack ({ computed, thumbBox }: { computed: ComputedSVG; thumbBox: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const previousRef = useRef<ThumbBoxInfo | null>(null)
  const items = useTOCItems()
  const activeAnchor = useActiveAnchor()
  const activeAnchors = useActiveAnchors()

  const activeItems = useMemo(() => {
    const anchors = activeAnchors.length > 0
      ? activeAnchors
      : (activeAnchor ? [activeAnchor] : [])
    const set = new Set(anchors.map((value) => (value.startsWith('#') ? value : `#${value}`)))
    return items.map((item) => ({
      active: set.has(item.url),
      original: item,
    }))
  }, [activeAnchor, activeAnchors, items])

  const calculate = useCallback((tocItems: TOCItemInfoLike[]) => {
    const out: Record<string, string> = {}
    const startIdx = tocItems.findIndex((item) => item.active)
    if (startIdx === -1) return out

    let endIdx = startIdx
    for (let index = tocItems.length - 1; index >= startIdx; index -= 1) {
      if (tocItems[index].active) {
        endIdx = index
        break
      }
    }

    const startPosition = computed.positions[startIdx]
    const endPosition = computed.positions[endIdx]
    if (!startPosition || !endPosition) return out

    out['--track-top'] = `${startPosition[0]}px`
    out['--track-bottom'] = `${endPosition[1]}px`

    if (thumbBox && computed.itemLineLengths.length > 0) {
      let isUp = false
      if (previousRef.current) {
        const previous = previousRef.current
        isUp =
          previous.startIdx > startIdx ||
          previous.endIdx > endIdx ||
          (previous.startIdx === startIdx && previous.endIdx === endIdx && previous.isUp)
      }

      previousRef.current = { startIdx, endIdx, isUp }

      const startLine = computed.itemLineLengths[startIdx]
      const endLine = computed.itemLineLengths[endIdx]
      if (startLine && endLine) {
        out['--offset-distance'] = isUp ? `${startLine[0]}px` : `${endLine[1]}px`
      }

      out['--opacity'] = tocItems[isUp ? startIdx : endIdx].original._step !== undefined ? '0' : '1'
    }

    return out
  }, [computed.itemLineLengths, computed.positions, thumbBox])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const nextStyle = calculate(activeItems)

    for (const [key, value] of Object.entries(nextStyle)) {
      element.style.setProperty(key, value)
    }
  }, [activeItems, calculate])

  const baseTrackStyle: CSSProperties = {
    width: computed.width,
    height: computed.height,
    ['--track-top' as string]: '0px',
    ['--track-bottom' as string]: '0px',
    ['--offset-distance' as string]: '0px',
    ['--opacity' as string]: '1',
  }

  return (
    <div
      ref={ref}
      className='absolute top-0 inset-s-0'
      style={baseTrackStyle}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox={`0 0 ${computed.width} ${computed.height}`}
        className='absolute transition-[clip-path]'
        style={{
          width: computed.width,
          height: computed.height,
          clipPath: 'polygon(0 var(--track-top,0), 100% var(--track-top,0), 100% var(--track-bottom,0), 0 var(--track-bottom,0))',
        }}
      >
        {computed.content}
      </svg>
      {thumbBox && computed.d.length > 0
        ? (
          <div
            className='absolute size-1 rounded-full bg-primary opacity-[var(--opacity,0)] transition-[opacity,offset-distance] [offset-distance:var(--offset-distance,0)]'
            style={{
              offsetPath: `path("${computed.d}")`,
            }}
          />
          )
        : null}
    </div>
  )
}

const lineBaseOffset = 8

function getItemOffset (depth: number): number {
  if (depth <= 2) return 12 + lineBaseOffset
  if (depth === 3) return 24 + lineBaseOffset
  return 36 + lineBaseOffset
}

function getLineOffset (depth: number): number {
  if (depth <= 2) return lineBaseOffset
  if (depth === 3) return 8 + lineBaseOffset
  return 16 + lineBaseOffset
}

type PrimitiveTOCItemProps = Omit<Primitive.TOCItemProps, 'href' | 'children'>

export function TOCItem ({
  item,
  ...props
}: PrimitiveTOCItemProps & { item: TOCItemWithStep }) {
  const items = useTOCItems()
  const { lowerOffset, offset, upperOffset, isFirst, isLast } = useMemo(() => {
    const index = items.findIndex((value) => value.url === item.url)
    const currentIndex = index >= 0 ? index : 0
    const currentOffset = getLineOffset(item.depth)

    return {
      offset: currentOffset,
      isFirst: currentIndex === 0,
      isLast: currentIndex === items.length - 1,
      upperOffset: currentIndex > 0 ? getLineOffset(items[currentIndex - 1].depth) : currentOffset,
      lowerOffset: currentIndex + 1 < items.length ? getLineOffset(items[currentIndex + 1].depth) : currentOffset,
    }
  }, [item, items])

  return (
    <Primitive.TOCItem
      href={item.url}
      {...props}
      className={cn(
        'prose relative py-1.5 text-sm scroll-m-4 text-muted-foreground transition-colors wrap-anywhere hover:text-accent-foreground data-[active=true]:text-primary',
        isFirst && 'pt-0',
        isLast && 'pb-0',
        props.className
      )}
      style={{
        paddingInlineStart: getItemOffset(item.depth),
        ...props.style,
      }}
    >
      {offset !== upperOffset
        ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox={`${Math.min(offset, upperOffset)} 0 ${Math.abs(upperOffset - offset)} 12`}
            className='absolute -top-1.5 -z-1'
            style={{
              width: Math.abs(upperOffset - offset) + 1,
              height: 12,
              insetInlineStart: Math.min(offset, upperOffset),
            }}
          >
            <path
              d={`M ${upperOffset} 0 C ${upperOffset} 8 ${offset} 4 ${offset} 12`}
              fill='none'
              className='stroke-border'
            />
          </svg>
          )
        : null}
      <div
        className={cn(
          'absolute inset-y-0 -z-1 w-px bg-border',
          offset !== upperOffset && 'top-1.5',
          offset !== lowerOffset && 'bottom-1.5'
        )}
        style={{
          insetInlineStart: offset,
        }}
      />
      {item._step !== undefined
        ? (
          <div
            className='absolute -z-1 flex size-4 -translate-1/2 items-center justify-center rounded-full bg-muted font-mono text-xs font-medium leading-none text-muted-foreground'
            style={{
              top: `calc(50% + ${(isFirst ? -0.75 : 0) + (isLast ? 0.75 : 0)} * var(--spacing))`,
              insetInlineStart: offset,
            }}
          >
            {item._step}
          </div>
          )
        : null}
      {item.title}
    </Primitive.TOCItem>
  )
}

export function BlogTOC ({ items, className }: BlogTOCProps) {
  const tocItems = items as TOCItemWithStep[]
  if (items.length === 0) return null

  return (
    <aside className={cn('not-prose', className)}>
      <TOCProvider toc={tocItems}>
        <TOCScrollArea className='max-h-[calc(100vh-var(--doc-cols-top,0px)-2rem)] pr-1'>
          <TOCItems thumbBox>
            {tocItems.map((item) => (
              <TOCItem
                key={item.url}
                item={item}
              />
            ))}
          </TOCItems>
        </TOCScrollArea>
      </TOCProvider>
    </aside>
  )
}
