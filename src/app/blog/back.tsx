'use client'

import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'

// href/label override the default: Home, or Components when arriving with utm_source=components.
export function Back ({ href, label }: { href?: string; label?: string }) {
  const searchParams = useSearchParams()

  const source = searchParams.get('utm_source')
  const isComponents = source === 'components'
  const target = href ?? (isComponents ? '/components' : '/')
  const text = label ?? (isComponents ? 'Components' : 'Home')

  return (
    <Button
      className='px-0 text-muted-foreground gap-2 relative hover:no-underline group hover:text-foreground transition-colors duration-300'
      variant='link'
      asChild
    >
      <Link href={target}>
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className='inline-flex items-center'
        >
          <ArrowLeftIcon className='size-4 mr-1 transition-transform duration-300' />
        </motion.div>
        <span className='relative'>
          {text}
          <span className='absolute -bottom-1 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300' />
        </span>
      </Link>
    </Button>
  )
}
