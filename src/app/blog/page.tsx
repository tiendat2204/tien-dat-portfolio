import { Icon } from '@/components/Icon'
import Link from 'next/link'
import React, { Suspense } from 'react'
import { FlickeringGrid } from '@/components/ui/flickering-grid-hero'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Icons } from '@/components/icons'
import { getAllPosts } from '@/data/blog'
import type { Post } from '@/types/blog'
import { BLUR_FADE_DELAY, GRID_CONFIG, maskStyle } from '@/data/config'
import { Particles } from '@/components/ui/particles'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Back } from '@/app/blog/back'
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
        <Particles
          className='absolute inset-0'
          quantity={100}
          ease={80}
          color='#fff'
          refresh
        />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='mx-auto w-full border-x'>
          <div className='flex items-stretch justify-center w-full min-h-[120px]'>
            <div className='flex flex-col justify-between h-full min-h-[140px] md:min-h-[170px] w-full'>
              <div className='flex items-center justify-between border-y w-full'>
                <Suspense>
                  <div className='px-4'>
                    <Back />
                  </div>
                </Suspense>
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
                    <Link href={`/blog/${post.slug}`} className='block group'>
                      <div className='p-4 hover:bg-accent/50 transition-colors border-b relative bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:4px_4px]'>
                        <span className='absolute left-0 top-0 bottom-0 w-0 group-hover:w-1 bg-primary transition-all duration-300' />
                        <div className='flex gap-4'>
                          {post.metadata.image && (
                            <div className='flex-shrink-0 relative'>
                              <Image
                                src={post.metadata.image}
                                alt={post.metadata.title}
                                width={150}
                                height={120}
                                className='rounded-lg object-cover h-full w-36 md:w-40 lg:w-48'
                              />
                              {post.metadata.new && (
                                <Badge variant='default' className='bg-primary absolute top-2 left-2 text-primary-foreground text-xs h-4.5 px-2 py-1'>NEW</Badge>
                              )}
                            </div>
                          )}
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-1'>
                              <h3 className='text-xl font-bold line-clamp-1'>{post.metadata.title}</h3>
                            </div>
                            <div className='text-sm text-muted-foreground mb-2'>
                              {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <p className='text-sm text-muted-foreground line-clamp-2'>{post.metadata.description || post.metadata.summary}</p>
                            {post.metadata.tags && post.metadata.tags.length > 0 && (
                              <div className='flex flex-wrap gap-1.5 mt-2'>
                                {post.metadata.tags.map((tag: string) => (
                                  <Badge
                                    key={tag}
                                    variant='outline'
                                    className='text-xs hover:bg-primary/10 hover:border-primary/20 transition-colors'
                                  >
                                    # {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
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
