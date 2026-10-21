'use client'

import { Badge } from '@/components/ui/badge'
import { DATA } from '@/data/resume'
import { BlurFade } from '@/components/magicui/blur-fade'
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

type Skill = { readonly name: string; readonly icon?: string; readonly iconDark?: string }

// Every skill in the grouped lists, so the intro sentence reuses their names and icons.
const ALL_SKILLS = new Map<string, Skill>(
  Object.values(DATA.skills).flatMap((group) => (Array.isArray(group) ? group : []) as Skill[]).map((skill) => [skill.name, skill])
)

// Inline badge sized to the text line so the paragraph keeps an even rhythm.
function Stack ({ name, label }: { name: string; label?: string }) {
  const skill = ALL_SKILLS.get(name)
  return (
    <Badge variant='secondary' className='align-middle py-0.5 text-xs font-medium'>
      <SkillIcon name={label ?? name} icon={skill?.icon} iconDark={skill?.iconDark} />
      {label ?? name}
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
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <p className='mb-4 screen-line-after pb-4 text-sm leading-8 text-muted-foreground dark:text-gray-300'>
            I build full-stack with <Stack name='TypeScript' />: <Stack name='Next.js' /> and <Stack name='React' /> on
            the frontend, styled with <Stack name='Tailwind CSS' /> and <Stack name='shadcn/ui' />, with{' '}
            <Stack name='TanStack Router · Query · Table' label='TanStack Query' /> for server state. On the backend I
            use <Stack name='NestJS' /> and <Stack name='Django REST Framework' /> on <Stack name='PostgreSQL' />,
            through <Stack name='Drizzle' /> or <Stack name='Prisma' />. I ship with <Stack name='Docker' /> and{' '}
            <Stack name='GitHub Actions' />, test with <Stack name='Playwright' /> and <Stack name='Vitest' />, and write
            code in <Stack name='WebStorm' /> and <Stack name='VS Code' /> alongside <Stack name='Claude Code' />.
          </p>
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
      </div>
    </div>
  )
}
