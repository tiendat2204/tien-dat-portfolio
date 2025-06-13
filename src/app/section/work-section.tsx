import React from 'react'
import { DATA } from '@/data/resume'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ResumeCard } from '@/components/resume-card'
const BLUR_FADE_DELAY = 0.04
const WorkSection = () => {
  return (
    <div className='relative'>
      {DATA.work.map((company, companyIndex) => (
        <div key={company.company} className='relative screen-line-after'>
          <BlurFade
            delay={BLUR_FADE_DELAY * 6 + companyIndex * 0.1}
            key={`header-${company.company}`}
          >
            <div className='company-header py-4 border-b border-muted '>
              <div className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'>
                <div className='relative'>
                  <div className='w-3 h-3 bg-primary rounded-full relative z-10' />
                  <div className='absolute inset-0 w-3 h-3 bg-primary/30 rounded-full animate-ping' />
                  <div className='absolute inset-0 w-3 h-3 bg-primary/20 rounded-full animate-pulse scale-150' />
                  <div className='absolute inset-0 w-3 h-3 bg-primary/10 rounded-full animate-ping animation-delay-75 scale-200' />
                </div>
              </div>
              <div className='flex items-center gap-3 pl-6'>
                <div className='flex-none '>
                  <Avatar className='border size-12 m-auto bg-muted-background dark:bg-foreground '>
                    <AvatarImage
                      src={company.logoUrl}
                      alt={company.company}
                      className='object-contain'
                    />
                    <AvatarFallback>
                      {company.company.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className='font-bold text-lg text-foreground'>
                    {company.company}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {company.location}
                  </p>
                </div>
              </div>
            </div>
          </BlurFade>

          <div className='relative p-4 space-y-4'>
            {company.positions.map((position, positionIndex) => (
              <div
                key={`${company.company}-${position.title}`}
              >
                <BlurFade
                  delay={
                                        BLUR_FADE_DELAY * 6 +
                                        companyIndex * 0.1 +
                                        (positionIndex + 1) * 0.05
                                    }
                >
                  <ResumeCard
                    logoUrl={company.logoUrl}
                    altText={company.company}
                    title={position.title}
                    subtitle=''
                    href={company.href}
                    badges={position.badges}
                    period={`${position.start} - ${
                                            position.end ?? 'Present'
                                        }`}
                    description={position.description}
                    technologies={position.technologies}
                    isExpanded={position.isExpanded}
                  />
                </BlurFade>
              </div>
            ))}
          </div>
        </div>

      ))}
    </div>
  )
}

export default WorkSection
