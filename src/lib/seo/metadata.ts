import type { Metadata } from 'next'

function trimTrailingSlash (value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function buildCanonicalUrl (baseUrl: string, path: string) {
  const base = trimTrailingSlash(baseUrl)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const hasQueryOrHash = normalizedPath.includes('?') || normalizedPath.includes('#')
  const withTrailingSlash = hasQueryOrHash || normalizedPath.endsWith('/')
    ? normalizedPath
    : `${normalizedPath}/`
  return `${base}${withTrailingSlash}`
}

export function buildOgImageUrl (image: string | undefined, title: string) {
  if (image != null && image.length > 0) return image
  return `/og/simple/?title=${encodeURIComponent(title)}`
}

export type PageMetadataInput = {
  siteUrl: string
  siteName: string
  path: string
  title: string
  description: string
  image?: string
  type?: 'website' | 'profile' | 'article'
  absoluteTitle?: boolean
  publishedTime?: string
  authors?: string[]
}

export function buildPageMetadata (input: PageMetadataInput): Metadata {
  const { siteUrl, siteName, path, title, description, image, type = 'website', absoluteTitle = false, publishedTime, authors } = input
  const url = buildCanonicalUrl(siteUrl, path)
  const ogImage = buildOgImageUrl(image, title)
  const isGenerated = image == null || image.length === 0
  const ogTitle = absoluteTitle ? title : `${title} – ${siteName}`
  const hasPublished = type === 'article' && publishedTime != null && !Number.isNaN(new Date(publishedTime).getTime())
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': `${new URL(siteUrl).origin}/rss.xml` },
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName,
      locale: 'en_US',
      type,
      ...(hasPublished ? { publishedTime, modifiedTime: publishedTime } : {}),
      ...(authors != null ? { authors } : {}),
      images: [
        {
          url: ogImage,
          alt: title,
          ...(isGenerated ? { width: 1200, height: 630 } : {}),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
    },
  }
}

export function buildMissingPostMetadata (slug: string): Metadata {
  return {
    title: `Post not found: ${slug}`,
    description: 'The requested article does not exist.',
    robots: {
      index: false,
      follow: false,
    },
  }
}
