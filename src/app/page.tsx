import { AwardCard } from '@/components/AwardCard'
import BlurFadeText from '@/components/magicui/blur-fade-text'
import { ProjectCard } from '@/components/project-card'
import { ResumeCard } from '@/components/resume-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DATA } from '@/data/resume'
import Markdown from 'react-markdown'
import { FlickeringGrid } from '@/components/ui/flickering-grid-hero'
import { BlurFade } from '@/components/magicui/blur-fade'
import SkillsSection from './section/skills-section'
import WorkSection from '@/app/section/work-section'
import BlogSection from '@/app/section/blog-section'
import { Icon } from '@/components/Icon'
import AnimatedSocialLinks from '@/components/ui/social-links'
import { TextLoop } from '@/components/ui/text-loop'
import { Icons } from '@/components/icons'
import { BLUR_FADE_DELAY, GRID_CONFIG, maskStyle } from '@/data/config'
import { GitHubContributions } from './section/github-contributions'

export default function Page () {
  return (
    <main className='flex flex-col min-h-dvh'>
      <section
        id='background'
        className='relative screen-line-before  border-x'
      >
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='flex w-full h-[200px]  justify-center items-center'>
          <FlickeringGrid
            className='absolute inset-0 z-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] motion-safe:animate-pulse'
            {...GRID_CONFIG.background}
          />
          <div
            className='absolute  inset-0 z-0  motion-safe:animate-fade-in'
            style={{
              ...maskStyle,
              animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            <FlickeringGrid {...GRID_CONFIG.logo} />
          </div>
        </div>
      </section>
      <section
        id='information'
        className='relative screen-line-before screen-line-after pt-1 '
      >
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='mx-auto w-full space-y-8 border-x'>
          <div className='flex items-stretch justify-center min-h-[120px]'>
            <div className=''>
              <Avatar className='size-32 text rounded-full m-1 ring-1 ring-border ring-offset-2 ring-offset-background select-none sm:size-40'>
                <AvatarImage
                  alt={DATA.name}
                  src={DATA.avatarUrl}
                  className='object-cover object-top'
                />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className='flex flex-1 flex-col justify-between h-full min-h-[140px] md:min-h-[170px] border-l'>
              <div className='flex-1 flex items-end pb-1'>
                <div className='flex items-center gap-2 px-4'>
                  <BlurFade delay={BLUR_FADE_DELAY}>
                    <AnimatedSocialLinks
                      socials={Object.entries(DATA.contact.social).map(
                        ([, social]) => ({
                          icon: social.icon,
                          image: social.image || '',
                          url: social.url,
                        })
                      )}
                    />
                  </BlurFade>
                </div>
              </div>

              <div className='flex items-center justify-between border-y'>
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className='text-3xl  font-extrabold  tracking-tight sm:text-3xl font-doto px-4'
                  yOffset={0}
                  text={DATA.name}
                />
                <div className='size-6 mr-4'>
                  <Icons.Logo />
                </div>
              </div>
              <BlurFade
                delay={BLUR_FADE_DELAY}
                className='bg-lines-pattern-light dark:bg-lines-pattern size-full'
              >
                <TextLoop transition={{ duration: 0.8 }} interval={4}>
                  {[DATA.contact.email, DATA.contact.tel].map((text) => (
                    <span
                      key={text}
                      className='block  px-4 font-normal font-ibm text-left dark:text-muted text-gray-400'
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
        <GitHubContributions />

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
      <section
        id='awards'
        className='relative screen-line-after border-x font-ibm'
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
                  image={award.image}
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
