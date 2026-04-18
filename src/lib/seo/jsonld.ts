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

function buildAbsoluteUrl (url: string, siteUrl: string) {
  return new URL(url, siteUrl).toString()
}

export function buildBlogPostingJsonLd (
  input: BuildBlogPostingJsonLdInput
): WithContext<BlogPosting> {
  const image = buildAbsoluteUrl(
    buildOgImageUrl(input.image, input.title),
    input.siteUrl
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image,
    url: buildCanonicalUrl(input.siteUrl, `/blog/${input.slug}`),
    datePublished: dayjs(input.publishedAt).toISOString(),
    dateModified: dayjs(input.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: input.author.name,
      identifier: input.author.identifier,
      image: input.author.image,
    },
  }
}
