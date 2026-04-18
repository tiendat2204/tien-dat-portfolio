import type { Metadata } from 'next'

function trimTrailingSlash (value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function buildCanonicalUrl (baseUrl: string, path: string) {
  const base = trimTrailingSlash(baseUrl)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}

export function buildOgImageUrl (image: string | undefined, title: string) {
  if (image != null && image.length > 0) return image
  return `/og/simple?title=${encodeURIComponent(title)}`
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
