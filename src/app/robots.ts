import type { MetadataRoute } from 'next'
import { SITE_INFO } from '@/data/config'

export default function robots (): MetadataRoute.Robots {
  const origin = new URL(SITE_INFO.url).origin
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
