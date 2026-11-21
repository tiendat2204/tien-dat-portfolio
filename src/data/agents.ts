// The cast of the home page's agent swarm (agent-swarm.tsx). Roles and setup mirror /uses.

export const AGENTS = [
  {
    id: 'orca',
    verb: 'plan',
    color: '#60a5fa',
    href: '/uses#workflow-orca',
    role: 'Coordinator. Splits a job into tasks with dependencies and hands each one to a worker.',
    runsOn: 'Orca',
    setup: ['One git worktree and terminal per worker', 'A task DAG with decision gates', 'Hooks report every agent event back'],
  },
  {
    id: 'claude',
    verb: 'write',
    color: '#f0a060',
    href: '/uses#workflow-superpowers',
    role: 'Writer. Explores the code, plans the change, writes it and verifies it before calling it done.',
    runsOn: 'Claude Code',
    setup: ['CLAUDE.md, global and per repo', 'Skills: brainstorm, plan, TDD, verify', 'MCP: Playwright, Codegraph, ESLint'],
  },
  {
    id: 'codex',
    verb: 'review',
    color: '#34d399',
    href: '/uses#workflow-review',
    role: 'Reviewer. Reads every change the writer makes and sends back concrete issues.',
    runsOn: 'Codex',
    setup: ['Runs from a Stop hook on every turn', 'Reports issues with a trigger and a fix', 'A second opinion: the spec stays the authority'],
  },
] as const

export type AgentId = typeof AGENTS[number]['id']

// The build story the swarm acts out, and the text walkthrough shown where it cannot move.
export const BUILD_STEPS = [
  'I write the ticket: build tien-dat-profile.',
  'orca splits it into tasks, one worktree each.',
  'claude writes the change.',
  'codex reviews it; issues go back to claude.',
  'The gates run: tsc, unit tests, build.',
  'I decide what ships; pushing main deploys.',
] as const
