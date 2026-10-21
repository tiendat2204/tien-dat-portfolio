import type { MetadataRoute } from 'next'
import { META_THEME_COLORS } from '@/data/resume'
import { SEO_PROFILE } from '@/data/seo'

export default function manifest (): MetadataRoute.Manifest {
  return {
    name: SEO_PROFILE.name,
    short_name: SEO_PROFILE.name,
    description: SEO_PROFILE.description,
    start_url: '/',
    display: 'standalone',
    background_color: META_THEME_COLORS.light,
    theme_color: META_THEME_COLORS.light,
    icons: [
      { src: '/logo.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  }
}
