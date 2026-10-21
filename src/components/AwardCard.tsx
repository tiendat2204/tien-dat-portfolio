'use client'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Award, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'
import { ImageZoom } from '@/components/zoomable-image'

interface Props {
  title: string;
  description: string;
  dates: string;
  image?: string;
  images?: readonly string[];
  logo?: string;
  location: string;
  links?: readonly {
    icon: React.ReactNode;
    title: string;
    href: string;
  }[];
}

export function AwardCard ({
  title,
  description,
  dates,
  location,
  image,
  images,
  logo,
  links,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  // A single `image` is a one-photo gallery; it used to be ignored, so those awards showed no photo.
  const photos = images ?? (image ? [image] : [])

  return (
    <motion.li
      className='relative ml-12 py-4 cursor-pointer group'
      onClick={() => setIsExpanded(!isExpanded)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className='absolute -left-17 top-2 flex items-center justify-center'>
        <Badge
          variant='outline'
          className='size-10 rounded-none p-1 border-0 flex items-center justify-center bg-background '
        >
          {logo
            ? (
              <Image src={logo} alt={title} width={24} height={24} className='size-6 rounded-full' />
              )
            : links && links.length > 0
              ? (
                <span className='size-4 fill-white text-white'>{links[0].icon}</span>
                )
              : (
                <Award className='size-4 fill-amber-400 text-amber-400' />
                )}
        </Badge>
      </div>
      <div className='flex flex-col justify-start '>
        {dates && (
          <time className='text-xs text-muted-foreground'>{dates}</time>
        )}
        <h2 className='font-semibold leading-none flex items-center gap-2'>
          <span className='relative inline-block group-hover:text-primary my-1 transition-colors duration-300'>
            {title}
            <span className='absolute left-0 bottom-[-3px] w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-full' />
          </span>
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform duration-500 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </h2>
        {location && (
          <p className='text-sm text-muted-foreground'>{location}</p>
        )}

        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className='overflow-hidden'
        >
          {description && (
            <span className='prose dark:prose-invert text-sm text-muted-foreground block mt-2 relative  group-hover:text-primary transition-colors duration-300'>
              {description}
            </span>
          )}

          {photos.length > 0 && (
            <div
              className={`mt-3 pr-4 grid grid-cols-1 gap-2 ${photos.length > 1 ? 'sm:grid-cols-2' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((src) => (
                <ImageZoom
                  key={src}
                  src={src}
                  alt={title}
                  width={1600}
                  height={1066}
                  className='w-full h-auto border'
                />
              ))}
            </div>
          )}

          {links && links.length > 0 && (
            <div className='mt-2 flex flex-row flex-wrap items-start gap-2'>
              {links.map((link, idx) => (
                <Link
                  href={link.href}
                  key={idx}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Badge key={idx} title={link.title} className='flex min-h-8 gap-2 px-2.5 sm:min-h-0'>
                    {link.title}
                    <ExternalLinkIcon className='size-3' />
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.li>
  )
}
