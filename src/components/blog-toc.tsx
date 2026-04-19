'use client'

import {
  AnchorProvider,
  ScrollProvider,
  TOCItem,
} from 'fumadocs-core/toc'
import type { TOCItemType } from 'fumadocs-core/server'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

type BlogTOCProps = {
  items: TOCItemType[];
  className?: string;
}

export function BlogTOC ({ items, className }: BlogTOCProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  if (items.length === 0) return null

  return (
    <aside className={cn('not-prose rounded-lg border bg-background p-3', className)}>
      <p className='px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        Table of Contents
      </p>
      <AnchorProvider toc={items} single={false}>
        <ScrollProvider containerRef={containerRef}>
          <nav
            ref={containerRef}
            aria-label='Table of contents'
            className='max-h-[calc(100vh-var(--doc-cols-top,0px)-2rem)] overflow-auto pr-1'
          >
            <ul className='space-y-1'>
              {items.map((item) => (
                <li
                  key={item.url}
                  style={{ paddingInlineStart: `${Math.max(item.depth - 2, 0) * 12}px` }}
                >
                  <TOCItem
                    href={item.url}
                    data-active={false}
                    className='block rounded px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground'
                  >
                    {item.title}
                  </TOCItem>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollProvider>
      </AnchorProvider>
    </aside>
  )
}
