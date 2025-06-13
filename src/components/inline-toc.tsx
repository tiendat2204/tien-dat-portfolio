import type { TOCItemType } from 'fumadocs-core/server'
import { ChevronDownIcon } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export function InlineTOC ({
  items,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Collapsible> & {
  items: TOCItemType[];
}) {
  return (
    <Collapsible
      className={cn('not-prose  font-sans', className)}
      {...props}
    >
      <CollapsibleTrigger className='group inline-flex w-full items-center justify-between px-4 py-3 text-sm font-medium'>
        {children ?? 'Table of Contents'}
        <ChevronDownIcon className='size-4 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180' />
      </CollapsibleTrigger>
      <CollapsibleContent className='overflow-hidden duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down'>
        <div className='flex flex-col px-4 pb-3 text-sm text-muted-foreground'>
          {items.map((item) => {
            return (
              <a
                key={item.url}
                href={item.url}
                className='border-s py-1 hover:text-accent-foreground'
                style={{
                  paddingInlineStart: 16 * Math.max(item.depth - 1, 0.5),
                }}
              >
                {item.title}
              </a>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
