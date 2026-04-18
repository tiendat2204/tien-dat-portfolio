import dayjs from 'dayjs'
import { getTableOfContents } from 'fumadocs-core/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'

import { InlineTOC } from '@/components/inline-toc'
import { MDX } from '@/components/mdx'
import { Icon } from '@/components/Icon'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Prose } from '@/components/ui/typography'
import { getAllPosts, getPostBySlug } from '@/data/blog'
import { BLUR_FADE_DELAY, SITE_INFO } from '@/data/config'
import { USER } from '@/data/user'
import { buildBlogPostingJsonLd } from '@/lib/seo/jsonld'
import {
  buildCanonicalUrl,
  buildMissingPostMetadata,
  buildOgImageUrl,
} from '@/lib/seo/metadata'

import { Back } from './back'

export const revalidate = 3600
export const dynamicParams = false

export async function generateStaticParams () {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug
  const post = getPostBySlug(slug)

  if (!post) {
    return buildMissingPostMetadata(slug)
  }

  const { title, description, image, publishedAt } = post.metadata

  const canonicalUrl = buildCanonicalUrl(SITE_INFO.url, `/blog/${post.slug}`)
  const ogImage = buildOgImageUrl(image, title)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      url: canonicalUrl,
      type: 'article',
      publishedTime: dayjs(publishedAt).toISOString(),
      modifiedTime: dayjs(publishedAt).toISOString(),
      images: {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export default async function Page ({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const slug = (await params).slug
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const toc = getTableOfContents(post.content)
  const pageJsonLd = buildBlogPostingJsonLd({
    slug: post.slug,
    title: post.metadata.title,
    description: post.metadata.description,
    image: post.metadata.image,
    publishedAt: post.metadata.publishedAt,
    siteUrl: SITE_INFO.url,
    author: {
      name: USER.displayName,
      identifier: USER.username,
      image: USER.avatar,
    },
  })
  // const tocDepth2Count = toc.reduce(
  //   (count, item) => (item.depth === 2 ? count + 1 : count),
  //   0
  // );
  return (
    <div className='relative border-x screen-line-before  min-h-screen '>
      <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className=' relative screen-line-after flex items-center justify-between p-2 pl-4 mx-auto max-w-3xl'>
        <Suspense>
          <Back />
        </Suspense>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      </div>

      <Prose className=' max-w-3xl mx-auto'>
        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h1 className=' font-heading font-extrabold font-doto text-3xl md:text-4xl  p-4'>
              {post.metadata.title}
            </h1>
          </BlurFade>
        </div>
        <p className='lead p-4  text-muted-foreground border-b'>{post.metadata.description}</p>
        <div className='border-b'>
          <InlineTOC items={toc} />
        </div>

        <div className='p-4'>
          {/* eslint-disable-next-line @stylistic/jsx-pascal-case */}
          <MDX code={post.content} />
        </div>
      </Prose>

      <div className='screen-line-after relative h-16' />
    </div>
  )
}
