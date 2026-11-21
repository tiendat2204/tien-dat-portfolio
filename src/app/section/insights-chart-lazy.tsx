'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import type { InsightDay } from '@/data/insights'

// The chart library is by far the largest script on the home page and the chart sits below the fold, so its code
// is fetched only when the chart is about to scroll into view. The box keeps the chart's height meanwhile.
const InsightsChart = dynamic(() => import('./insights-chart').then((m) => m.InsightsChart), { ssr: false })

export function InsightsChartLazy ({ data }: { data: InsightDay[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setNear(true)
      observer.disconnect()
    }, { rootMargin: '600px 0px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className='h-56 w-full'>
      {near && <InsightsChart data={data} />}
    </div>
  )
}
