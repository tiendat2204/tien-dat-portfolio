import type { Post } from '@/types/blog'

export function sortPostsNewestFirst (posts: Post[]) {
  return [...posts].sort((a, b) => {
    const newestFirst =
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()

    if (newestFirst !== 0) return newestFirst
    return a.slug.localeCompare(b.slug)
  })
}

export function indexPostsBySlug (posts: Post[]) {
  return new Map(posts.map(post => [post.slug, post]))
}
