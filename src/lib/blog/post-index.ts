import type { Post } from '@/types/blog'

function getPublishedTimestamp (publishedAt: string) {
  const timestamp = Date.parse(publishedAt)
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp
}

export function sortPostsNewestFirst (posts: Post[]) {
  return [...posts].sort((a, b) => {
    const aTimestamp = getPublishedTimestamp(a.metadata.publishedAt)
    const bTimestamp = getPublishedTimestamp(b.metadata.publishedAt)

    if (aTimestamp !== bTimestamp) {
      return aTimestamp > bTimestamp ? -1 : 1
    }
    return a.slug.localeCompare(b.slug)
  })
}

export function indexPostsBySlug (posts: Post[]) {
  return new Map(posts.map(post => [post.slug, post]))
}
