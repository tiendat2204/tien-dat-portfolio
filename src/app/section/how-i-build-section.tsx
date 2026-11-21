import Link from 'next/link'

import { AgentStage } from '@/components/agent-swarm'
import { Icon } from '@/components/Icon'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BLUR_FADE_DELAY } from '@/data/config'
import { SectionHead } from '@/components/section-head'

// Teaser for /uses: the agents' stage and the build walkthrough, plus one link per workflow diagram.
const FLOWS = [
  { id: 'review', title: 'review loop', note: 'Codex reviews every change Claude makes, through hooks.', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:bg-emerald-500/5' },
  { id: 'superpowers', title: 'superpowers', note: 'Brainstorm, plan, TDD and verify before anything is done.', text: 'text-violet-600 dark:text-violet-400', hover: 'hover:bg-violet-500/5' },
  { id: 'orca', title: 'orca', note: 'Several agents in parallel worktrees, one coordinating.', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:bg-indigo-500/5' },
]

export function HowIBuildSection () {
  return (
    <section id='how-i-build' className='relative screen-line-after border-x font-ibm'>
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      <div className='flex items-baseline justify-between border-b pr-4'>
        <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
          <SectionHead index={3} total={10} title='How I build' />
        </BlurFade>
        <Link href='/uses' className='text-xs text-muted-foreground transition-colors hover:text-foreground'>
          [full setup →]
        </Link>
      </div>

      <BlurFade delay={BLUR_FADE_DELAY * 4} offset={0}>
        <div className='flex flex-col gap-3 p-4'>
          <AgentStage />
          <p className='text-sm text-muted-foreground'>
            Claude Code writes, Codex reviews every change, and I decide what ships.
          </p>
        </div>
      </BlurFade>

      <div className='grid grid-cols-3 border-t'>
        {FLOWS.map((f) => (
          <Link
            key={f.id}
            href={`/uses#workflow-${f.id}`}
            className={`group flex flex-col gap-1 border-r p-3 transition-colors last:border-r-0 sm:p-4 ${f.hover}`}
          >
            <span className='flex items-center justify-between gap-1 whitespace-nowrap text-[11px] font-semibold sm:text-xs'>
              <span><span className={f.text}>#</span> {f.title}</span>
              <span className={`transition-transform group-hover:translate-x-0.5 sm:hidden ${f.text}`}>→</span>
            </span>
            <span className='hidden text-xs text-muted-foreground sm:block'>{f.note}</span>
            <span className={`mt-1 hidden text-xs sm:block ${f.text}`}>
              ▶ view diagram <span className='inline-block transition-transform group-hover:translate-x-0.5'>→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
