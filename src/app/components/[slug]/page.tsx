import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

import { MDX } from '@/components/mdx'
import { Icon } from '@/components/Icon'
import { CopyButton } from '@/components/copy-button'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Badge } from '@/components/ui/badge'
import { DynamicIslandTOC } from '@/components/ui/dynamic-island-toc'
import { Prose } from '@/components/ui/typography'
import { Back } from '@/app/blog/back'
import { findNeighbour, getAllComponents, getComponentBySlug } from '@/data/blog'
import { BLUR_FADE_DELAY, SITE_INFO } from '@/data/config'
import { getRegistryItem } from '@/data/registry'
import { SEO_PROFILE } from '@/data/seo'
import { buildBreadcrumbJsonLd, buildComponentJsonLd } from '@/lib/seo/jsonld'
import { buildMissingPostMetadata, buildPageMetadata } from '@/lib/seo/metadata'
import { formatDate } from '@/lib/utils'

export const revalidate = 3600
export const dynamicParams = false

export async function generateStaticParams () {
  return getAllComponents().map((component) => ({ slug: component.slug }))
}

export async function generateMetadata ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params).slug
  const component = getComponentBySlug(slug)

  if (!component) {
    return buildMissingPostMetadata(slug)
  }

  const { title, description, image } = component.metadata

  return buildPageMetadata({
    siteUrl: SITE_INFO.url,
    siteName: SEO_PROFILE.name,
    path: `/components/${component.slug}`,
    title,
    description,
    image,
    authors: [SEO_PROFILE.name],
  })
}

function JsonLd ({ data }: { data: object }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export default async function ComponentPage ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug
  const component = getComponentBySlug(slug)

  if (!component) {
    notFound()
  }

  const { title, description, image, publishedAt, registry } = component.metadata
  const registryItem = registry ? getRegistryItem(registry) : undefined
  const installCommand = registry
    ? `npx shadcn@latest add ${new URL(SITE_INFO.url).origin}/r/${registry}.json`
    : undefined
  const { previous, next } = findNeighbour(getAllComponents(), component.slug)

  return (
    <div className='relative'>
      <div className='mx-auto w-full max-w-3xl'>
        <div className='relative w-full border-x screen-line-before min-h-screen'>
          <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
          <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
          <JsonLd data={buildComponentJsonLd({ slug: component.slug, title, description, image, publishedAt, siteUrl: SITE_INFO.url })} />
          <JsonLd
            data={buildBreadcrumbJsonLd(SITE_INFO.url, [
              { name: 'Home', path: '/' },
              { name: 'Components', path: '/components' },
              { name: title, path: `/components/${component.slug}` },
            ])}
          />

          <div className='relative screen-line-after flex items-center justify-between p-2 pl-4'>
            <Suspense>
              <Back href='/components' label='Components' />
            </Suspense>
          </div>

          <DynamicIslandTOC selector='article h2:not(.not-prose *), article h3:not(.not-prose *)'>
            <Prose className='max-w-3xl mx-auto' asChild>
              <article>
                <header className='border-b'>
                  <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
                    <h1 className='font-heading font-extrabold font-doto text-3xl md:text-4xl p-4 pb-2'>
                      {title}
                    </h1>
                  </BlurFade>
                  <p className='lead px-4 text-muted-foreground'>{description}</p>

                  <div className='not-prose flex flex-col gap-3 px-4 pb-4 font-ibm text-xs'>
                    <div className='flex flex-wrap items-center gap-1.5 text-muted-foreground'>
                      {publishedAt && <span>{formatDate(publishedAt)}</span>}
                      {registryItem && [...registryItem.dependencies, ...registryItem.registryDependencies.map((d) => `shadcn/${d}`)].map((dep) => (
                        <Badge key={dep} variant='outline' className='px-1.5 text-[10px] font-normal'>
                          {dep}
                        </Badge>
                      ))}
                    </div>
                    {installCommand && (
                      <div className='flex min-w-0 items-center gap-2 border border-dashed bg-muted/40 py-1 pr-1 pl-2'>
                        <span className='select-none text-muted-foreground'>$</span>
                        <code className='min-w-0 flex-1 truncate' title={installCommand}>{installCommand}</code>
                        <CopyButton value={installCommand} className='shrink-0' />
                      </div>
                    )}
                  </div>
                </header>

                <div className='p-4'>
                  {/* eslint-disable-next-line @stylistic/jsx-pascal-case */}
                  <MDX code={component.content} />
                </div>
              </article>
            </Prose>
          </DynamicIslandTOC>

          {(previous || next) && (
            <nav aria-label='More components' className='grid grid-cols-2 border-t font-ibm text-sm'>
              {previous
                ? (
                  <Link href={`/components/${previous.slug}`} className='group flex flex-col gap-1 p-4 hover:bg-muted/30'>
                    <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                      <ArrowLeftIcon className='size-3 transition-transform group-hover:-translate-x-0.5' /> Previous
                    </span>
                    <span className='truncate font-semibold'>{previous.metadata.title}</span>
                  </Link>
                  )
                : <span />}
              {next && (
                <Link href={`/components/${next.slug}`} className='group flex flex-col items-end gap-1 border-l border-dashed p-4 text-right hover:bg-muted/30'>
                  <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                    Next <ArrowRightIcon className='size-3 transition-transform group-hover:translate-x-0.5' />
                  </span>
                  <span className='truncate font-semibold'>{next.metadata.title}</span>
                </Link>
              )}
            </nav>
          )}

          <div className='screen-line-after relative h-16 border-t' />
        </div>
      </div>
    </div>
  )
}
