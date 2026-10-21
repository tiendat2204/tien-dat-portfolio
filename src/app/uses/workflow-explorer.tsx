'use client'

import { PlayIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

// Interactive workflow diagrams for /uses. Collapsed by default so the page stays short;
// "View workflow" draws the chosen diagram step by step, then the edges start flowing.

const W = 490
const X = 100 // left edge of the main column (room on the left for a loop label)
const NODE_W = 260
const CX = X + NODE_W / 2
const BOX_H = 54
const DIAMOND_H = 104
const GAP = 38
const STEP_MS = 240

type Step =
  | { kind?: 'box'; title: string; sub: string; accent?: boolean }
  | { kind: 'decision'; title: string; sub: string }

type FlowSpec = {
  steps: Step[]
  loop?: { from: number; to: number; label: string }
  side?: { at: number; title: string; lines: [string, string] }
  noLabelAfterDecision?: string
}

const delay = (ms: number, doneMs?: number) =>
  ({ '--d': `${ms}ms`, ...(doneMs !== undefined && { '--done': `${doneMs}ms` }) }) as React.CSSProperties

function layout (steps: Step[]) {
  let y = 20
  return steps.map((s) => {
    const h = s.kind === 'decision' ? DIAMOND_H : BOX_H
    const out = { y, h }
    y += h + GAP
    return out
  })
}

function VerticalFlow ({ spec, title, desc }: { spec: FlowSpec; title: string; desc: string }) {
  const pos = layout(spec.steps)
  const height = pos.at(-1)!.y + pos.at(-1)!.h + 20
  const last = spec.steps.length - 1
  const drawnAt = last * STEP_MS + 400

  const leftAnchor = (i: number) =>
    spec.steps[i].kind === 'decision'
      ? { x: CX - 62, y: pos[i].y + pos[i].h / 2 }
      : { x: X, y: pos[i].y + pos[i].h / 2 }

  const mainPath = `M ${CX} ${pos[0].y + pos[0].h} V ${pos[last].y}`
  const loop = spec.loop && (() => {
    const a = leftAnchor(spec.loop.from)
    const b = leftAnchor(spec.loop.to)
    return { d: `M ${a.x} ${a.y} H 62 V ${b.y} H ${X}`, midY: (a.y + b.y) / 2 }
  })()

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className='mx-auto block h-auto w-full max-w-xl font-ibm' role='img' aria-label={title}>
      <desc>{desc}</desc>
      <defs>
        <marker id='wfx-arrow' viewBox='0 0 8 8' refX='7' refY='4' markerWidth='7' markerHeight='7' orient='auto'>
          <path d='M0,0 L8,4 L0,8 z' className='fill-muted-foreground' />
        </marker>
      </defs>

      {/* Edges between consecutive steps: drawn in, then they start flowing. */}
      {spec.steps.slice(0, -1).map((_, i) => {
        const d = `M ${CX} ${pos[i].y + pos[i].h} V ${pos[i + 1].y}`
        return (
          <g key={`e${i}`}>
            <path d={d} pathLength={1} className='wf-edge stroke-muted-foreground' fill='none' strokeWidth={1.2} style={delay(i * STEP_MS + 160, drawnAt)} />
            <path d={d} className='wf-flow stroke-muted-foreground' fill='none' strokeWidth={1.2} style={delay(drawnAt)} />
          </g>
        )
      })}
      {spec.noLabelAfterDecision && (() => {
        const di = spec.steps.findIndex((s) => s.kind === 'decision')
        return <text x={CX + 10} y={pos[di + 1].y - 14} className='wf-node fill-muted-foreground text-[11px]' style={delay((di + 1) * STEP_MS)}>{spec.noLabelAfterDecision}</text>
      })()}

      {loop && (
        <g>
          <path d={loop.d} pathLength={1} className='wf-edge stroke-foreground' fill='none' strokeWidth={1.2} markerEnd='url(#wfx-arrow)' style={delay(drawnAt - 200, drawnAt)} />
          <path d={loop.d} className='wf-flow wf-flow-fast stroke-foreground' fill='none' strokeWidth={1.2} style={delay(drawnAt)} />
          <text x={50} y={loop.midY} transform={`rotate(-90 50 ${loop.midY})`} textAnchor='middle' className='wf-node fill-foreground text-[11px]' style={delay(drawnAt - 200)}>
            {spec.loop!.label}
          </text>
        </g>
      )}

      {/* Under the nodes, so a dot hides behind each card it passes. */}
      <Packets paths={[mainPath, loop?.d].filter(Boolean) as string[]} startMs={drawnAt} />

      {spec.steps.map((s, i) => {
        const { y, h } = pos[i]
        if (s.kind === 'decision') {
          const cy = y + h / 2
          return (
            <g key={s.title} className='wf-node' style={delay(i * STEP_MS)}>
              <polygon points={`${CX},${y} ${CX + 62},${cy} ${CX},${y + h} ${CX - 62},${cy}`} className='fill-background stroke-foreground' strokeWidth={1} />
              <text x={CX} y={cy - 4} textAnchor='middle' className='fill-foreground text-[12px] font-semibold'>{s.title}</text>
              <text x={CX} y={cy + 13} textAnchor='middle' className='fill-muted-foreground text-[10px]'>{s.sub}</text>
            </g>
          )
        }
        return (
          <g key={s.title} className='wf-node' style={delay(i * STEP_MS)}>
            <rect x={X} y={y} width={NODE_W} height={h} className={s.accent ? 'fill-background stroke-foreground' : 'fill-background stroke-border'} strokeWidth={1} />
            <text x={X + 14} y={y + 22} className='fill-foreground text-[13px] font-semibold'>{s.title}</text>
            <text x={X + 14} y={y + 40} className='fill-muted-foreground text-[11px]'>{s.sub}</text>
          </g>
        )
      })}

      {spec.side && (() => {
        const p = pos[spec.side.at]
        const sx = X + NODE_W + 14
        return (
          <g className='wf-node' style={delay(spec.side.at * STEP_MS + 120)}>
            <path d={`M ${X + NODE_W} ${p.y + p.h / 2} H ${sx}`} className='stroke-muted-foreground' strokeDasharray='2 3' fill='none' />
            <rect x={sx} y={p.y - 4} width={W - sx - 4} height={p.h + 8} className='fill-background stroke-border' strokeDasharray='3 3' strokeWidth={1} />
            <text x={sx + 10} y={p.y + 18} className='fill-foreground text-[12px] font-semibold'>{spec.side.title}</text>
            <text x={sx + 10} y={p.y + 34} className='fill-muted-foreground text-[10px]'>{spec.side.lines[0]}</text>
            <text x={sx + 10} y={p.y + 47} className='fill-muted-foreground text-[10px]'>{spec.side.lines[1]}</text>
          </g>
        )
      })()}

    </svg>
  )
}

// Moving dots appear only once the diagram has finished drawing.
function Packets ({ paths, startMs }: { paths: string[]; startMs: number }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setTimeout(() => setOn(true), startMs)
    return () => window.clearTimeout(id)
  }, [startMs])
  if (!on) return null
  return (
    <g>
      {paths.map((d, i) => (
        <circle key={d} r={i === 0 ? 3.5 : 3} className='fill-foreground'>
          <animateMotion dur={i === 0 ? '6s' : '3s'} repeatCount='indefinite' path={d} />
        </circle>
      ))}
    </g>
  )
}

// Orca: one coordinator fans a task DAG out to workers in their own worktrees.
function OrcaFlow () {
  const workers = [
    { title: 'worker · Claude', sub: 'worktree A' },
    { title: 'worker · Codex', sub: 'worktree B' },
    { title: 'worker · Claude', sub: 'worktree C' },
  ]
  const WW = 140
  const wx = (i: number) => 20 + i * (WW + 15)
  const top = 20
  const dagY = top + BOX_H + GAP
  const wy = dagY + BOX_H + 56
  const gateY = wy + BOX_H + 56
  const doneY = gateY + BOX_H + GAP
  const height = doneY + BOX_H + 20
  const box = (x: number, y: number, w: number, t: string, s: string, accent = false, d = 0) => (
    <g key={t + x + y} className='wf-node' style={delay(d)}>
      <rect x={x} y={y} width={w} height={BOX_H} className={accent ? 'fill-background stroke-foreground' : 'fill-background stroke-border'} strokeWidth={1} />
      <text x={x + 12} y={y + 22} className='fill-foreground text-[13px] font-semibold'>{t}</text>
      <text x={x + 12} y={y + 40} className='fill-muted-foreground text-[11px]'>{s}</text>
    </g>
  )
  const edge = (d: string, ms: number, strong = false) => (
    <g key={d}>
      <path d={d} pathLength={1} className={cn('wf-edge', strong ? 'stroke-foreground' : 'stroke-muted-foreground')} fill='none' strokeWidth={1.2} style={delay(ms, 1900)} />
      <path d={d} className={cn('wf-flow', strong ? 'stroke-foreground' : 'stroke-muted-foreground')} fill='none' strokeWidth={1.2} style={delay(1900)} />
    </g>
  )
  const wcx = (i: number) => wx(i) + WW / 2
  const fanOut = workers.map((_, i) => `M ${CX} ${dagY + BOX_H} V ${dagY + BOX_H + 28} H ${wcx(i)} V ${wy}`)
  const fanIn = workers.map((_, i) => `M ${wcx(i)} ${wy + BOX_H} V ${wy + BOX_H + 28} H ${CX} V ${gateY}`)

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className='mx-auto block h-auto w-full max-w-xl font-ibm' role='img' aria-label='Orca multi-agent orchestration'>
      <desc>
        A coordinator splits work into a task DAG and dispatches it to Claude Code and Codex workers, each in its own git
        worktree. Workers reply through threaded messages, report worker_done or escalate, results pass a decision gate,
        and the merge updates the Linear ticket.
      </desc>
      {edge(`M ${CX} ${top + BOX_H} V ${dagY}`, 160)}
      {fanOut.map((d, i) => edge(d, 420 + i * 80))}
      {fanIn.map((d, i) => edge(d, 1100 + i * 80))}
      {edge(`M ${CX} ${gateY + BOX_H} V ${doneY}`, 1500)}
      {/* ask / reply and escalations travel back up to the coordinator */}
      <g className='wf-node' style={delay(1300)}>
        <path d={`M ${wx(2) + WW} ${wy + BOX_H / 2} H ${W - 8} V ${top + BOX_H / 2} H ${X + NODE_W}`} className='wf-flow wf-flow-fast stroke-foreground' fill='none' strokeWidth={1.2} style={delay(1900)} />
        <text x={W - 14} y={(top + wy) / 2 + 20} transform={`rotate(-90 ${W - 14} ${(top + wy) / 2 + 20})`} textAnchor='middle' className='fill-foreground text-[11px]'>ask · reply · escalate</text>
      </g>

      {box(X, top, NODE_W, 'coordinator', 'me + Claude Code, supervising', true, 0)}
      {box(X, dagY, NODE_W, 'task DAG', 'split work · set dependencies', false, 260)}
      {workers.map((w, i) => box(wx(i), wy, WW, w.title, w.sub, false, 640 + i * 80))}
      {box(X, gateY, NODE_W, 'decision gate', 'worker_done · review results', true, 1300)}
      {box(X, doneY, NODE_W, '✓ merge', 'PR + Linear ticket updated', false, 1560)}
    </svg>
  )
}

const REVIEW: FlowSpec = {
  steps: [
    { title: '> prompt', sub: 'I describe the task' },
    { title: 'UserPromptSubmit hook', sub: 'snapshot git tree = review base' },
    { title: 'Claude Code', sub: 'superpowers: plan → build', accent: true },
    { title: 'verify', sub: 'Playwright · ESLint · tests' },
    { title: 'Stop hook → Codex', sub: 'read-only review of the diff', accent: true },
    { kind: 'decision', title: 'P0 / P1?', sub: 'high confidence' },
    { title: '✓ done', sub: 'I review, commit and ship' },
  ],
  loop: { from: 5, to: 2, label: 'block → fix or CODEX-REJECT' },
  side: { at: 3, title: '/qa', lines: ['Codex QA in', 'headless browser'] },
  noLabelAfterDecision: 'no',
}

const SUPERPOWERS: FlowSpec = {
  steps: [
    { title: 'brainstorming', sub: 'questions → approved design', accent: true },
    { title: 'using-git-worktrees', sub: 'isolated branch for the work' },
    { title: 'writing-plans', sub: 'small tasks with exact steps' },
    { title: 'subagent-driven-dev', sub: 'fresh subagent per task', accent: true },
    { title: 'test-driven-development', sub: 'red → green → refactor' },
    { title: 'requesting-code-review', sub: 'review after each task' },
    { title: 'verification-before-completion', sub: 'run checks, show evidence' },
    { title: 'finishing-a-dev-branch', sub: 'merge · PR · keep · discard' },
  ],
  loop: { from: 5, to: 3, label: 'issues → fix' },
  side: { at: 4, title: 'debugging', lines: ['systematic: root', 'cause before fix'] },
}

const TABS = [
  { id: 'review', label: 'review loop', summary: 'Claude Code writes, a Stop hook asks Codex to review the diff, and only high-confidence bugs send the work back.' },
  { id: 'superpowers', label: 'superpowers', summary: 'Every feature goes brainstorm → plan → subagents with TDD → review → verified before it is called done.' },
  { id: 'orca', label: 'orca', summary: 'A coordinator splits work into a task DAG and runs Claude and Codex workers in parallel worktrees.' },
] as const

type TabId = (typeof TABS)[number]['id']

export function WorkflowExplorer () {
  const [tab, setTab] = useState<TabId>('review')
  const [open, setOpen] = useState(false)
  const [run, setRun] = useState(0)
  const active = TABS.find((t) => t.id === tab)!

  const play = (next?: TabId) => {
    if (next) setTab(next)
    setOpen(true)
    setRun((r) => r + 1)
  }

  // Links like /uses#workflow-orca (from the home page) open that diagram straight away.
  useEffect(() => {
    const id = window.location.hash.match(/^#workflow-(\w+)$/)?.[1]
    const target = TABS.find((t) => t.id === id)
    if (!target) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    play(target.id)
    document.getElementById('workflow')?.scrollIntoView()
  }, [])

  return (
    <div>
      <div role='tablist' aria-label='Workflow diagrams' className='flex border-b text-xs'>
        {TABS.map((t) => (
          <button
            key={t.id}
            role='tab'
            type='button'
            aria-selected={tab === t.id}
            onClick={() => (open ? play(t.id) : setTab(t.id))}
            className={cn(
              'min-h-10 flex-1 border-r px-2 last:border-r-0 transition-colors',
              tab === t.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className='flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>{active.summary}</p>
        <div className='flex shrink-0 gap-2'>
          {!open
            ? (
              <button type='button' onClick={() => play()} className='flex min-h-9 items-center gap-2 border bg-foreground px-3 text-xs text-background transition-opacity hover:opacity-90'>
                <PlayIcon className='size-3.5' /> View workflow
              </button>
              )
            : (
              <>
                <button type='button' onClick={() => play()} className='flex min-h-9 items-center gap-2 border px-3 text-xs hover:bg-muted'>
                  <RotateCcwIcon className='size-3.5' /> Replay
                </button>
                <button type='button' onClick={() => setOpen(false)} aria-label='Hide workflow' className='flex min-h-9 items-center gap-2 border px-3 text-xs hover:bg-muted'>
                  <XIcon className='size-3.5' /> Hide
                </button>
              </>
              )}
        </div>
      </div>

      {open && (
        // Phones scroll the diagram sideways instead of shrinking its text.
        <div key={`${tab}-${run}`} data-lenis-prevent-wheel className='overflow-x-auto scroll-fade-x no-scrollbar border-t px-4 py-6'>
          <div className='min-w-[420px]'>
            {tab === 'review' && <VerticalFlow spec={REVIEW} title='Claude Code and Codex review loop' desc='A prompt is snapshotted, Claude Code plans and builds with superpowers, the change is verified, then Codex reviews the diff; high-confidence P0 or P1 findings go back to Claude to fix or reject.' />}
            {tab === 'superpowers' && <VerticalFlow spec={SUPERPOWERS} title='Superpowers development workflow' desc='Brainstorm a design, isolate the work in a git worktree, write a plan, run a fresh subagent per task with test-driven development and a review after each task, verify, then finish the branch.' />}
            {tab === 'orca' && <OrcaFlow />}
          </div>
        </div>
      )}
    </div>
  )
}
