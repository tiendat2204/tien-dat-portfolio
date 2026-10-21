import type { MetadataRoute } from 'next'
import { parsePublishedAt } from './date'
import { buildCanonicalUrl } from './metadata'

const STATIC_PATHS = ['/', '/blog', '/uses', '/components']

type DatedEntry = { slug: string, publishedAt: string }

export function buildSitemapEntries (
  siteUrl: string,
  posts: DatedEntry[],
  now: Date,
  components: DatedEntry[] = []
): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.map(path => ({
    url: buildCanonicalUrl(siteUrl, path),
    lastModified: now,
  }))
  const datedEntry = (base: string) => (entry: DatedEntry) => {
    const parsed = parsePublishedAt(entry.publishedAt)
    const url = buildCanonicalUrl(siteUrl, `${base}/${entry.slug}`)
    return parsed ? { url, lastModified: parsed } : { url }
  }
  return [...staticEntries, ...posts.map(datedEntry('/blog')), ...components.map(datedEntry('/components'))]
}
