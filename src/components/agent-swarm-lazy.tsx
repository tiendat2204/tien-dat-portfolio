'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { holdRun, RUN_EVENT } from '@/components/agent-shared'

const AgentSwarm = dynamic(() => import('@/components/agent-swarm').then((m) => m.AgentSwarm), { ssr: false })

// The on-page agents are an extra: their code (animation and canvas libraries) is fetched only once the page has
// settled, and not at all for visitors who asked for reduced motion (until they turn that off).
export function AgentSwarmLazy () {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    let stop = () => {}

    const arm = () => {
      stop()
      if (query.matches) return
      const go = () => setReady(true)
      // Asked to build before the code arrived: load it now and let the scene start once it is there.
      const onRun = (e: Event) => {
        holdRun((e as CustomEvent<{ section?: string } | undefined>).detail)
        go()
      }
      window.addEventListener(RUN_EVENT, onRun)
      const idle = 'requestIdleCallback' in window
      const handle = idle ? window.requestIdleCallback(go, { timeout: 4000 }) : window.setTimeout(go, 2000)
      stop = () => {
        window.removeEventListener(RUN_EVENT, onRun)
        if (idle) window.cancelIdleCallback(handle)
        else window.clearTimeout(handle)
      }
    }

    arm()
    query.addEventListener('change', arm)
    return () => {
      query.removeEventListener('change', arm)
      stop()
    }
  }, [])

  return ready ? <AgentSwarm /> : null
}
