'use client'

import { useEffect, useState } from 'react'

import { AGENTS, type AgentId } from '@/data/agents'

// What the on-page agents (agent-swarm.tsx) and their controls in "How I build" (agent-cast.tsx) have in common.
// Kept apart so the controls can render without pulling in the animation code and the canvas libraries.

const STORAGE_KEY = 'agent-cursors'
export const TOGGLE_EVENT = 'agent-swarm:toggle'
/** detail: `{ section?: string }` — the section id to build on; the one in view when left out. */
export const RUN_EVENT = 'agent-swarm:run'
/** detail: `{ id, x, y }` — a character let go at a viewport point. */
export const DROP_EVENT = 'agent-swarm:drop'
export const BUSY_EVENT = 'agent-swarm:busy'
export const STATUS_EVENT = 'agent-swarm:status'
/** detail: a line for the dock to say, when a build was asked for but could not start. */
export const HINT_EVENT = 'agent-swarm:hint'

export const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as { [K in AgentId]: Extract<typeof AGENTS[number], { id: K }> }

function storedOn () {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

export function storeOn (on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off')
  } catch {
    // Storage can be blocked; the toggle still works for this page view.
  }
  window.dispatchEvent(new CustomEvent(TOGGLE_EVENT))
}

// `on`: the visitor has not sent the dock home. `roomy`: an empty gutter beside the content column, wide enough
// to hold the dock without covering anything. `still`: reduced motion.
export function usePrefs () {
  const [state, setState] = useState({ on: true, roomy: false, still: true })

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    // The column is 768px; the dock needs about 150px of gutter to its right.
    const roomy = window.matchMedia('(min-width: 1080px)')
    const sync = () => setState({ on: storedOn(), roomy: roomy.matches, still: motion.matches })
    sync()
    motion.addEventListener('change', sync)
    roomy.addEventListener('change', sync)
    window.addEventListener(TOGGLE_EVENT, sync)
    return () => {
      motion.removeEventListener('change', sync)
      roomy.removeEventListener('change', sync)
      window.removeEventListener(TOGGLE_EVENT, sync)
    }
  }, [])

  return state
}

// True while the tab is in the background, so the canvases can stop drawing.
export function useTabHidden () {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const sync = () => setHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return hidden
}
