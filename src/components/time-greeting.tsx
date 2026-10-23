'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useState } from 'react'

import { cn } from '@/lib/utils'

type Period = 'morning' | 'afternoon' | 'evening' | 'night'

const GREETINGS: Record<Period, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
}

// Viewer's local time, so a visitor abroad gets their own morning.
function getPeriod (hour: number): Period {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// Text finishes writing at ~1.1s; icon strokes start drawing just before.
const ICON_DELAY = 0.8

type IconProps = { play: boolean; still: boolean; className?: string }

// Hand-drawn stroke: animates pathLength 0 → 1, or renders finished when motion is reduced.
function draw ({ play, still }: IconProps, delay: number, duration = 0.6) {
  return {
    initial: still ? false : { pathLength: 0, opacity: 0 },
    animate: play ? { pathLength: 1, opacity: 1 } : undefined,
    transition: { delay: ICON_DELAY + delay, duration, ease: 'easeInOut' as const },
  }
}

const SVG_PROPS = {
  viewBox: '0 0 40 40',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const SUNRISE_RAYS = ['M20 11v-4', 'M11.5 15.5 8.7 12.7', 'M28.5 15.5l2.8-2.8', 'M8 23H4.5', 'M32 23h3.5']

function MorningIcon (props: IconProps) {
  const clipId = useId()
  return (
    <svg {...SVG_PROPS} className={`${props.className ?? 'size-10'} shrink-0 text-amber-500`}>
      <defs>
        <clipPath id={clipId}>
          <rect x='0' y='0' width='40' height='29' />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <motion.path
          d='M11 29a9 9 0 0 1 18 0'
          initial={props.still ? false : { y: 10 }}
          animate={props.play ? { y: 0 } : undefined}
          transition={{ delay: ICON_DELAY, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>
      <motion.path d='M4 29.5c4-.6 8 .5 12 0s8-.6 12 0 6 .4 8 0' {...draw(props, 0, 0.5)} />
      {SUNRISE_RAYS.map((d, i) => (
        <motion.path key={d} d={d} {...draw(props, 0.7 + i * 0.08, 0.25)} />
      ))}
    </svg>
  )
}

// Ray endpoints around (20, 20), from radius 11 to 15.
const SUN_RAYS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4
  const p = (r: number) => `${(20 + r * Math.cos(a)).toFixed(2)} ${(20 + r * Math.sin(a)).toFixed(2)}`
  return `M${p(11)}L${p(15)}`
})

function AfternoonIcon (props: IconProps) {
  return (
    <svg {...SVG_PROPS} className={`${props.className ?? 'size-10'} shrink-0 text-amber-500 dark:text-yellow-400`}>
      <motion.path d='M20 13a7 7 0 1 1 0 14a7 7 0 1 1 0-14z' {...draw(props, 0, 0.7)} />
      <motion.g
        // Motion uses fill-box origins on SVG; the rays' box is centred on the sun.
        style={{ originX: 0.5, originY: 0.5 }}
        animate={props.play && !props.still ? { rotate: 360 } : undefined}
        transition={{ delay: ICON_DELAY + 1.4, duration: 24, ease: 'linear', repeat: Infinity }}
      >
        {SUN_RAYS.map((d, i) => (
          <motion.path key={d} d={d} {...draw(props, 0.5 + i * 0.07, 0.2)} />
        ))}
      </motion.g>
    </svg>
  )
}

function EveningIcon (props: IconProps) {
  const clipId = useId()
  return (
    <svg {...SVG_PROPS} className={`${props.className ?? 'size-10'} shrink-0 text-orange-500`}>
      <defs>
        <clipPath id={clipId}>
          <rect x='0' y='0' width='40' height='25' />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <motion.circle
          cx='20'
          cy='22'
          r='8'
          initial={props.still ? false : { y: -8 }}
          animate={props.play ? { y: 0 } : undefined}
          transition={{ delay: ICON_DELAY, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </g>
      <motion.path d='M4 25.5c5-.5 9 .4 16 0s11-.5 16 0' {...draw(props, 0.1, 0.5)} />
      <motion.path d='M9 30.5c2-1 4 1 6 0s4 1 6 0 4 1 6 0' {...draw(props, 0.5, 0.4)} />
      <motion.path d='M14 35c2-1 4 1 6 0s4 1 6 0' {...draw(props, 0.7, 0.35)} />
    </svg>
  )
}

const STARS = [
  { x: 30, y: 9, s: 2.2, delay: 0.9 },
  { x: 35.5, y: 18, s: 1.5, delay: 1.1 },
  { x: 23, y: 4, s: 1.3, delay: 1.25 },
]

function NightIcon (props: IconProps) {
  return (
    <svg {...SVG_PROPS} className={`${props.className ?? 'size-10'} shrink-0 text-indigo-400`}>
      <motion.path
        d='M21 8A12.5 12.5 0 1 0 31 29a10 10 0 0 1-10-21z'
        {...draw(props, 0, 0.9)}
      />
      {STARS.map(({ x, y, s, delay }) => (
        <motion.path
          key={`${x}-${y}`}
          // Four-point sparkle: concave edges pulled toward the centre.
          d={`M${x} ${y - 2 * s}Q${x + 0.45 * s} ${y - 0.45 * s} ${x + 2 * s} ${y}Q${x + 0.45 * s} ${y + 0.45 * s} ${x} ${y + 2 * s}Q${x - 0.45 * s} ${y + 0.45 * s} ${x - 2 * s} ${y}Q${x - 0.45 * s} ${y - 0.45 * s} ${x} ${y - 2 * s}z`}
          fill='currentColor'
          strokeWidth={0.8}
          style={{ originX: 0.5, originY: 0.5 }}
          initial={props.still ? false : { opacity: 0, scale: 0 }}
          animate={props.play
            ? (props.still ? { opacity: 1, scale: 1 } : { opacity: [0.5, 1], scale: [0.75, 1.1] })
            : undefined}
          transition={props.still
            ? undefined
            : { delay: ICON_DELAY + delay, duration: 1.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

const ICONS: Record<Period, (props: IconProps) => React.JSX.Element> = {
  morning: MorningIcon,
  afternoon: AfternoonIcon,
  evening: EveningIcon,
  night: NightIcon,
}

// The server can't know the viewer's clock, so the period is null until mounted.
function useGreetingPeriod () {
  const [period, setPeriod] = useState<Period | null>(null)

  useEffect(() => {
    const update = () => setPeriod(getPeriod(new Date().getHours()))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return period
}

// Sits in the hero's empty corner, just above the name.
export function HeroGreeting ({ className }: { className?: string }) {
  const period = useGreetingPeriod()
  const still = useReducedMotion() ?? false
  // Hold the row's height until mounted so the hero doesn't shift.
  if (!period) return <div aria-hidden className={cn('h-8', className)} />
  const Icon = ICONS[period]

  return (
    <div aria-hidden className={cn('flex h-8 items-center gap-1.5', className)}>
      <motion.span
        key={period}
        className='whitespace-nowrap font-caveat text-xl leading-none text-foreground sm:text-2xl'
        initial={still ? false : { clipPath: 'inset(0 100% 0 0)', opacity: 0.4 }}
        animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
        transition={{ delay: 0.4, duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
      >
        {GREETINGS[period]}
      </motion.span>
      <Icon key={`${period}-icon`} play still={still} className='size-6 sm:size-7' />
    </div>
  )
}
