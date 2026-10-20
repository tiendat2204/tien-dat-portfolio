import { Icon } from '@/components/Icon'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BLUR_FADE_DELAY } from '@/data/config'
import { INSIGHTS_SOURCE } from '@/data/insights'
import { getUmamiInsights } from '@/lib/umami'
import { cn } from '@/lib/utils'
import { InsightsChart } from './insights-chart'

export async function InsightsSection () {
  const insights = await getUmamiInsights()
  const { range, metrics, daily } = insights ?? { range: '', metrics: [], daily: [] }
  const source = INSIGHTS_SOURCE
  // Without analytics data (no env vars or API error) the chart shows its loading skeleton.
  const empty = daily.length === 0

  return (
    <section id='insights' className='relative screen-line-after border-x font-ibm'>
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      <div className='flex items-baseline justify-between border-b pr-4'>
        <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
          <h2 className='text-2xl font-extrabold px-4 font-doto'>Insights</h2>
        </BlurFade>
        {range && <span className='text-xs text-muted-foreground'>[{range}]</span>}
      </div>

      {metrics.length > 0 && (
        <dl
          className='grid grid-cols-2 border-b sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]'
          style={{ '--cols': metrics.length } as React.CSSProperties}
        >
          {metrics.map((metric) => {
            const hasChange = metric.change !== null
            const up = (metric.change ?? 0) >= 0
            const good = metric.lowerIsBetter ? !up : up
            return (
              <div key={metric.label} className='border-r border-b p-4 last:border-r-0 sm:border-b-0 max-sm:even:border-r-0 max-sm:[&:nth-last-child(-n+2)]:border-b-0'>
                <dt className='text-xs text-muted-foreground'>
                  <span className='text-foreground/40'>&gt;</span> {metric.label.toLowerCase()}
                </dt>
                <dd className='mt-1 flex items-baseline gap-2'>
                  <span className='font-doto text-2xl font-extrabold tabular-nums'>{metric.value}</span>
                  {hasChange
                    ? (
                      <span
                        className={cn(
                          'text-xs tabular-nums',
                          good ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {up ? '▲' : '▼'} {Math.abs(metric.change ?? 0).toFixed(1)}%
                      </span>
                      )
                    : (
                      <span className='text-xs text-muted-foreground' title='No data for the previous period'>new</span>
                      )}
                </dd>
              </div>
            )
          })}
        </dl>
      )}

      <div className='border-b px-2 py-4'>
        <InsightsChart data={daily} />
      </div>

      <p className='px-4 py-3 text-xs text-muted-foreground'>
        fig.02 — {empty ? 'no data yet, collecting traffic' : 'daily traffic'} · source:{' '}
        <a href={source.url} target='_blank' rel='noreferrer' className='text-foreground underline underline-offset-4'>
          {source.name}
        </a>
      </p>
    </section>
  )
}
