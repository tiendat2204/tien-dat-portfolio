import dayjs from 'dayjs'
import type { BlogPosting, WithContext } from 'schema-dts'

import { buildCanonicalUrl, buildOgImageUrl } from '@/lib/seo/metadata'

type BlogAuthorInput = {
  name: string;
  identifier: string;
  image: string;
}

type BuildBlogPostingJsonLdInput = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  publishedAt: string;
  siteUrl: string;
  author: BlogAuthorInput;
}

const FALLBACK_SITE_URL = 'https://example.com'

function getSafeSiteUrl (siteUrl: string) {
  try {
    const parsed = new URL(siteUrl)

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin
    }
  } catch {}

  return FALLBACK_SITE_URL
}

function buildAbsoluteUrl (url: string, siteUrl: string, fallbackPath: string) {
  try {
    return new URL(url, siteUrl).toString()
  } catch {
    return new URL(fallbackPath, siteUrl).toString()
  }
}

function toIsoDateOrUndefined (value: string) {
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.toISOString() : undefined
}

export function buildBlogPostingJsonLd (
  input: BuildBlogPostingJsonLdInput
): WithContext<BlogPosting> {
  const safeSiteUrl = getSafeSiteUrl(input.siteUrl)
  const fallbackImagePath = buildOgImageUrl(undefined, input.title)
  const image = buildAbsoluteUrl(
    buildOgImageUrl(input.image, input.title),
    safeSiteUrl,
    fallbackImagePath
  )
  const publishedDate = toIsoDateOrUndefined(input.publishedAt)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image,
    url: buildCanonicalUrl(safeSiteUrl, `/blog/${input.slug}`),
    ...(publishedDate !== undefined
      ? {
          datePublished: publishedDate,
          dateModified: publishedDate,
        }
      : {}),
    author: {
      '@type': 'Person',
      name: input.author.name,
      identifier: input.author.identifier,
      image: input.author.image,
    },
  }
}
