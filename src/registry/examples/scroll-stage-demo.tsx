'use client'

import { ScrollStage } from '../ScrollStage/scroll-stage'
import { draw, fade, pulse, rise, travel } from '../ScrollStage/scroll-progress'

const CHAPTERS = [
  { at: 0, label: 'track' },
  { at: 0.3, label: 'packet' },
  { at: 0.7, label: 'result' },
]

// Scroll to pin the card. Everything inside is CSS driven by the stage's variables: `--p` (progress) draws the track and
// runs the packet, `--ps` (eased progress) fills the bar a beat behind the scroll, and `--v` (velocity) skews the packet
// while you scroll fast. The strip under the card names the chapters and jumps to them.
export default function ScrollStageDemo () {
  return (
    <ScrollStage topOffset={96} distance={1.2} chapters={CHAPTERS} className='mx-auto w-full max-w-xl border bg-background font-mono text-xs'>
      <div className='p-4'>
        <svg viewBox='0 0 400 160' role='img' aria-label='A packet travels along a track to a result' className='w-full text-foreground'>
          <path d='M30 80H370' pathLength={1} fill='none' stroke='currentColor' strokeWidth={1.5} style={draw(0, 0.3)} />
          <rect x={20} y={64} width={20} height={32} fill='none' stroke='currentColor' style={fade(0, 0.1)} />
          <rect x={360} y={64} width={20} height={32} fill='none' stroke='currentColor' style={fade(0.1, 0.2)} />
          <g style={{ ...travel(0.3, 0.7, 340), ...pulse(0.28, 0.74) }}>
            <rect
              x={26}
              y={74}
              width={12}
              height={12}
              fill='currentColor'
              style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: 'skewX(calc(var(--v) * -40deg))' }}
            />
          </g>
          <g style={rise(0.7, 0.9, 0, 10)}>
            <rect x={250} y={100} width={130} height={36} fill='none' stroke='currentColor' />
            <text x={262} y={122} fill='currentColor'>result: ok</text>
          </g>
        </svg>
        <div className='mt-3 h-1 w-full bg-muted'>
          <div className='h-full bg-foreground' style={{ width: 'calc(var(--ps) * 100%)' }} />
        </div>
      </div>
    </ScrollStage>
  )
}
