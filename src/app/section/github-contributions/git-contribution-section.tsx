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
import { format } from 'date-fns'
import { LoaderIcon } from 'lucide-react'
import { use } from 'react'

interface GitContributionSectionProps {
  contributions: Promise<Activity[]>;
}

const GitContributionSection = ({ contributions }: GitContributionSectionProps) => {
  const data = use(contributions)
  return (
    <ContributionGraph
      className='mx-auto p-4'
      data={data}
      blockSize={10}
      blockMargin={3}
      blockRadius={2}
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
            activity.level > 3
              ? 'animate-pulse stroke-1 stroke-primary dark:stroke-primary'
              : activity.level === 0
                ? 'opacity-50'
                : ''
          }
                  dayIndex={dayIndex}
                  style={{
                    filter: activity.level > 2 ? 'brightness(1.2)' : undefined,
                  }}
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
