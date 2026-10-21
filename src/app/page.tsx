import Image from 'next/image'
import { AwardCard } from '@/components/AwardCard'
import BlurFadeText from '@/components/magicui/blur-fade-text'
import { ProjectCard } from '@/components/project-card'
import { ResumeCard } from '@/components/resume-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DATA } from '@/data/resume'
import Markdown from 'react-markdown'
import { BlurFade } from '@/components/magicui/blur-fade'
import SkillsSection from './section/skills-section'
import WorkSection from '@/app/section/work-section'
import BlogSection from '@/app/section/blog-section'
import ComponentsSection from '@/app/section/components-section'
import { Icon } from '@/components/Icon'
import { TextLoop } from '@/components/ui/text-loop'
import { Icons } from '@/components/icons'
import { BLUR_FADE_DELAY, SITE_INFO } from '@/data/config'
import { SEO_PROFILE } from '@/data/seo'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { buildProfilePageJsonLd } from '@/lib/seo/jsonld'
import { USER } from '@/data/user'
import { GitHubContributions } from './section/github-contributions'
import { InsightsSection } from './section/insights-section'
import { Status, StatusIndicator, StatusLabel } from '@/components/kibo-ui/status'
import { BackgroundHero } from '@/components/landing/background-hero'
import { LocalTime } from '@/components/local-time'
import { HowIBuildSection } from './section/how-i-build-section'

export const metadata = buildPageMetadata({
  siteUrl: SITE_INFO.url,
  siteName: SEO_PROFILE.name,
  path: '/',
  title: SEO_PROFILE.homeTitle,
  description: SEO_PROFILE.description,
  absoluteTitle: true,
  type: 'profile',
  image: SEO_PROFILE.image,
})

export default function Page () {
  const profileJsonLd = buildProfilePageJsonLd({
    siteUrl: SITE_INFO.url,
    dateCreated: USER.dateCreated,
    dateModified: new Date().toISOString(),
  })

  return (
    <main className='flex flex-col min-h-dvh mx-auto w-full max-w-3xl'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profileJsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <section
        id='background'
        className='relative screen-line-before  border-x'
      >
        <Icon className='absolute z-41 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-41 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <BackgroundHero />
      </section>
      <section
        id='information'
        className='relative screen-line-before screen-line-after pt-1 '
      >
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='mx-auto w-full space-y-8 border-x'>
          <div className='flex items-stretch justify-start min-h-[120px]'>
            <div className='flex shrink-0 items-center'>
              <Avatar className='group size-32 text overflow-hidden rounded-full m-1.5 ring-1 ring-border ring-offset-2 ring-offset-background select-none sm:size-40'>
                <AvatarImage
                  alt={DATA.name}
                  src={DATA.avatarUrl}
                  className='scale-110 object-cover object-top opacity-0 transition-[opacity,scale] duration-700 ease-out group-hover:scale-100 group-hover:opacity-100'
                />
                {/* Line art sits on top and fades out on hover to reveal the photo. */}
                {[
                  { src: DATA.avatarLineArtUrl, className: 'bg-white dark:hidden' },
                  { src: DATA.avatarLineArtDarkUrl, className: 'hidden bg-background dark:block' },
                ].map(({ src, className }) => (
                  <Image
                    key={src}
                    alt=''
                    aria-hidden='true'
                    src={src}
                    width={160}
                    height={160}
                    unoptimized
                    priority
                    className={`avatar-reveal absolute inset-0 size-full rounded-full object-cover transition-[opacity,scale,filter] duration-500 ease-out group-hover:scale-105 group-hover:opacity-0 group-hover:blur-[2px] ${className}`}
                  />
                ))}
                <span aria-hidden='true' className='avatar-scanline pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/70 to-transparent shadow-[0_0_8px_1px] shadow-foreground/40' />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className='flex min-w-0 flex-1 flex-col justify-between h-full min-h-[140px] sm:min-h-[172px] border-l'>
              <div className='flex-1 flex items-end pb-1'>
                <div className='absolute top-4 right-4 '>
                  <Status
                    className=''
                    status='online'
                  >
                    <StatusIndicator />
                    <StatusLabel className='font-mono'>
                      HCMC <LocalTime /> <span className='text-muted-foreground'>·</span> open to work
                    </StatusLabel>
                  </Status>
                </div>
              </div>

              <div className='flex items-center justify-between border-y'>
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className='truncate text-2xl font-extrabold tracking-tight sm:text-3xl font-doto px-3 sm:px-4'
                  yOffset={0}
                  text={DATA.name}
                />
                <div className='size-6 shrink-0 mr-3 sm:mr-4'>
                  <Icons.Logo />
                </div>
              </div>
              <BlurFade
                delay={BLUR_FADE_DELAY}
                className='bg-lines-pattern-light dark:bg-lines-pattern size-full'
              >
                <TextLoop className='block w-full overflow-hidden' transition={{ duration: 0.8 }} interval={4}>
                  {[DATA.contact.email, DATA.contact.tel].map((text) => (
                    <span
                      key={text}
                      className='block truncate px-3 text-sm font-normal font-ibm text-left text-muted-foreground sm:px-4 sm:text-base'
                    >
                      {text}
                    </span>
                  ))}
                </TextLoop>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      <section id='about' className='relative  screen-line-after  border-x'>
        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>About</h2>
          </BlurFade>
        </div>

        <div className='p-4'>
          <BlurFade delay={BLUR_FADE_DELAY * 4} offset={0}>
            <Markdown className='prose max-w-full text-pretty font-ibm text-sm text-muted-foreground -tracking-tighter dark:prose-invert'>
              {DATA.summary}
            </Markdown>
          </BlurFade>
        </div>
      </section>
      <section id='skills' className='relative screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>Skills</h2>
          </BlurFade>
        </div>

        <SkillsSection />

      </section>
      <HowIBuildSection />
      <GitHubContributions />
      <InsightsSection />

      <section
        id='work'
        className='relative screen-line-after border-x font-ibm'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='flex min-h-0 flex-col'>
          <div className='border-b'>
            <BlurFade delay={BLUR_FADE_DELAY * 5} offset={0}>
              <h2 className='text-2xl font-extrabold px-4 font-doto'>
                Experience
              </h2>
            </BlurFade>
          </div>
          <WorkSection />
        </div>
      </section>
      <section
        id='education'
        className='relative screen-line-after border-x font-ibm'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>
              Education
            </h2>
          </BlurFade>
        </div>
        <div className='relative p-4 space-y-4'>
          {DATA.education.map((education, id) => (
            <div key={`${education.school}-${education.degree}`}>
              <BlurFade delay={BLUR_FADE_DELAY * 8 + id * 0.05}>
                <ResumeCard
                  key={education.school}
                  href={education.href}
                  logoUrl={education.logoUrl}
                  altText={education.school}
                  title={education.school}
                  description={education.description}
                  technologies={
                    'technologies' in education ? education.technologies : []
                  }
                  subtitle={education.degree}
                  isExpanded={false}
                  period={`${education.start} - ${education.end}`}
                />
              </BlurFade>
            </div>
          ))}
        </div>
      </section>

      <section
        id='projects'
        className='relative screen-line-after border-x font-ibm'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>Project</h2>
          </BlurFade>
        </div>
        <div className='grid grid-cols-1  '>
          {DATA.projects.map((project, id) => (
            <BlurFade
              key={project.title}
              delay={BLUR_FADE_DELAY * 12 + id * 0.05}
            >
              <ProjectCard
                href={project.href}
                key={project.title}
                title={project.title}
                logoUrl={project.logoUrl}
                positions={project.positions}
                image={project.image}
                links={project.links}
              />
            </BlurFade>
          ))}
        </div>
      </section>
      <ComponentsSection />
      <section
        id='awards'
        // Education links jump here; clear the sticky 3.5rem header.
        className='relative scroll-mt-16 screen-line-after border-x font-ibm'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='border-b'>
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <h2 className='text-2xl font-extrabold px-4 font-doto'>Awards</h2>
          </BlurFade>
        </div>
        <BlurFade delay={BLUR_FADE_DELAY * 14}>
          <ul className=' ml-5 divide-y divide-dashed border-l'>
            {DATA.awards.map((award, id) => (
              <BlurFade
                key={award.title + award.dates}
                delay={BLUR_FADE_DELAY * 15 + id * 0.05}
              >
                <AwardCard
                  title={award.title}
                  description={award.description}
                  location={award.location}
                  dates={award.dates}
                  image={'image' in award ? award.image : undefined}
                  images={'images' in award ? award.images : undefined}
                  logo={'logo' in award ? award.logo : undefined}
                  links={award.links}
                />
              </BlurFade>
            ))}
          </ul>
        </BlurFade>
      </section>

      <BlogSection />

    </main>
  )
}
