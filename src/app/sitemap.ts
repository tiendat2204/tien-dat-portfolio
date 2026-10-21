import type { MetadataRoute } from 'next'
import { SITE_INFO } from '@/data/config'
import { getAllComponents, getAllPosts } from '@/data/blog'
import { buildSitemapEntries } from '@/lib/seo/sitemap'

export default function sitemap (): MetadataRoute.Sitemap {
  const toEntry = (post: { slug: string, metadata: { publishedAt: string } }) => ({
    slug: post.slug,
    publishedAt: post.metadata.publishedAt,
  })
  return buildSitemapEntries(SITE_INFO.url, getAllPosts().map(toEntry), new Date(), getAllComponents().map(toEntry))
}
