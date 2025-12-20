'use client'

import { Badge } from '@/components/ui/badge'
import { DATA } from '@/data/resume'
import { BlurFade } from '@/components/magicui/blur-fade'
import BlurFadeText from '@/components/magicui/blur-fade-text'
import Image from 'next/image'

const BLUR_FADE_DELAY = 0.04

interface SkillBadgeProps {
  name: string;
  icon?: string;
}

export function SkillBadge ({ name, icon }: SkillBadgeProps) {
  return (
    <Badge
      variant='secondary'
      className='text-xs font-medium py-2.5'
    >
      {icon && (
        <Image
          src={`/icons/${icon}`}
          alt={name}
          width={14}
          height={14}
          className='flex-shrink-0'
        />
      )}
      {name}
    </Badge>
  )
}

interface CategorySectionProps {
  title: string;
  skills: readonly { readonly name: string; readonly icon: string }[];
  delay?: number;
}

function CategorySection ({ title, skills, delay = 0 }: CategorySectionProps) {
  return (
    <BlurFade delay={delay}>
      <div className='mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <span className='text-gray-500 text-sm'>{'<'}</span>
          <h3 className='text-gray-400 text-sm font-medium uppercase tracking-wider'>
            {title}
          </h3>
          <span className='text-gray-500 text-sm'>{'/>'}</span>
        </div>{' '}
        <div className='flex flex-wrap gap-2'>
          {skills.map((skill, id) => (
            <BlurFade key={skill.name} delay={delay + 0.1 + id * 0.05}>
              <Badge
                variant='outline'
                className='text-xs font-medium py-2.5'
              >
                <Image
                  src={`/icons/${skill.icon}`}
                  alt={skill.name}
                  width={14}
                  height={14}
                  className='flex-shrink-0'
                />
                {skill.name}
              </Badge>
            </BlurFade>
          ))}
        </div>
      </div>
    </BlurFade>
  )
}

export default function SkillsSection () {
  return (
    <div className=' p-4  font-ibm'>
      <div className='max-w-4xl mx-auto'>
        <BlurFadeText
          delay={BLUR_FADE_DELAY}
          className='dark:text-gray-400 text-muted-foreground text-sm mb-2'
          text='Which I use? See below.'
        />

        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className='mb-4  screen-line-after pb-4'>
            {' '}
            <div className='dark:text-gray-300 text-muted-foreground text-sm leading-8 '>
              My main Tech stack is{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 3} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.framework.name}
                  icon={DATA.skills.mainStack.framework.icon}
                />
              </BlurFade>{' '}
              and
              {' '}
              <BlurFade delay={BLUR_FADE_DELAY * 4} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.framework2.name}
                  icon={DATA.skills.mainStack.framework2.icon}
                />
              </BlurFade>{' '}
              as a frontend

              framework with{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 4} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.styling.name}
                  icon={DATA.skills.mainStack.styling.icon}
                />
              </BlurFade>{' '}
              CSS as a styling library, for the database I use{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 5} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.database.name}
                  icon={DATA.skills.mainStack.database.icon}
                />
              </BlurFade>{' '}
              deployed on{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 6} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.deployment.name}
                  icon={DATA.skills.mainStack.deployment.icon}
                />
              </BlurFade>{' '}
              with{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 7} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.orm.name}
                  icon={DATA.skills.mainStack.orm.icon}
                />
              </BlurFade>{' '}
              as an ORM, for database management I use{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 8} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.databaseTool.name}
                  icon={DATA.skills.mainStack.databaseTool.icon}
                />
              </BlurFade>
            </div>
            <br />
            <div className='dark:text-gray-300 text-muted-foreground text-sm'>
              At last, but not least, I use{' '}
              <BlurFade delay={BLUR_FADE_DELAY * 9} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.ide.name}
                  icon={DATA.skills.mainStack.ide.icon}
                />
              </BlurFade>{' '}
              IDE for creating awesome projects. 🖤
            </div>
          </div>
        </BlurFade>

        <CategorySection
          title='LANGUAGES'
          skills={DATA.skills.languages}
          delay={BLUR_FADE_DELAY * 10}
        />
        <CategorySection
          title='FRAMEWORKS'
          skills={DATA.skills.frameworks}
          delay={BLUR_FADE_DELAY * 15}
        />
        <CategorySection
          title='TOOLS'
          skills={DATA.skills.tools}
          delay={BLUR_FADE_DELAY * 20}
        />
        <CategorySection
          title='PLATFORMS'
          skills={DATA.skills.platforms}
          delay={BLUR_FADE_DELAY * 25}
        />
        <CategorySection
          title='SOFTWARES'
          skills={DATA.skills.softwares}
          delay={BLUR_FADE_DELAY * 30}
        />
        <CategorySection
          title='DEV OPS'
          skills={DATA.skills.devOps}
          delay={BLUR_FADE_DELAY * 35}
        />

        <BlurFadeText
          delay={BLUR_FADE_DELAY * 40}
          className='text-gray-500 text-sm mt-4'
          text='Few more... but secret hehehe :3'
        />
      </div>
    </div>
  )
}
