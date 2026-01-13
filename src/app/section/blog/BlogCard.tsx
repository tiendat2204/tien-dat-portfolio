'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BLUR_FADE_DELAY } from '@/data/config'
import type { Post } from '@/types/blog'

interface BlogCardProps {
  post: Post
  index: number
}

export function BlogCard ({ post, index }: BlogCardProps) {
  const [isActive, setIsActive] = useState(false)
  const [, setIsFlashing] = useState(false)
  const timeoutIds = useRef<NodeJS.Timeout[]>([])

  const handleMouseEnter = () => {
    timeoutIds.current.forEach(id => clearTimeout(id))
    timeoutIds.current = []

    timeoutIds.current.push(setTimeout(() => setIsActive(false), 100))
    timeoutIds.current.push(setTimeout(() => setIsActive(true), 200))
    timeoutIds.current.push(setTimeout(() => setIsActive(false), 300))
    timeoutIds.current.push(setTimeout(() => {
      setIsActive(true)
      setIsFlashing(false)
    }, 400))
  }

  const handleMouseLeave = () => {
    timeoutIds.current.forEach(id => clearTimeout(id))
    timeoutIds.current = []

    setIsActive(false)
    setIsFlashing(false)
  }

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach(id => clearTimeout(id))
    }
  }, [])

  return (
    <div
      className='group relative flex cursor-pointer flex-col border border-dashed border-border/50 p-2'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`pointer-events-none absolute inset-0 z-10 -m-px border border-dashed border-white/15 bg-muted/15  ${isActive ? 'opacity-100' : 'opacity-0 '}`}>
        <div className='absolute -left-px -top-px h-2 w-2 border-l border-t border-white/90' />
        <div className='absolute -right-px -top-px h-2 w-2 border-r border-t border-white/90' />
        <div className='absolute -bottom-px -right-px h-2 w-2 border-b border-r border-white/90' />
        <div className='absolute -bottom-px -left-px h-2 w-2 border-b border-l border-white/90' />
      </div>

      <div className='relative flex flex-col overflow-hidden bg-lines-pattern-light dark:bg-lines-pattern size-full bg-repeat bg-card bg-[length:30px_30px] h-full'>
        <div className='relative z-20 md:p-4 p-3 flex flex-col h-full'>
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted-foreground'>
                {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
              </p>
              {post.metadata.new && (
                <Badge variant='default' className='bg-primary text-primary-foreground text-xs h-4 font-medium px-2 py-0.5'>
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
          <BlurFade delay={BLUR_FADE_DELAY * (index + 1)} offset={0}>
            <div className='w-full aspect-[5/4] relative mb-3 overflow-hidden'>
              <Image
                src={post.metadata.image || '/images/default-blog-image.jpg'}
                alt={post.metadata.title}
                fill
                className='object-cover transition-transform group-hover:scale-105 duration-500'
              />
            </div>
          </BlurFade>
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
  )
}
