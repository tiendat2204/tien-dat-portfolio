'use client'

import { useState } from 'react'

import { AgentDot, type AgentDotMood } from '@/registry/AgentDot/agent-dot'

const MOODS: AgentDotMood[] = ['idle', 'working', 'focused', 'surprised', 'happy', 'asleep']

const CAST = [
  { name: 'Ori', type: 'droid', color: '#4c8dff', task: 'plan' },
  { name: 'Quill', type: 'star', color: '#f58742', task: 'write' },
  { name: 'Boo', type: 'ghost', color: '#4cc47c', task: 'review' },
] as const

export default function AgentDotDemo () {
  const [mood, setMood] = useState<AgentDotMood>('idle')

  return (
    <div className='flex w-full flex-col items-center gap-10 p-8'>
      <div className='flex flex-wrap items-end justify-center gap-10 pt-10'>
        {CAST.map((agent, i) => (
          <AgentDot
            key={agent.name}
            {...agent}
            seed={i / CAST.length}
            mood={mood}
            busy={mood === 'working'}
            alert={mood === 'surprised'}
            bubble={mood === 'surprised' && i === 1 ? '1 issue? on it.' : undefined}
          />
        ))}
      </div>
      <div className='flex flex-wrap justify-center gap-2'>
        {MOODS.map((m) => (
          <button
            key={m}
            type='button'
            aria-pressed={mood === m}
            onClick={() => setMood(m)}
            className={`border px-2 py-1 font-mono text-xs transition-colors hover:bg-muted ${mood === m ? 'border-foreground bg-muted' : ''}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
