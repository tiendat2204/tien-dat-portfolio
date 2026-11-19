'use client'

import { ScrollStage } from '../ScrollStage/scroll-stage'
import { draw, fade, pulse, rise, travel } from '../ScrollStage/scroll-progress'

// Scroll to pin the card: the track draws in, a packet runs along it, then the result appears. Everything below is
// CSS driven by the stage's `--p`; nothing re-renders while you scroll.
export default function ScrollStageDemo () {
  return (
    <ScrollStage topOffset={96} distance={1.2} className='mx-auto w-full max-w-xl border bg-background p-4 font-mono text-xs'>
      <svg viewBox='0 0 400 160' role='img' aria-label='A packet travels along a track to a result' className='w-full text-foreground'>
        <path d='M30 80H370' pathLength={1} fill='none' stroke='currentColor' strokeWidth={1.5} style={draw(0, 0.3)} />
        <rect x={20} y={64} width={20} height={32} fill='none' stroke='currentColor' style={fade(0, 0.1)} />
        <rect x={360} y={64} width={20} height={32} fill='none' stroke='currentColor' style={fade(0.1, 0.2)} />
        <rect x={26} y={74} width={12} height={12} fill='currentColor' style={{ ...travel(0.3, 0.7, 340), ...pulse(0.28, 0.74) }} />
        <g style={rise(0.7, 0.9, 0, 10)}>
          <rect x={250} y={100} width={130} height={36} fill='none' stroke='currentColor' />
          <text x={262} y={122} fill='currentColor'>result: ok</text>
        </g>
      </svg>
      <div className='mt-3 h-1 w-full bg-muted'>
        <div className='h-full bg-foreground' style={{ width: 'calc(var(--p) * 100%)' }} />
      </div>
    </ScrollStage>
  )
}
