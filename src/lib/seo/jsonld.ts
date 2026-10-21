import dayjs from 'dayjs'
import type {
  BlogPosting,
  BreadcrumbList,
  Person,
  ProfilePage,
  WebSite,
  WithContext,
} from 'schema-dts'

import { buildCanonicalUrl, buildOgImageUrl } from '@/lib/seo/metadata'

export type PersonInput = {
  siteUrl: string;
  name: string;
  alternateName: string[];
  jobTitle: string;
  image: string;
  sameAs: string[];
}

type BuildBlogPostingJsonLdInput = {
  slug: string;
  title: string;
  description: string;
  image?: string;
  publishedAt: string;
  siteUrl: string;
  authorName: string;
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

export function personId (siteUrl: string) {
  return `${getSafeSiteUrl(siteUrl)}/#person`
}

export function websiteId (siteUrl: string) {
  return `${getSafeSiteUrl(siteUrl)}/#website`
}

function buildPerson (input: PersonInput, safeSiteUrl: string): Person {
  return {
    '@type': 'Person',
    '@id': personId(safeSiteUrl),
    name: input.name,
    alternateName: input.alternateName,
    jobTitle: input.jobTitle,
    url: buildCanonicalUrl(safeSiteUrl, '/'),
    image: buildAbsoluteUrl(input.image, safeSiteUrl, '/me.jpg'),
    sameAs: input.sameAs,
  }
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
  const postUrl = buildCanonicalUrl(safeSiteUrl, `/blog/${input.slug}`)
  const blogUrl = buildCanonicalUrl(safeSiteUrl, '/blog')
  const publishedDate = toIsoDateOrUndefined(input.publishedAt)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': postUrl,
    headline: input.title,
    description: input.description,
    image,
    url: postUrl,
    mainEntityOfPage: postUrl,
    ...(publishedDate !== undefined
      ? {
          datePublished: publishedDate,
          dateModified: publishedDate,
        }
      : {}),
    author: { '@id': personId(safeSiteUrl) },
    isPartOf: {
      '@type': 'Blog',
      '@id': blogUrl,
      name: 'Blog',
      url: blogUrl,
    },
  }
}

export function buildWebSiteJsonLd (
  input: PersonInput
): WithContext<WebSite> {
  const safeSiteUrl = getSafeSiteUrl(input.siteUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId(safeSiteUrl),
    name: input.name,
    url: buildCanonicalUrl(safeSiteUrl, '/'),
    author: buildPerson(input, safeSiteUrl),
  }
}

export function buildProfilePageJsonLd (input: {
  siteUrl: string;
  dateCreated: string;
  dateModified: string;
}): WithContext<ProfilePage> {
  const safeSiteUrl = getSafeSiteUrl(input.siteUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: input.dateCreated,
    dateModified: input.dateModified,
    mainEntity: { '@id': personId(safeSiteUrl) },
  }
}

export function buildBreadcrumbJsonLd (
  siteUrl: string,
  items: { name: string; path: string }[]
): WithContext<BreadcrumbList> {
  const safeSiteUrl = getSafeSiteUrl(siteUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(safeSiteUrl, item.path),
    })),
  }
}
