import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { MDX } from '@/components/mdx'
import { Icon } from '@/components/Icon'
import { BlurFade } from '@/components/magicui/blur-fade'
import { DynamicIslandTOC } from '@/components/ui/dynamic-island-toc'
import { Prose } from '@/components/ui/typography'
import { getAllPosts, getPostBySlug } from '@/data/blog'
import { BLUR_FADE_DELAY, SITE_INFO } from '@/data/config'
import { SEO_PROFILE } from '@/data/seo'
import { parsePublishedAt } from '@/lib/seo/date'
import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/jsonld'
import {
  buildMissingPostMetadata,
  buildPageMetadata,
} from '@/lib/seo/metadata'

import { Back } from './back'

export const revalidate = 3600
export const dynamicParams = false

function toIsoDateOrUndefined (value: string) {
  return parsePublishedAt(value)?.toISOString()
}

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

  const publishedTime = toIsoDateOrUndefined(publishedAt)

  return buildPageMetadata({
    siteUrl: SITE_INFO.url,
    siteName: SEO_PROFILE.name,
    path: `/blog/${post.slug}`,
    title,
    description,
    image,
    type: 'article',
    publishedTime,
    authors: [SEO_PROFILE.name],
  })
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

  const pageJsonLd = buildBlogPostingJsonLd({
    slug: post.slug,
    title: post.metadata.title,
    description: post.metadata.description,
    image: post.metadata.image,
    publishedAt: post.metadata.publishedAt,
    siteUrl: SITE_INFO.url,
  })
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(SITE_INFO.url, [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.metadata.title, path: `/blog/${post.slug}` },
  ])
  return (
    <div className='relative'>
      <div className='mx-auto w-full max-w-3xl'>
        <div className='relative w-full border-x screen-line-before min-h-screen'>

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
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c'),
            }}
          />
          <div
            className='relative screen-line-after flex items-center justify-between p-2 pl-4 mx-auto max-w-3xl'
          >
            <Suspense>
              <Back />
            </Suspense>
            <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
            <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
            <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
            <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
          </div>

          <DynamicIslandTOC selector='article h2, article h3'>
            <div className='mx-auto max-w-3xl'>
              <Prose className=' max-w-3xl mx-auto' asChild>
                <article>
                  <div className='border-b'>
                    <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
                      <h1 className=' font-heading font-extrabold font-doto text-3xl md:text-4xl  p-4'>
                        {post.metadata.title}
                      </h1>
                    </BlurFade>
                  </div>
                  <p className='lead p-4  text-muted-foreground border-b'>{post.metadata.description}</p>
                  <div className='p-4'>
                    {/* eslint-disable-next-line @stylistic/jsx-pascal-case */}
                    <MDX code={post.content} />
                  </div>
                </article>
              </Prose>
            </div>
          </DynamicIslandTOC>

          <div className='screen-line-after relative h-16' />
        </div>
      </div>
    </div>
  )
}
