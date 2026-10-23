'use client'

import type { Activity } from '@/components/kibo-ui/contribution-graph'
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from '@/components/kibo-ui/contribution-graph'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { GITHUB_USERNAME } from '@/data/config'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import { use, useEffect, useRef } from 'react'

interface GitContributionSectionProps {
  contributions: Promise<Activity[] | null>;
}

const GitContributionSection = ({ contributions }: GitContributionSectionProps) => {
  const data = use(contributions)
  const ref = useRef<HTMLDivElement>(null)

  // On narrow screens the calendar scrolls horizontally; start at the latest weeks.
  useEffect(() => {
    const scroller = ref.current?.querySelector<HTMLElement>('.overflow-x-auto')
    if (scroller) scroller.scrollLeft = scroller.scrollWidth
  }, [data])

  if (!data) {
    return (
      <div className='flex h-[162px] w-full items-center justify-center font-ibm text-sm text-muted-foreground'>
        GitHub contributions are unavailable right now.
      </div>
    )
  }

  return (
    <div ref={ref}>
      <ContributionGraph
        className='mx-auto p-4 scroll-fade-x no-scrollbar'
        data={data}
        blockSize={11}
        blockMargin={4}
        blockRadius={0}
      >
        <ContributionGraphCalendar
          className='hidden-scrollbar '
          title='GitHub Contributions'
        >
          {({ activity, dayIndex, weekIndex }) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <g>
                  <ContributionGraphBlock
                    activity={activity}
                    className={
            cn(
              // Brightening only helps on the dark background; on white it washes the busy days out.
              activity.level > 2 && 'dark:brightness-120',
              activity.level > 3 && 'animate-pulse stroke-1 stroke-primary',
              activity.level === 0 && 'opacity-50'
            )
          }
                    dayIndex={dayIndex}
                    weekIndex={weekIndex}
                  />
                </g>
              </TooltipTrigger>

              <TooltipContent className='font-ibm text-white dark:text-black'>
                <p>
                  {activity.count} contribution{activity.count > 1 ? 's' : null}{' '}
                  on {format(new Date(activity.date), 'dd.MM.yyyy')}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </ContributionGraphCalendar>

        <ContributionGraphFooter className=''>
          <ContributionGraphTotalCount>
            {({ totalCount, year }) => (
              <div className='text-muted-foreground'>
                {totalCount.toLocaleString('en')} contributions in {year} on{' '}
                <a
                  className='font-medium underline underline-offset-4'
                  href={`https://github.com/${GITHUB_USERNAME}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  GitHub
                </a>
                .
              </div>
            )}
          </ContributionGraphTotalCount>

          <ContributionGraphLegend />
        </ContributionGraphFooter>
      </ContributionGraph>
    </div>
  )
}

export default GitContributionSection
export function GitHubContributionFallback () {
  return (
    <div className='flex h-[162px] w-full items-center justify-center'>
      <LoaderIcon className='animate-spin text-muted-foreground' />
    </div>
  )
}
