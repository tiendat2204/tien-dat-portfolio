import type { Metadata } from 'next'
import Image from 'next/image'
import { Suspense } from 'react'

import { Back } from '@/app/blog/back'
import { Icon } from '@/components/Icon'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BLUR_FADE_DELAY } from '@/data/config'
import { WorkflowExplorer } from './workflow-explorer'

export const metadata: Metadata = {
  title: 'Uses',
  description: 'How I build with AI coding agents: Claude Code with a Codex review loop, skills, MCP servers and the rest of my setup.',
}

// Full class strings so Tailwind can see them; each group gets one accent.
const ACCENTS = {
  orange: { text: 'text-orange-600 dark:text-orange-400', bar: 'border-l-orange-500 bg-orange-500/5', dot: 'bg-orange-500', tag: 'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300', row: 'hover:bg-orange-500/5' },
  emerald: { text: 'text-emerald-600 dark:text-emerald-400', bar: 'border-l-emerald-500 bg-emerald-500/5', dot: 'bg-emerald-500', tag: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', row: 'hover:bg-emerald-500/5' },
  sky: { text: 'text-sky-600 dark:text-sky-400', bar: 'border-l-sky-500 bg-sky-500/5', dot: 'bg-sky-500', tag: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300', row: 'hover:bg-sky-500/5' },
  violet: { text: 'text-violet-600 dark:text-violet-400', bar: 'border-l-violet-500 bg-violet-500/5', dot: 'bg-violet-500', tag: 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300', row: 'hover:bg-violet-500/5' },
  amber: { text: 'text-amber-600 dark:text-amber-400', bar: 'border-l-amber-500 bg-amber-500/5', dot: 'bg-amber-500', tag: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300', row: 'hover:bg-amber-500/5' },
  cyan: { text: 'text-cyan-600 dark:text-cyan-400', bar: 'border-l-cyan-500 bg-cyan-500/5', dot: 'bg-cyan-500', tag: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300', row: 'hover:bg-cyan-500/5' },
  rose: { text: 'text-rose-600 dark:text-rose-400', bar: 'border-l-rose-500 bg-rose-500/5', dot: 'bg-rose-500', tag: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300', row: 'hover:bg-rose-500/5' },
  indigo: { text: 'text-indigo-600 dark:text-indigo-400', bar: 'border-l-indigo-500 bg-indigo-500/5', dot: 'bg-indigo-500', tag: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300', row: 'hover:bg-indigo-500/5' },
  lime: { text: 'text-lime-600 dark:text-lime-400', bar: 'border-l-lime-500 bg-lime-500/5', dot: 'bg-lime-500', tag: 'border-lime-500/40 bg-lime-500/10 text-lime-700 dark:text-lime-300', row: 'hover:bg-lime-500/5' },
}
type Accent = keyof typeof ACCENTS

type Item = { name: string; icon?: string; iconDark?: string; tag?: string; accent?: Accent; note: string }
type Group = { id: string; title: string; accent: Accent; intro?: string; items: Item[] }

const GROUPS: Group[] = [
  {
    id: 'agents',
    accent: 'orange',
    title: 'agents',
    intro: 'Two agents with different jobs: one writes, the other checks. I stay the one who decides what ships.',
    items: [
      { name: 'Claude Code', icon: 'skills/claude.svg', tag: 'writer', note: 'Main coding agent in the terminal, running Opus. It reads the codebase, plans, edits and verifies its own work.' },
      { name: 'Codex CLI', icon: 'skills/openai.svg', iconDark: 'skills/openai-dark.svg', tag: 'reviewer', accent: 'emerald', note: 'Reviews every change Claude makes, runs QA in a browser on demand, and takes standalone tasks with high reasoning effort.' },
      { name: 'GitHub Copilot', icon: 'skills/copilot.svg', iconDark: 'skills/copilot-dark.svg', tag: 'inline', accent: 'sky', note: 'Inline completions while I type in the editor.' },
    ],
  },
  {
    id: 'review-loop',
    accent: 'emerald',
    title: 'the review loop (hooks)',
    intro: 'A small bash + jq tool wires Codex into Claude Code through hooks, so every change gets a second pair of eyes without me asking.',
    items: [
      { name: 'UserPromptSubmit', tag: 'hook', note: 'On each prompt, snapshot the working tree into a temporary git index (my staging area stays untouched). That tree is the review base.' },
      { name: 'Stop', tag: 'hook', note: 'When Claude finishes a turn that changed code, Codex reviews the diff against the base in read-only mode, with my recent prompts and any plan or spec files as context.' },
      { name: 'Only real bugs block', note: 'Codex returns structured findings. Only high-confidence P0/P1 issues block Claude; medium ones go to a log. No style nitpicks, and Codex never edits code.' },
      { name: 'Claude can push back', note: 'Claude verifies each finding and either fixes it or answers CODEX-REJECT with a reason. Rejected findings are remembered and not raised again.' },
      { name: 'Never in the way', note: 'Rounds are capped, a Codex failure or timeout never blocks, accounts fall back when one hits a quota, and the loop can be turned off per repo or for a few hours.' },
    ],
  },
  {
    id: 'qa',
    accent: 'sky',
    title: '/qa: codex as qa engineer',
    items: [
      { name: '/qa', icon: 'skills/playwright.svg', tag: 'skill', note: 'Starts or reuses the dev server, then lets Codex write and run test cases through a headless, isolated Playwright browser.' },
      { name: 'Guard rails', note: 'A request guard blocks dangerous endpoints, passwords stay in a 0600 secrets file and are redacted from logs, and the result comes back as a report with screenshots for Claude to triage.' },
    ],
  },
  {
    id: 'superpowers',
    accent: 'violet',
    title: 'superpowers: how a feature gets built',
    intro: 'The Superpowers plugin turns good engineering habits into skills the agent must follow, so it does not jump straight into code.',
    items: [
      { name: 'brainstorming', tag: '1 · design', note: 'Before any new feature, the agent asks questions one at a time, plays back what it understood and waits for my approval of the design.' },
      { name: 'using-git-worktrees', tag: '2 · isolate', note: 'The work happens on its own branch in a separate worktree, so my main checkout stays clean.' },
      { name: 'writing-plans', tag: '3 · plan', note: 'The approved design becomes a plan of small tasks with exact files, steps and checks, written for an engineer with no context.' },
      { name: 'subagent-driven-development', tag: '4 · build', note: 'Each task goes to a fresh subagent, so context stays small; independent tasks can run in parallel with dispatching-parallel-agents.' },
      { name: 'test-driven-development', tag: '5 · test', note: 'Write the failing test, make it pass, then refactor. When something breaks, systematic-debugging finds the root cause before any fix.' },
      { name: 'requesting / receiving code review', tag: '6 · review', note: 'A reviewer checks each task against the plan; feedback is verified on its merits, not accepted blindly.' },
      { name: 'verification-before-completion', tag: '7 · verify', note: 'No "done" without running the checks and showing the output: tests, lint, a browser screenshot.' },
      { name: 'finishing-a-development-branch', tag: '8 · ship', note: 'Once everything passes, choose to merge, open a PR, keep the branch or discard it.' },
    ],
  },
  {
    id: 'skills',
    accent: 'amber',
    title: 'skills & plugins',
    items: [
      { name: 'Feature dev · Code review · Frontend design', tag: 'plugin', note: 'Guided feature work with codebase exploration, PR reviews, and design guidance for new UI.' },
      { name: 'Context7', tag: 'plugin', note: 'Pulls current library docs into the session instead of relying on what the model remembers.' },
      { name: 'Caveman', tag: 'plugin', note: 'Terse output mode plus a compressor for memory files, so long sessions spend tokens on code, not prose.' },
      { name: 'Custom skills', tag: 'skill', note: '/codex-review to toggle the loop, /codex-model to pick the reviewer model and effort, /qa, plus React best-practice and agent orchestration skills.' },
    ],
  },
  {
    id: 'mcp',
    accent: 'cyan',
    title: 'mcp servers',
    items: [
      { name: 'Playwright', icon: 'skills/playwright.svg', note: 'The agent opens the app, clicks through it and screenshots the result before calling a UI change done.' },
      { name: 'Chrome DevTools', note: 'Performance traces, network and console inspection, Lighthouse and accessibility checks from inside the session.' },
      { name: 'Codegraph', note: 'A SQLite knowledge graph of the codebase: one call returns the relevant symbols, call paths and blast radius instead of a grep-and-read loop.' },
      { name: 'ESLint', note: 'Lints exactly the files that changed, so edits match the project rules.' },
    ],
  },
  {
    id: 'context',
    accent: 'rose',
    title: 'context, memory & cost',
    items: [
      { name: 'CLAUDE.md', tag: 'global + per repo', note: 'Standing rules, like "query the code graph before grep", plus each project\'s architecture notes and conventions.' },
      { name: 'Persistent memory', note: 'Facts and feedback that should outlive one session are saved as small notes the agent reads next time.' },
      { name: 'RTK', tag: 'PreToolUse hook', note: 'Rewrites shell commands through a Rust proxy that trims noisy output, typically saving 60-90% of tokens on git, test and build output.' },
      { name: 'Status line', note: 'A custom status line shows the model, how much context is left, the folder and the git branch at a glance.' },
    ],
  },
  {
    id: 'orchestration',
    accent: 'indigo',
    title: 'orchestration with orca',
    intro: 'For bigger jobs I run several agents at once in Orca, a desktop app for coding agents, with one of them coordinating the rest.',
    items: [
      { name: 'Parallel worktrees', tag: 'orca-cli', note: 'Each agent (Claude Code or Codex) gets its own git worktree and terminal, so parallel work never collides.' },
      { name: 'Coordinator + workers', tag: 'orchestration', note: 'A coordinator breaks the job into a task DAG with dependencies, dispatches tasks to workers and waits for worker_done or an escalation.' },
      { name: 'Messages & decision gates', note: 'Workers and the coordinator talk through threaded messages and blocking ask/reply; decision gates stop the flow until results are checked.' },
      { name: 'Handoffs', note: 'A whole task can be handed to another agent in another worktree when it should own it end to end.' },
      { name: 'Linear', tag: 'orca-linear', note: 'Work starts from a Linear ticket and ends with the PR link, a completion comment and the ticket moved to the next state.' },
      { name: 'Hooks to the dashboard', note: 'Claude Code hooks report every agent event (prompts, tool calls, permission requests, stops) back to Orca, so I see all agents in one place.' },
    ],
  },
  {
    id: 'stack',
    accent: 'lime',
    title: 'editor & stack',
    items: [
      { name: 'WebStorm', icon: 'skills/webstorm.svg', note: 'Main IDE for React and TypeScript.' },
      { name: 'VS Code', icon: 'skills/vscode.svg', note: 'Quick edits, notes and markdown.' },
      { name: 'Next.js · React · TypeScript', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg', note: 'Default stack for product UIs and this site.' },
      { name: 'Playwright · Vitest · axe-core', icon: 'skills/vitest.svg', note: 'The checks the agents run before anything is called done.' },
    ],
  },
]

function ItemIcon ({ icon, iconDark, dot }: { icon?: string; iconDark?: string; dot: string }) {
  if (!icon) return <span className={`size-1.5 ${dot}`} />
  const img = (src: string, className = '') => (
    <Image src={`/icons/${src}`} alt='' width={20} height={20} className={`size-5 ${className}`} />
  )
  return iconDark
    ? <>{img(icon, 'dark:hidden')}{img(iconDark, 'hidden dark:block')}</>
    : img(icon)
}

export default function UsesPage () {
  return (
    <main className='flex flex-col mx-auto w-full max-w-3xl font-ibm'>
      <section className='relative screen-line-before screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='border-b px-4 py-2'>
          <Suspense>
            <Back />
          </Suspense>
        </div>
        <BlurFade delay={BLUR_FADE_DELAY}>
          <h1 className='px-4 pt-6 font-doto text-4xl font-extrabold'>Uses</h1>
          <p className='px-4 pt-2 pb-6 text-sm text-muted-foreground'>
            How I build with AI coding agents: Claude Code writes, Codex reviews, and I decide what ships.
          </p>
        </BlurFade>
      </section>

      <section id='workflow' className='relative scroll-mt-16 screen-line-after border-x'>
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
        <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
        <div className='border-b px-4 py-2 text-xs text-muted-foreground'># workflow</div>
        <WorkflowExplorer />
      </section>

      {GROUPS.map((group, gi) => {
        const g = ACCENTS[group.accent]
        return (
          <section key={group.id} id={group.id} className='relative screen-line-after border-x'>
            <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
            <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
            <div className='border-b px-4 py-2 text-xs text-muted-foreground'>
              <span className={g.text}>#</span> {group.title}
            </div>
            {group.intro && <p className={`border-b border-l-2 ${g.bar} px-4 py-3 text-sm`}>{group.intro}</p>}
            <ul className='divide-y divide-dashed'>
              {group.items.map((item, i) => {
                const a = ACCENTS[item.accent ?? group.accent]
                return (
                  <BlurFade key={item.name} delay={BLUR_FADE_DELAY * (gi * 2 + i + 2)}>
                    <li className={`flex gap-3 px-4 py-3 transition-colors ${a.row}`}>
                      <span className='mt-0.5 flex size-5 shrink-0 items-center justify-center'>
                        <ItemIcon icon={item.icon} iconDark={item.iconDark} dot={a.dot} />
                      </span>
                      <div className='min-w-0'>
                        <p className='flex flex-wrap items-center gap-2 text-sm font-semibold'>
                          {item.name}
                          {item.tag && <span className={`border px-1.5 text-[11px] font-normal ${a.tag}`}>{item.tag}</span>}
                        </p>
                        <p className='mt-0.5 text-sm text-muted-foreground'>{item.note}</p>
                      </div>
                    </li>
                  </BlurFade>
                )
              })}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
