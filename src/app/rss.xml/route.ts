import { getAllPosts } from '@/data/blog'
import { SITE_INFO } from '@/data/config'
import { SEO_PROFILE } from '@/data/seo'
import { buildRssXml } from '@/lib/seo/rss'

export const dynamic = 'force-static'

export function GET () {
  const posts = getAllPosts().map(post => ({
    slug: post.slug,
    title: post.metadata.title,
    description: post.metadata.description || post.metadata.summary || '',
    publishedAt: post.metadata.publishedAt,
  }))
  const xml = buildRssXml({
    siteUrl: SITE_INFO.url,
    title: SEO_PROFILE.name,
    description: SEO_PROFILE.description,
    authorName: SEO_PROFILE.name,
    posts,
  })

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
