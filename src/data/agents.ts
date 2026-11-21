// The cast of the home page's agent scene (agent-swarm.tsx). Each character has its own name; `runsOn` is the
// tool behind it. Roles and setup mirror /uses; `lines` are what it says when poked.

export const AGENTS = [
  {
    id: 'orca',
    lines: ['I split the job into tasks.', 'One worktree per worker.', 'Press ▶ to watch us build.'],
    name: 'Ori',
    avatar: 'droid',
    verb: 'plan',
    color: '#4c8dff',
    href: '/uses#workflow-orca',
    role: 'Coordinator. Splits a job into tasks with dependencies and hands each one to a worker.',
    runsOn: 'Orca',
    setup: ['One git worktree and terminal per worker', 'A task DAG with decision gates', 'Hooks report every agent event back'],
  },
  {
    id: 'claude',
    lines: ['I write the change.', 'CLAUDE.md says: square corners.', 'Press ▶ to watch us build.'],
    name: 'Quill',
    avatar: 'star',
    verb: 'write',
    color: '#f58742',
    href: '/uses#workflow-superpowers',
    role: 'Writer. Explores the code, plans the change, writes it and verifies it before calling it done.',
    runsOn: 'Claude Code',
    setup: ['CLAUDE.md, global and per repo', 'Skills: brainstorm, plan, TDD, verify', 'MCP: Playwright, Codegraph, ESLint'],
  },
  {
    id: 'codex',
    lines: ['I read every diff.', 'Found an issue? I say how to fix it.', 'Press ▶ to watch us build.'],
    name: 'Boo',
    avatar: 'ghost',
    verb: 'review',
    color: '#4cc47c',
    href: '/uses#workflow-review',
    role: 'Reviewer. Reads every change the writer makes and sends back concrete issues.',
    runsOn: 'Codex',
    setup: ['Runs from a Stop hook on every turn', 'Reports issues with a trigger and a fix', 'A second opinion: the spec stays the authority'],
  },
] as const

export type AgentId = typeof AGENTS[number]['id']

// The build story the cast acts out, and the text walkthrough shown where it cannot move.
export const BUILD_STEPS = [
  'I write the ticket: build tien-dat-profile.',
  'Ori splits it into tasks, one worktree each.',
  'Quill writes the change.',
  'Boo reviews it; issues go back to Quill.',
  'The gates run: tsc, unit tests, build.',
  'I decide what ships; pushing main deploys.',
] as const
