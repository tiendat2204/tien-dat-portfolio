import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { cache } from 'react'

import { indexPostsBySlug, sortPostsNewestFirst } from '@/lib/blog/post-index'
import type { Post, PostMetadata } from '@/types/blog'

const blogContentDir = path.join(process.cwd(), 'src', 'content', 'blog')

function parseFrontmatter (fileContent: string) {
  const file = matter(fileContent)

  return {
    metadata: file.data as PostMetadata,
    content: file.content,
  }
}

function getMDXFiles (dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile (filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData (dir: string) {
  const mdxFiles = getMDXFiles(dir)

  return mdxFiles.map<Post>((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file))

    const slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

const getCachedBlogData = cache(() => {
  const sorted = sortPostsNewestFirst(getMDXData(blogContentDir))

  return {
    sorted,
    bySlug: indexPostsBySlug(sorted),
  }
})

export function getAllPosts () {
  return getCachedBlogData().sorted
}

export function getPostBySlug (slug: string) {
  return getCachedBlogData().bySlug.get(slug)
}

export function getPostsByCategory (category: string) {
  return getAllPosts().filter((post) => post.metadata?.category === category)
}

export function findNeighbour (posts: Post[], slug: string) {
  const len = posts.length

  for (let i = 0; i < len; ++i) {
    if (posts[i].slug === slug) {
      return {
        previous: i > 0 ? posts[i - 1] : null,
        next: i < len - 1 ? posts[i + 1] : null,
      }
    }
  }

  return { previous: null, next: null }
}
