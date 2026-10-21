import { buildCanonicalUrl } from './metadata'

type RssPost = { slug: string, title: string, description: string, publishedAt: string }

type RssInput = {
  siteUrl: string
  title: string
  description: string
  authorName: string // accepted for API symmetry; RSS <author> requires an email, so unused
  posts: RssPost[]
}

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

export function buildRssXml ({ siteUrl, title, description, posts }: RssInput): string {
  const origin = new URL(siteUrl).origin
  const items = posts.map(post => {
    const link = escapeXml(buildCanonicalUrl(siteUrl, `/blog/${post.slug}`))
    // Single parser (not dayjs) so validation and value agree; date-only strings are UTC.
    const date = new Date(post.publishedAt)
    const pubDate = Number.isNaN(date.getTime()) ? '' : `\n      <pubDate>${date.toUTCString()}</pubDate>`
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${link}</link>`,
      `      <guid isPermaLink="true">${link}</guid>`,
      `      <description>${escapeXml(post.description)}</description>${pubDate}`,
      '    </item>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
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
