import dayjs from 'dayjs'
import type { MetadataRoute } from 'next'
import { buildCanonicalUrl } from './metadata'

const STATIC_PATHS = ['/', '/blog', '/uses']

export function buildSitemapEntries (
  siteUrl: string,
  posts: { slug: string, publishedAt: string }[],
  now: Date
): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.map(path => ({
    url: buildCanonicalUrl(siteUrl, path),
    lastModified: now,
  }))
  const postEntries = posts.map(post => {
    const parsed = dayjs(post.publishedAt)
    const url = buildCanonicalUrl(siteUrl, `/blog/${post.slug}`)
    return parsed.isValid() ? { url, lastModified: new Date(post.publishedAt) } : { url }
  })
  return [...staticEntries, ...postEntries]
}
