import type { MetadataRoute } from 'next'
import { parsePublishedAt } from './date'
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
    const parsed = parsePublishedAt(post.publishedAt)
    const url = buildCanonicalUrl(siteUrl, `/blog/${post.slug}`)
    return parsed ? { url, lastModified: parsed } : { url }
  })
  return [...staticEntries, ...postEntries]
}
