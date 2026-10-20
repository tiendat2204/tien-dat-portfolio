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
  iconDark?: string;
  variant?: 'secondary' | 'outline';
}

function SkillIcon ({ name, icon, iconDark }: { name: string; icon?: string; iconDark?: string }) {
  if (!icon) {
    return (
      <span aria-hidden='true' className='flex size-3.5 shrink-0 items-center justify-center'>
        <span className='size-1.5 bg-foreground/60' />
      </span>
    )
  }
  const img = (src: string, className: string) => (
    <Image src={`/icons/${src}`} alt={name} width={14} height={14} className={`size-3.5 shrink-0 ${className}`} />
  )
  if (!iconDark) return img(icon, '')
  return (
    <>
      {img(icon, 'dark:hidden')}
      {img(iconDark, 'hidden dark:block')}
    </>
  )
}

export function SkillBadge ({ name, icon, iconDark, variant = 'secondary' }: SkillBadgeProps) {
  return (
    <Badge
      variant={variant}
      className='text-xs font-medium py-2.5'
    >
      <SkillIcon name={name} icon={icon} iconDark={iconDark} />
      {name}
    </Badge>
  )
}

interface CategorySectionProps {
  title: string;
  skills: readonly { readonly name: string; readonly icon?: string; readonly iconDark?: string }[];
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
        </div>
        <div className='flex flex-wrap gap-2'>
          {skills.map((skill, id) => (
            <BlurFade key={skill.name} delay={delay + 0.1 + id * 0.05} className='flex'>
              <SkillBadge name={skill.name} icon={skill.icon} iconDark={skill.iconDark} variant='outline' />
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
                  iconDark={DATA.skills.mainStack.framework.iconDark}
                />
              </BlurFade>{' '}
              and
              {' '}
              <BlurFade delay={BLUR_FADE_DELAY * 4} className='inline-block'>
                <SkillBadge
                  name={DATA.skills.mainStack.framework2.name}
                  icon={DATA.skills.mainStack.framework2.icon}
                  iconDark={DATA.skills.mainStack.framework2.iconDark}
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
          title='FRONTEND'
          skills={DATA.skills.frontend}
          delay={BLUR_FADE_DELAY * 14}
        />
        <CategorySection
          title='BACKEND'
          skills={DATA.skills.backend}
          delay={BLUR_FADE_DELAY * 18}
        />
        <CategorySection
          title='DATABASE'
          skills={DATA.skills.database}
          delay={BLUR_FADE_DELAY * 22}
        />
        <CategorySection
          title='TESTING & DEVOPS'
          skills={DATA.skills.testingDevOps}
          delay={BLUR_FADE_DELAY * 26}
        />
        <CategorySection
          title='AI-ASSISTED DEV'
          skills={DATA.skills.aiTools}
          delay={BLUR_FADE_DELAY * 30}
        />
        <CategorySection
          title='TOOLS'
          skills={DATA.skills.tools}
          delay={BLUR_FADE_DELAY * 34}
        />
        <CategorySection
          title='PLATFORMS'
          skills={DATA.skills.platforms}
          delay={BLUR_FADE_DELAY * 38}
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
