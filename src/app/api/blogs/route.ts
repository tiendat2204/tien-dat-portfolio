import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import { markdownToHTML } from '@/data/blog'

export async function GET () {
  try {
    // Get the content directory path
    const contentDir = path.join(process.cwd(), 'content')

    // Read all MDX files
    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.mdx'))

    // Process each file to get metadata and content
    const posts = await Promise.all(files.map(async (filename) => {
      const filePath = path.join(contentDir, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      // Process the markdown content to HTML
      const source = await markdownToHTML(content)

      // Get slug from filename (remove .mdx extension)
      const slug = filename.replace(/\.mdx$/, '')

      // Return metadata, content and slug
      return {
        title: data.title || 'Untitled',
        publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
        summary: data.summary || '',
        tags: data.tags || ['general'],
        image: data.image || '',
        author: data.author || 'Anonymous',
        source, // Include the processed HTML content
        slug
      }
    }))

    // Sort by publishedAt date (newest first)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}
