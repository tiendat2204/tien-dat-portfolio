'use client'

import { Icon } from '@/components/Icon'
import BlurFadeText from '@/components/magicui/blur-fade-text'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { FlickeringGrid } from '@/components/ui/flickering-grid-hero'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Icons } from '@/components/icons'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GRID_CONFIG, maskStyle } from '@/data/config'

type BlogPost = {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  source: string;
}

const BLUR_FADE_DELAY = 0.04

export default function BlogDetailPage () {
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  console.log('BlogDetailPage slug:', post)
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch('/api/blogs')
        if (response.ok) {
          const posts = await response.json()
          const currentPost = posts.find((p: BlogPost) => p.slug === slug)
          if (currentPost) {
            setPost(currentPost)
          }
        }
      } catch (error) {
        console.error('Error fetching blog post:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  if (loading) {
    return (
      <main className='flex flex-col '>
        <section className='relative screen-line-before border-x'>
          <div className='flex w-full h-[200px] justify-center items-center'>
            <div className='animate-pulse w-full h-full' />
          </div>
        </section>
      </main>
    )
  }

  if (!post) {
    return (
      <main className='flex flex-col '>
        <section className='relative screen-line-before border-x p-4'>
          <h1 className='text-2xl font-bold'>Post not found</h1>
          <p className='mt-4'>
            <Link href='/blog' className='text-blue-500 hover:underline'>
              ← Back to blog
            </Link>
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className='flex flex-col '>
      <section
        id='background'
        className='relative screen-line-before border-x'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white' />
        <div className='flex w-full h-[200px] justify-center items-center'>
          <FlickeringGrid
            className='absolute inset-0 z-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] motion-safe:animate-pulse'
            {...GRID_CONFIG.background}
          />
          <div
            className='absolute inset-0 z-0 motion-safe:animate-fade-in'
            style={{
              ...maskStyle,
              animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            <FlickeringGrid {...GRID_CONFIG.logo} />
          </div>
        </div>
      </section>

      <section
        id='blog-header'
        className='relative screen-line-before screen-line-after '
      >
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white' />
        <div className='mx-auto w-full space-y-8 border-x'>
          <div className='flex items-stretch justify-center min-h-[120px]'>
            <div className='flex flex-col justify-between h-full min-h-[140px] md:min-h-[170px] w-full'>
              <div className='flex items-center justify-between border-y w-full'>
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className='text-3xl font-extrabold tracking-tight sm:text-3xl font-doto px-4'
                  yOffset={0}
                  text={post.title || 'Blog'}
                />
                <div className='size-6 mr-4'>
                  <Icons.Logo />
                </div>
              </div>
              <BlurFade delay={BLUR_FADE_DELAY}>
                <p className='px-4 font-normal font-ibm text-left text-muted'>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      <section id='blog-content' className='relative screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 text-white' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white' />

        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <p className='text-xl px-4 py-2 font-ibm text-muted-foreground'>{post.summary}</p>
          </BlurFade>
        </div>

        <div className='px-4 py-6'>
          <BlurFade delay={BLUR_FADE_DELAY * 4} offset={0}>
            <article
              className='prose prose-zinc dark:prose-invert max-w-none font-ibm wiki-styled'
              dangerouslySetInnerHTML={{ __html: post.source }}
            />
          </BlurFade>
        </div>

        <div className='border-t p-4'>
          <BlurFade delay={BLUR_FADE_DELAY * 5} offset={0}>
            <Link href='/blog' className='flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to all posts
            </Link>
          </BlurFade>
        </div>
      </section>
    </main>
  )
}
