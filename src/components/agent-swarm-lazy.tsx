'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const AgentSwarm = dynamic(() => import('@/components/agent-swarm').then((m) => m.AgentSwarm), { ssr: false })

// The on-page agents are an extra: their code (animation and canvas libraries) is fetched only once the page has
// settled, and not at all for visitors who asked for reduced motion.
export function AgentSwarmLazy () {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const go = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(go, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = setTimeout(go, 2000)
    return () => clearTimeout(timer)
  }, [])

  return ready ? <AgentSwarm /> : null
}
