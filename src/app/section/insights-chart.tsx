'use client'

import { EvilAreaChart } from '@/components/evilcharts/charts/recharts-area-chart'
import { type ChartConfig } from '@/components/evilcharts/ui/recharts-chart'
import type { InsightDay } from '@/data/insights'

const chartConfig = {
  pageViews: {
    label: 'Page views',
    colors: { light: ['#a3a3a3'], dark: ['#737373'] },
  },
  visitors: {
    label: 'Visitors',
    colors: { light: ['#171717'], dark: ['#fafafa'] },
  },
} satisfies ChartConfig

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

export function InsightsChart ({ data }: { data: InsightDay[] }) {
  return (
    <EvilAreaChart
      data={data}
      config={chartConfig}
      curveType='monotone'
      isLoading={data.length === 0}
      className='h-56 w-full'
    >
      <EvilAreaChart.Grid />
      <EvilAreaChart.XAxis dataKey='date' tickFormatter={formatDay} />
      <EvilAreaChart.Tooltip />
      <EvilAreaChart.Legend isClickable />
      <EvilAreaChart.Area dataKey='pageViews' variant='dotted' strokeVariant='solid' isClickable>
        <EvilAreaChart.ActiveDot variant='default' />
      </EvilAreaChart.Area>
      <EvilAreaChart.Area dataKey='visitors' variant='dotted' strokeVariant='solid' isClickable>
        <EvilAreaChart.ActiveDot variant='default' />
      </EvilAreaChart.Area>
    </EvilAreaChart>
  )
}
