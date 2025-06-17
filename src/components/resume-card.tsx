'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import React from 'react'
import { Icon } from '@/components/Icon'
import { SkillBadge } from '@/app/section/skills-section'
import { BlurFade } from '@/components/magicui/blur-fade'

const BLUR_FADE_DELAY = 0.1

interface TechnologyType {
  name: string;
  icon: string;
}

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string | readonly (string | ReactNode)[];
  technologies?: readonly TechnologyType[];
  isExpanded?: boolean;
}

export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  technologies,
  isExpanded: initialIsExpanded = false,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(initialIsExpanded)

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className='block cursor-pointer'
      onClick={handleClick}
    >
      <Card className='flex items-start justify-start '>
        <div className='flex items-center gap-1 justify-start bg-accent rounded-md'>
          <Icon
            className={cn(
              'h-5 w-5 sm:h-6 sm:w-6 text-gray-300 transition-transform duration-300',
              isExpanded ? 'rotate-90' : 'rotate-0'
            )}
          />
        </div>
        <div className='grow ml-1 sm:ml-2 items-center flex-col group justify-center'>
          <CardHeader className='pl-4'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-x-2 text-lg'>
              <div className='flex flex-col items-start gap-1 sm:gap-2'>
                <h3 className='inline-flex items-center justify-center font-semibold leading-none text-xs sm:text-sm'>
                  {title}
                  <ChevronRightIcon
                    className={cn(
                      'size-3 sm:size-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100',
                      isExpanded ? 'rotate-90' : 'rotate-0'
                    )}
                  />
                </h3>
                {badges && (
                  <span className='inline-flex flex-wrap gap-1'>
                    {badges.map((badge, index) => (
                      <Badge
                        variant='secondary'
                        className='align-middle text-[10px] sm:text-xs px-1 sm:px-2'
                        key={index}
                      >
                        {badge}
                      </Badge>
                    ))}
                  </span>
                )}
              </div>

              <div className='text-[10px] sm:text-xs tabular-nums text-muted-foreground text-left sm:text-right mt-1 sm:mt-0'>
                {period}
              </div>
            </div>
            {subtitle && <div className='font-sans text-[10px] sm:text-xs mt-1'>{subtitle}</div>}
          </CardHeader>
          {description && (
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
              className='text-xs px-2 sm:px-4'
            >
              <motion.ul
                className={cn('list-disc space-y-1 sm:space-y-2 pl-3 sm:pl-4', isExpanded ? 'pt-2 sm:pt-4' : '')}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {description && Array.isArray(description) &&
                                    description.map((item, index) => (
                                      <li key={index} className='text-muted-foreground'>
                                        {typeof item === 'string' ? item : item}
                                      </li>
                                    ))}
              </motion.ul>

              {technologies && technologies.length > 0 && (
                <div className='mt-2 sm:mt-4 flex flex-wrap gap-1 sm:gap-2'>
                  {technologies.map((tech, index) => (
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
