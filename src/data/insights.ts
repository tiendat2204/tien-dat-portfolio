// Shapes for the Insights section. The numbers come from Umami
// (see src/lib/umami.ts); without its env vars the section shows an empty state.

export type InsightMetric = {
  label: string
  value: string
  // Percent change against the previous period, e.g. 12.5 or -3.2.
  change: number
  // True when a drop is good news, e.g. bounce rate.
  lowerIsBetter?: boolean
}

export type InsightDay = {
  date: string
  visitors: number
  pageViews: number
}

export const INSIGHTS_SOURCE = { name: 'Umami', url: 'https://umami.is' }
