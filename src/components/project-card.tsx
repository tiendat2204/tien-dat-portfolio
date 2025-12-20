'use client'

import { Card, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { SkillBadge } from '@/app/section/skills-section'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const BLUR_FADE_DELAY = 0.1

interface Technology {
  name: string;
  icon: string;
}

interface Position {
  title: string;
  badges: readonly string[];
  start: string;
  end: string | null;
  description: readonly string[];
  technologies: readonly Technology[];
  isExpanded?: boolean;
}

interface ProjectCardProps {
  title: string;
  href?: string;
  logoUrl: string;
  positions: readonly Position[];
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  image?: string;
  className?: string;
}

export function ProjectCard ({
  title,
  positions,
  links,
  image,
}: ProjectCardProps) {
  const initialIsExpanded :boolean = positions[0]?.isExpanded || false
  const [isExpanded, setIsExpanded] = React.useState(initialIsExpanded)

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className='block cursor-pointer border-b' onClick={handleClick}>
      <Card className='flex items-start justify-start ring-0 flex-row  gap-0'>
        <div className='flex items-center gap-1 justify-start p-4'>
          <Avatar
            className={cn(
              'h-6 w-6 bg-accent rounded-full transition-all duration-300',
              isExpanded ? 'ring-2 ring-primary/80 ring-offset-1' : 'ring-0'
            )}
          >
            <AvatarImage src={image} alt={`${title} logo`} />
            <AvatarFallback>{title.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className='grow px-4 items-center flex-col group justify-center border-l border-dashed'>
          <CardHeader className='p-0'>
            <div className='flex items-center justify-between gap-x-2 text-base'>
              <div className='flex flex-col items-start gap-2'>
                <h3 className='inline-flex items-center justify-center font-semibold leading-none text-xs sm:text-sm'>
                  {title}
                  <ChevronRightIcon
                    className={cn(
                      'size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100',
                      isExpanded ? 'rotate-90' : 'rotate-0'
                    )}
                  />
                </h3>
              </div>

              <div className='text-xs sm:text-sm tabular-nums text-muted-foreground text-right'>
                {positions[0]?.start &&
                                    `${positions[0].start}${positions[0].end ? ` - ${positions[0].end}` : ' - Present'}`}
              </div>
            </div>

            {positions[0]?.title && <div className='font-sans text-xs'>{positions[0].title}</div>}
            {links && links.length > 0 && (
              <div className='flex gap-2 mt-2'>
                {links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='inline-flex items-center gap-1 text-xs px-2 py-1  bg-secondary hover:bg-secondary/80 transition-colors'
                  >
                    {link.icon}
                    <span>{link.type}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardHeader>
          {positions[0]?.description && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isExpanded ? 1 : 0,
                height: isExpanded ? 'auto' : 0,
              }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className='text-xs sm:text-sm px-4'
            >
              <motion.ul
                className={cn('list-disc space-y-2 pl-4', isExpanded ? 'pt-4' : '')}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {positions[0]?.description && Array.isArray(positions[0].description) &&
                                    positions[0].description.map((item, index) => (
                                      <li key={index} className='text-muted-foreground'>
                                        {item}
                                      </li>
                                    ))}
              </motion.ul>

              {positions[0]?.technologies && positions[0].technologies.length > 0 && (
                <div className='mt-4 flex flex-wrap gap-2'>
                  {positions[0].technologies.map((tech, index) => (
                    <BlurFade
                      key={tech.name}
                      delay={BLUR_FADE_DELAY * (index + 1)}
                      className='inline-block'
                    >
                      <SkillBadge
                        name={tech.name}
                        icon={tech.icon}
                      />
                    </BlurFade>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}
