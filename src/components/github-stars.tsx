import { GitHub } from '@/components/icons/github-icon'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { GITHUB_REPO } from '@/data/config'
import { cn } from '@/lib/utils'

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

// Repo link with its star count; without a count (API failed) it is just the GitHub icon.
export function GitHubStars ({ stars, className }: { stars: number | null; className?: string }) {
  const label = stars === null ? 'GitHub repository' : `${stars.toLocaleString('en-US')} GitHub stars`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={`https://github.com/${GITHUB_REPO}`}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={label}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 gap-1.5 px-2', className)}
        >
          <GitHub className='size-4' />
          {stars !== null && (
            <span className='text-[0.8125rem] leading-none text-muted-foreground tabular-nums'>{compact.format(stars)}</span>
          )}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
