import Link from 'next/link'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/Icon'
import { getAllPosts } from '@/data/blog'
import type { Post } from '@/types/blog'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BLUR_FADE_DELAY } from '@/data/config'
import React from 'react'

export default function BlogSection () {
  const posts:Post[] = getAllPosts()
  const featuredPosts:Post[] = posts.slice(0, 4)

  return (
    <section id='blog' className='relative screen-line-after border-x'>
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
      <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      <div className='border-b'>
        <div className='flex items-center justify-between'>
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>Recent Articles</h2>
          </BlurFade>
          <Link
            href='/blog'
            className='flex items-center px-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'
          >
            View all
            <ArrowRightIcon className='ml-1 h-4 w-4' />
          </Link>
        </div>
      </div>
      <div className='mx-auto w-full space-y-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4'>
          {featuredPosts.length > 0
            ? (
                featuredPosts.map((post, index) => (
                  <div
                    key={post.slug || index}
                    className='h-full dark:bg-muted/50 bg-muted/90 backdrop-blur-lg p-1.5 rounded-2xl'
                  >
                    <div className='group relative flex flex-col overflow-hidden rounded-xl border bg-lines-pattern-light dark:bg-lines-pattern size-full bg-repeat bg-card bg-[length:30px_30px] h-full'>
                      <div className='absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10' />
                      <div className='relative z-20 md:p-4 p-3 flex flex-col h-full'>
                        <div className='flex justify-between items-center mb-2'>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm text-muted-foreground'>
                              {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
                            </p>
                            {post.metadata.new && (
                              <Badge variant='default' className='bg-primary text-primary-foreground text-xs h-4.5 font-medium px-2 py-0.5'>
                                NEW
                              </Badge>
                            )}
                          </div>
                          {post.metadata.category && (
                            <Badge variant='outline' className='bg-primary/10'>
                              {post.metadata.category}
                            </Badge>
                          )}
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <h3 className='text-lg font-semibold mb-2 group-hover:underline transition-colors line-clamp-1'>
                            {post.metadata.title}
                          </h3>
                        </Link>

                        <p className='text-sm text-muted-foreground line-clamp-2 mb-4'>
                          {post.metadata.description}
                        </p>

                        <div className='mt-auto'>
                          {post.metadata.tags && post.metadata.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1.5 mb-3'>
                              {post.metadata.tags.slice(0, 2).map((tag: string) => (
                                <Badge
                                  key={tag}
                                  variant='outline'
                                  className='text-xs hover:bg-primary/10 hover:border-primary/20 transition-colors'
                                >
                                  # {tag}
                                </Badge>
                              ))}
                              {post.metadata.tags.length > 2 && (
                                <Badge
                                  variant='outline'
                                  className='text-xs hover:bg-primary/10 hover:border-primary/20 transition-colors'
                                >
                                  +{post.metadata.tags.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className='pt-2 flex items-center'>
                            <Link
                              href={`/blog/${post.slug}`}
                              className='text-sm font-medium text-primary flex items-center'
                            >
                              Read more
                              <ArrowRightIcon className='ml-1 h-3 w-3 transition-transform group-hover:translate-x-1' />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            : (
              <div className='col-span-full text-center py-10'>
                <p className='text-muted-foreground'>No blog posts found.</p>
              </div>
              )}
        </div>
      </div>
    </section>
  )
}
