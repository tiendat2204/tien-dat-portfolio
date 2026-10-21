import { parsePublishedAt } from './date'
import { buildCanonicalUrl } from './metadata'

type RssPost = { slug: string, title: string, description: string, publishedAt: string }

type RssInput = {
  siteUrl: string
  title: string
  description: string
  authorName: string
  posts: RssPost[]
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

export function buildRssXml ({ siteUrl, title, description, authorName, posts }: RssInput): string {
  const origin = new URL(siteUrl).origin
  const items = posts.map(post => {
    const link = escapeXml(buildCanonicalUrl(siteUrl, `/blog/${post.slug}`))
    const date = parsePublishedAt(post.publishedAt)
    const pubDate = date === undefined ? '' : `\n      <pubDate>${date.toUTCString()}</pubDate>`
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <description>${escapeXml(post.description)}</description>`,
      `      <dc:creator>${escapeXml(authorName)}</dc:creator>${pubDate}`,
      '    </item>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(buildCanonicalUrl(siteUrl, '/'))}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${escapeXml(`${origin}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}
