import type { MetadataRoute } from 'next'
import { SITE_INFO } from '@/data/config'
import { getAllPosts } from '@/data/blog'
import { buildSitemapEntries } from '@/lib/seo/sitemap'

export default function sitemap (): MetadataRoute.Sitemap {
  const posts = getAllPosts().map(post => ({
    slug: post.slug,
    publishedAt: post.metadata.publishedAt,
  }))
  return buildSitemapEntries(SITE_INFO.url, posts, new Date())
}
