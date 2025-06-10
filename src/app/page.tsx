"use client";

import { AppleHelloEnglishEffect } from "@/components/apple-hello-effect";
import { HackathonCard } from "@/components/hackathon-card";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DATA, LOGO_BASE64 } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero";
import { BlurFade } from "@/components/magicui/blur-fade";
import SkillsSection from "./section/skills-section";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { useRef } from "react";

const BLUR_FADE_DELAY = 0.04;

const maskStyle = {
  WebkitMaskImage: `url('${LOGO_BASE64}')`,
  WebkitMaskSize: "100vw",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url('${LOGO_BASE64}')`,
  maskSize: "200px",
  maskPosition: "center",
  maskRepeat: "no-repeat",
} as const;

const GRID_CONFIG = {
  background: {
    color: "#cccccc",
    maxOpacity: 0.05,
    flickerChance: 0.08,
    squareSize: 6,
    gridGap: 6,
  },
  logo: {
    color: "#FFFFFF",
    maxOpacity: 0.95,
    flickerChance: 0.12,
    squareSize: 4,
    gridGap: 8,
  },
} as const;

export default function Page() {
  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const positionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  return (
    <main className="flex flex-col min-h-dvh ">
      <section
        id="background"
        className="relative screen-line-before  border-x"
      >
        <Icon className="absolute z-20 h-6 w-6 -top-3 -left-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -top-3 -right-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white" />
        <div className="flex w-full h-[200px]  justify-center items-center">
          <FlickeringGrid
            className={`absolute inset-0 z-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] motion-safe:animate-pulse`}
            {...GRID_CONFIG.background}
          />
          <div
            className="absolute inset-0 z-0  motion-safe:animate-fade-in"
            style={{
              ...maskStyle,
              animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            <FlickeringGrid {...GRID_CONFIG.logo} />
          </div>
        </div>
      </section>
      <section
        id="information"
        className="relative screen-line-before screen-line-after pt-1 "
      >
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white" />
        <div className="mx-auto w-full space-y-8 border-x">
          <div className="flex items-stretch justify-center min-h-[120px]">
            <div className="">
              <Avatar className="size-32 rounded-full m-1 ring-1 ring-border ring-offset-2 ring-offset-background select-none sm:size-40">
                <AvatarImage
                  alt={DATA.name}
                  src={DATA.avatarUrl}
                  className="object-cover object-top"
                />
                <AvatarFallback>{DATA.initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex flex-1 flex-col justify-between h-full min-h-[160px] border-l">
              <div className="flex-1 flex items-end pb-1">
                <div className="flex items-center gap-2 px-4">
                  {Object.entries(DATA.contact.social).map(
                    ([name, social], id) => (
                      <BlurFade key={name} delay={BLUR_FADE_DELAY + id * 0.1}>
                        <Link
                          href={social.url}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors "
                        >
                          <social.icon className="w-4 h-4" />
                        </Link>
                      </BlurFade>
                    )
                  )}
                </div>
              </div>

              <div className="flex items-start border-t">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-2xl font-bold tracking-tight sm:text-3xl font-ibm px-4"
                  yOffset={0}
                  text={DATA.name}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="relative  screen-line-after  border-x">
        <div className="border-b">
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className="text-xl font-bold px-4">About</h2>
          </BlurFade>
        </div>

        <div className="p-4">
          <BlurFade delay={BLUR_FADE_DELAY * 4} offset={0}>
            <Markdown className="prose max-w-full text-pretty font-ibm text-sm text-muted-foreground -tracking-tighter dark:prose-invert">
              {DATA.summary}
            </Markdown>
          </BlurFade>
        </div>
      </section>
      <section id="skills" className="relative screen-line-after border-x">
        <div className="border-b">
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className="text-xl font-bold px-4">Skills</h2>
          </BlurFade>
        </div>

        <SkillsSection />
      </section>
      <section id="work" className="relative screen-line-after border-x">
        <div className="flex min-h-0 flex-col ">
          <div className="border-b">
            <BlurFade delay={BLUR_FADE_DELAY * 5} offset={0}>
              <h2 className="text-xl font-bold px-4">Work Experience</h2>
            </BlurFade>
          </div>
          {DATA.work.map((company, companyIndex) => (
            <div
              key={company.company}
              className="company-group relative"
              ref={(el) => {
                containerRefs.current[company.company] = el;
              }}
            >
              {/* Company Header */}
              <BlurFade delay={BLUR_FADE_DELAY * 6 + companyIndex * 0.1}>
                <div className="company-header py-4 border-b border-muted ">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="w-3 h-3 bg-primary rounded-full relative z-10"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-primary/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-primary/20 rounded-full animate-pulse scale-150"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-primary/10 rounded-full animate-ping animation-delay-75 scale-200"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-6">
                    <div className="flex-none">
                      <Avatar className="border size-12 m-auto bg-muted-background dark:bg-foreground">
                        <AvatarImage
                          src={company.logoUrl}
                          alt={company.company}
                          className="object-contain"
                        />
                        <AvatarFallback>{company.company}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">
                        {company.company}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {company.location}
                      </p>
                    </div>
                  </div>
                </div>
              </BlurFade>

              {/* Positions */}
              <div className="relative p-4 space-y-8">
                {company.positions.map((position, positionIndex) => (
                  <div
                    key={`${company.company}-${position.title}`}
                    ref={(el) => {
                      positionRefs.current[
                        `${company.company}-${positionIndex}`
                      ] = el;
                    }}
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
                        subtitle=""
                        href={company.href}
                        badges={position.badges}
                        period={`${position.start} - ${
                          position.end ?? "Present"
                        }`}
                        description={position.description}
                      />
                    </BlurFade>
                  </div>
                ))}

                {/* AnimatedBeams for connecting positions */}
                {company.positions.length > 1 &&
                  company.positions.map((_, positionIndex) => {
                    if (positionIndex === company.positions.length - 1)
                      return null;

                    const fromKey = `${company.company}-${positionIndex}`;
                    const toKey = `${company.company}-${positionIndex + 1}`;

                    return (
                      <AnimatedBeam
                        key={`beam-${fromKey}-${toKey}`}
                        containerRef={{
                          current: containerRefs.current[company.company],
                        }}
                        fromRef={{
                          current: positionRefs.current[fromKey],
                        }}
                        toRef={{
                          current: positionRefs.current[toKey],
                        }}
                        curvature={20}
                        pathColor="hsl(var(--muted-foreground))"
                        pathOpacity={0.3}
                        pathWidth={2}
                        gradientStartColor="hsl(var(--primary))"
                        gradientStopColor="hsl(var(--primary)/0.5)"
                        delay={
                          BLUR_FADE_DELAY * 6 +
                          companyIndex * 0.1 +
                          (positionIndex + 1) * 0.1
                        }
                        duration={3}
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="education">
        <div className="flex min-h-0 flex-col gap-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 7}>
            <h2 className="text-xl font-bold">Education</h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 8 + id * 0.05}
            >
              <ResumeCard
                key={education.school}
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
              />
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="projects">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 11}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  My Projects
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Check out my latest work
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  I&apos;ve worked on a variety of projects, from simple
                  websites to complex web applications. Here are a few of my
                  favorites.
                </p>
              </div>
            </div>
          </BlurFade>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto">
            {DATA.projects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              >
                <ProjectCard
                  href={project.href}
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
      <section id="hackathons">
        <div className="space-y-12 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 13}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                  Hackathons
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  I like building things
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  During my time in university, I attended{" "}
                  {DATA.hackathons.length}+ hackathons. People from around the
                  country would come together and build incredible things in 2-3
                  days. It was eye-opening to see the endless possibilities
                  brought to life by a group of motivated and passionate
                  individuals.
                </p>
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 14}>
            <ul className="mb-4 ml-4 divide-y divide-dashed border-l">
              {DATA.hackathons.map((project, id) => (
                <BlurFade
                  key={project.title + project.dates}
                  delay={BLUR_FADE_DELAY * 15 + id * 0.05}
                >
                  <HackathonCard
                    title={project.title}
                    description={project.description}
                    location={project.location}
                    dates={project.dates}
                    image={project.image}
                    links={project.links}
                  />
                </BlurFade>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section>
      <section id="contact">
        <div className="grid items-center justify-center gap-4 px-4 text-center md:px-6 w-full py-12">
          <BlurFade delay={BLUR_FADE_DELAY * 16}>
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get in Touch
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Want to chat? Just shoot me a dm{" "}
                <Link
                  href={DATA.contact.social.X.url}
                  className="text-blue-500 hover:underline"
                >
                  with a direct question on twitter
                </Link>{" "}
                and I&apos;ll respond whenever I can. I will ignore all
                soliciting.
              </p>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
const Icon = ({ className, ...rest }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
