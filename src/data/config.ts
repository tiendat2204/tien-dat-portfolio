import { DATA, LOGO_BASE64 } from '@/data/resume'

export const BLUR_FADE_DELAY = 0.04

export const maskStyle = {
  WebkitMaskImage: `url('${LOGO_BASE64}')`,
  WebkitMaskSize: '100vw',
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  maskImage: `url('${LOGO_BASE64}')`,
  maskSize: '200px',
  maskPosition: 'center',
  maskRepeat: 'no-repeat',
} as const

export const GRID_CONFIG = {
  background: {
    color: '#cccccc',
    maxOpacity: 0.05,
    flickerChance: 0.08,
    squareSize: 6,
    gridGap: 6,
  },
  logo: {
    color: '#FFFFFF',
    maxOpacity: 0.95,
    flickerChance: 0.12,
    squareSize: 4,
    gridGap: 8,
  },
} as const
export const SITE_INFO = {
  name: DATA.name,
  url: process.env.APP_URL || 'https://tiendatdev.me/',
  ogImage: DATA.avatarUrl,
  description: DATA.summary,
  keywords: DATA.initials,
}
export const UTM_PARAMS = {
  utm_source: 'tiendatdev.me',
  utm_medium: 'portfolio_website',
  utm_campaign: 'referral',
}
