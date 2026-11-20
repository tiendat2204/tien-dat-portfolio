import type { ScrollStageChapter } from './scroll-stage-plan'

interface ScrollStageRailProps {
  chapters: readonly ScrollStageChapter[]
  active: number
  onSelect: (chapter: ScrollStageChapter) => void
}

/**
 * The chapter strip under a stage, in the spec-sheet voice: a hairline that fills with `--p`, then one numbered cell per
 * chapter. The active chapter is inverted; a cell scrolls the stage to where its chapter starts.
 */
export function ScrollStageRail ({ chapters, active, onSelect }: ScrollStageRailProps) {
  return (
    <nav aria-label='Chapters' className='border-t font-mono text-[10px] uppercase tracking-wide'>
      <div aria-hidden='true' className='h-px w-full bg-border'>
        <div className='h-px bg-foreground' style={{ width: 'calc(var(--p) * 100%)' }} />
      </div>
      <ol className='flex'>
        {chapters.map((chapter, index) => (
          <li key={chapter.label} className='min-w-0 flex-1 border-r last:border-r-0'>
            <button
              type='button'
              aria-current={index === active ? 'step' : undefined}
              onClick={() => onSelect(chapter)}
              className='flex w-full items-baseline gap-2 truncate px-3 py-2 text-left transition-colors hover:bg-muted aria-[current=step]:bg-foreground aria-[current=step]:text-background'
            >
              <span className='tabular-nums opacity-60'>{String(index + 1).padStart(2, '0')}</span>
              <span className='truncate'>{chapter.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
