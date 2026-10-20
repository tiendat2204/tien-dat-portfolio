import { UMAMI_SHARE_ID, UMAMI_WEBSITE_ID } from '@/data/config'
import type { InsightDay, InsightMetric } from '@/data/insights'

// Reads Umami Cloud stats in one of two ways:
// - UMAMI_API_KEY (Pro plan): the official API at api.umami.is.
// - UMAMI_SHARE_ID (free plan): the public share link (Website > Edit > Share URL),
//   exchanged for a share token the same way Umami's own share page does it.
// Results are cached for an hour. Server only: nothing here reaches the browser.
const API_URL = process.env.UMAMI_API_URL || 'https://api.umami.is/v1'
// Umami Cloud serves its app (and the share API) under a region prefix.
const CLOUD_URL = process.env.UMAMI_CLOUD_URL || 'https://cloud.umami.is/analytics/us'
const TIMEZONE = 'Asia/Ho_Chi_Minh'
const RANGE_DAYS = 30
const REVALIDATE_SECONDS = 3600

type Stats = {
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
}

type Series = { x: string; y: number }[]

type Client = { baseUrl: string; headers: Record<string, string>; websiteId: string }

async function getClient (): Promise<Client | null> {
  if (process.env.UMAMI_API_KEY && UMAMI_WEBSITE_ID) {
    return {
      baseUrl: API_URL,
      headers: { Authorization: `Bearer ${process.env.UMAMI_API_KEY}` },
      websiteId: UMAMI_WEBSITE_ID,
    }
  }
  if (UMAMI_SHARE_ID) {
    const res = await fetch(`${CLOUD_URL}/api/share/${UMAMI_SHARE_ID}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) throw new Error(`Umami share responded ${res.status}`)
    const share = (await res.json()) as { websiteId: string; token: string }
    return {
      baseUrl: `${CLOUD_URL}/api`,
      headers: { 'x-umami-share-token': share.token, 'x-umami-share-context': '1' },
      websiteId: share.websiteId,
    }
  }
  return null
}

async function umami<T> (client: Client, path: string, params: Record<string, string | number>) {
  const search = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))
  const res = await fetch(`${client.baseUrl}/websites/${client.websiteId}${path}?${search}`, {
    headers: { ...client.headers, Accept: 'application/json' },
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!res.ok) throw new Error(`Umami ${path} responded ${res.status}`)
  return (await res.json()) as T
}

function change (current: number, previous: number) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function formatDuration (seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function formatRange (start: Date, end: Date) {
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: TIMEZONE })
  return `${fmt(start)} – ${fmt(end)}`
}

export async function getUmamiInsights (): Promise<{
  range: string
  metrics: InsightMetric[]
  daily: InsightDay[]
} | null> {
  const endAt = Date.now()
  const startAt = endAt - RANGE_DAYS * 24 * 60 * 60 * 1000

  try {
    const client = await getClient()
    if (!client) return null

    const [stats, series] = await Promise.all([
      umami<Stats & { comparison: Stats }>(client, '/stats', { startAt, endAt }),
      umami<{ pageviews: Series; sessions: Series }>(client, '/pageviews', {
        startAt,
        endAt,
        unit: 'day',
        timezone: TIMEZONE,
      }),
    ])

    const cur = Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, Number(v)])) as unknown as Stats
    const prev = Object.fromEntries(Object.entries(stats.comparison ?? {}).map(([k, v]) => [k, Number(v)])) as unknown as Stats
    // No traffic recorded yet: let the section show its empty state.
    if (!cur.pageviews) return null

    const bounceRate = (s: Stats) => (s.visits ? (Math.min(s.bounces, s.visits) / s.visits) * 100 : 0)
    const avgVisit = (s: Stats) => (s.visits ? s.totaltime / s.visits : 0)

    const metrics: InsightMetric[] = [
      { label: 'Visitors', value: cur.visitors.toLocaleString('en-US'), change: change(cur.visitors, prev.visitors) },
      { label: 'Page Views', value: cur.pageviews.toLocaleString('en-US'), change: change(cur.pageviews, prev.pageviews) },
      { label: 'Bounce Rate', value: `${Math.round(bounceRate(cur))}%`, change: change(bounceRate(cur), bounceRate(prev)), lowerIsBetter: true },
      { label: 'Avg. Visit', value: formatDuration(avgVisit(cur)), change: change(avgVisit(cur), avgVisit(prev)) },
    ]

    // Merge both series by day; Umami only returns days that have traffic.
    const byDay = new Map<string, InsightDay>()
    for (let t = startAt; t <= endAt; t += 24 * 60 * 60 * 1000) {
      const date = new Date(t).toLocaleDateString('en-CA', { timeZone: TIMEZONE })
      byDay.set(date, { date, visitors: 0, pageViews: 0 })
    }
    for (const { x, y } of series.pageviews) {
      const day = byDay.get(x.slice(0, 10))
      if (day) day.pageViews = Number(y)
    }
    for (const { x, y } of series.sessions) {
      const day = byDay.get(x.slice(0, 10))
      if (day) day.visitors = Number(y)
    }

    return {
      range: formatRange(new Date(startAt), new Date(endAt)),
      metrics,
      daily: [...byDay.values()],
    }
  } catch (error) {
    console.warn('[umami] failed to load insights', error)
    return null
  }
}
