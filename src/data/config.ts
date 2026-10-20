import { DATA } from '@/data/resume'

export const BLUR_FADE_DELAY = 0.04
export const GITHUB_USERNAME = 'tiendat2204'
// Public by design (it ships in the tracking script); the env var can override it.
export const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID || 'a601bc47-cd9d-41ee-8f81-d375d546627a'
// Share link id from Umami (Website > Edit > Share URL), used to read stats on the free plan.
// Kept in env: anyone holding it can open the full dashboard, and this repo is public.
export const UMAMI_SHARE_ID = process.env.UMAMI_SHARE_ID || ''

export const SITE_INFO = {
  name: DATA.name,
  url: process.env.APP_URL || 'https://tiendat.work/',
  ogImage: DATA.avatarUrl,
  description: DATA.summary,
  keywords: DATA.initials,
}
export const UTM_PARAMS = {
  utm_source: 'tiendat.work',
  utm_medium: 'portfolio_website',
  utm_campaign: 'referral',
}
