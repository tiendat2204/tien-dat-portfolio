import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

export async function GET() {
  try {
    // Get the content directory path
    const contentDir = path.join(process.cwd(), 'content');

    // Read all MDX files
    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.mdx'));

    // Process each file to get metadata
    const posts = files.map(filename => {
      const filePath = path.join(contentDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      // Get slug from filename (remove .mdx extension)
      const slug = filename.replace(/\.mdx$/, '');

      // Return metadata and slug
      return {
        title: data.title || 'Untitled',
        publishedAt: data.publishedAt || new Date().toISOString().split('T')[0],
        summary: data.summary || '',
        tags: data.tags || ['general'],
        slug
      };
    });

    // Sort by publishedAt date (newest first)
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
