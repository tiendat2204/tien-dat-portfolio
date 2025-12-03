'use client'

import { RepeatIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import { OpenInV0Button } from './open-in-v0'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { Code as CodeInline } from './ui/typography'
import { Index } from '@/__registry__'

export function ComponentPreview ({
  className,
  name,
  openInV0Url,
  canReplay = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  name: string;
  openInV0Url?: string;
  canReplay?: boolean;
}) {
  const [replay, setReplay] = useState(0)

  const Codes = React.Children.toArray(children) as React.ReactElement<any>[]
  const Code = Codes[0]

  const Preview = useMemo(() => {
    const Component = Index[name]?.component
    if (!Component) {
      return (
        <p className='text-sm text-muted-foreground'>
          Component <CodeInline>{name}</CodeInline> not found in registry.
        </p>
      )
    }

    return <Component />
  }, [name])

  return (
    <div className={cn('my-6', className)} {...props}>
      <Tabs defaultValue='preview' className='gap-4'>
        <TabsList>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
          <TabsTrigger value='code'>Code</TabsTrigger>
        </TabsList>

        <TabsContent value='preview'>
          <div className='rounded-lg border p-4
  bg-radial-[125%_125%_at_50%_10%]
  from-[rgba(255,255,255,0.8)] from-40% to-[rgba(240,240,240,1)] to-100%
  dark:from-[rgba(34,34,34,0.6)] dark:from-40% dark:to-[rgba(0,0,0,1)] dark:to-100%'
          >
            {(canReplay || openInV0Url) && (
              <div className='flex justify-end gap-2'>
                {canReplay && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className='rounded-md'
                        variant='secondary'
                        size='icon'
                        onClick={() => setReplay((v) => v + 1)}
                      >
                        <RepeatIcon />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>Replay</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {openInV0Url && <OpenInV0Button url={openInV0Url} />}
              </div>
            )}

            <div
              key={replay}
              className='not-prose flex min-h-80 items-center justify-center font-sans'
            >
              <React.Suspense
                fallback={
                  <div className='flex items-center justify-center text-sm text-muted-foreground'>
                    Loading...
                  </div>
                                }
              >
                {Preview}
              </React.Suspense>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='code' className='[&>figure]:m-0'>
          {Code}
        </TabsContent>
      </Tabs>
    </div>
  )
}
