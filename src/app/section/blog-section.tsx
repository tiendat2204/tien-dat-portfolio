import Link from 'next/link'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Icon } from '@/components/Icon'
import { getAllPosts } from '@/data/blog'
import type { Post } from '@/types/blog'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BLUR_FADE_DELAY } from '@/data/config'
import { BlogCard } from './blog/BlogCard'

export default function BlogSection () {
  const posts: Post[] = getAllPosts()
  const featuredPosts: Post[] = posts.slice(0, 4)

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
            ? featuredPosts.map((post, index) => (
              <BlogCard key={post.slug || index} post={post} index={index} />
            ))
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
