import { Icon } from '@/components/Icon'
import BlurFadeText from '@/components/magicui/blur-fade-text'
import Link from 'next/link'
import React from 'react'
import { FlickeringGrid } from '@/components/ui/flickering-grid-hero'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Icons } from '@/components/icons'
import { getAllPosts } from '@/data/blog'
import type { Post } from '@/types/blog'
import { BLUR_FADE_DELAY, GRID_CONFIG, maskStyle } from '@/data/config'

export default function BlogPage () {
  const posts: Post[] = getAllPosts()

  return (
    <main className='flex flex-col '>
      <section
        id='background'
        className='relative screen-line-before border-x'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
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
        className='relative screen-line-before screen-line-after'
      >
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='mx-auto w-full border-x'>
          <div className='flex items-stretch justify-center w-full min-h-[120px]'>
            <div className='flex flex-col justify-between h-full min-h-[140px] md:min-h-[170px] w-full'>
              <div className='flex items-center justify-between border-y w-full'>
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className='text-3xl font-extrabold tracking-tight sm:text-3xl font-doto px-4'
                  yOffset={0}
                  text='Blog'
                />
                <div className='size-6 mr-4'>
                  <Icons.Logo />
                </div>
              </div>
              <BlurFade delay={BLUR_FADE_DELAY}>
                <p className='px-4 py-3 font-normal font-ibm text-left text-muted-foreground'>
                  Thoughts, ideas, and reflections
                </p>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      <section id='blog-posts' className='relative screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />

        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className='text-2xl font-extrabold px-4 py-2 font-doto'>All Posts</h2>
          </BlurFade>
        </div>

        <div className=''>
          {posts.length > 0
            ? (
              <div className=' font-ibm'>
                {posts.map((post: Post, index: number) => (
                  <BlurFade key={post.slug} delay={BLUR_FADE_DELAY * (index + 4)} offset={0}>
                    <Link href={`/blog/${post.slug}`} className='block'>
                      <div className='p-4 hover:bg-accent/50 transition-colors border-b '>
                        <h3 className='text-xl font-bold mb-1 line-clamp-1'>{post.metadata.title}</h3>
                        <div className='text-sm text-muted-foreground mb-2'>
                          {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <p className='text-sm text-muted-foreground'>{post.metadata.description || post.metadata.summary}</p>
                      </div>
                    </Link>
                  </BlurFade>
                ))}
              </div>
              )
            : (
              <p className='text-muted-foreground text-center py-8'>No blog posts found.</p>
              )}
        </div>
      </section>

      <section className='relative screen-line-after border-x h-16 size-full bg-repeat bg-[length:30px_30px] bg-lines-pattern-light dark:bg-lines-pattern'>
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      </section>
    </main>
  )
}
