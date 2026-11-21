'use client'

import { BotAvatar, type BotAvatarProps } from 'bot-avatars'
import { useSyncExternalStore, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** What the character is feeling. `focused` and `surprised` hold the head still: down at the work, or thrown back. */
export type AgentDotMood = 'idle' | 'working' | 'happy' | 'focused' | 'surprised' | 'asleep'

const MOODS: Record<AgentDotMood, Pick<BotAvatarProps, 'state' | 'pose'>> = {
  idle: { state: 'default' },
  working: { state: 'working' },
  happy: { state: 'working' },
  focused: { state: 'default', pose: { pitch: -0.45, yaw: -0.25 } },
  surprised: { state: 'default', pose: { pitch: 0.5, roll: 0.12 } },
  asleep: { state: 'sleeping' },
}

// The avatar draws on a canvas, so it is only rendered in the browser.
const subscribe = () => () => {}
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false)

export interface AgentDotProps {
  /** Body shape, one of the bot-avatars types. */
  type?: BotAvatarProps['type']
  /** Body colour; the name tag takes it too. Defaults to the shape's own colour. */
  color?: string
  /** Avatar size in px. */
  size?: number
  /** Shown in the name tag under the character. Leave it out for a bare avatar. */
  name?: string
  /** What it is doing right now, after the name: `Quill · write about`. */
  task?: string
  /** Three pulsing dots after the task, for work in progress. */
  busy?: boolean
  /** A `!` badge on the character's shoulder. */
  alert?: boolean
  mood?: AgentDotMood
  /** A speech bubble above the character. */
  bubble?: ReactNode
  /** Freeze the avatar: for reduced motion, or while it is off screen. */
  paused?: boolean
  /** Eyes follow the pointer and a click makes it hop. On by default unless paused. */
  interactive?: boolean
  /** Offset 0–1 so a row of characters does not blink in unison. */
  seed?: number
  /**
   * How the body is drawn. `fabric` (the library's default) is plush fur and by far the most expensive to animate:
   * about ten times `plastic`, `crisp`, `smooth` or `flat`. Keep it for a character that is paused or on its own.
   */
  shading?: BotAvatarProps['shading']
  className?: string
}

/**
 * An AI agent as a little character: a plush avatar with a mood, a name tag that says what it is doing, an alert
 * badge and a speech bubble. Presentational: where it stands and what it feels are up to the caller.
 */
export function AgentDot ({
  type = 'star',
  color,
  size = 64,
  name,
  task,
  busy = false,
  alert = false,
  mood = 'idle',
  bubble,
  paused = false,
  interactive = !paused,
  seed,
  shading,
  className,
}: AgentDotProps) {
  const isClient = useIsClient()

  return (
    <span className={cn('relative inline-flex flex-col items-center gap-1 font-mono', className)}>
      {bubble && (
        <span role='status' className='absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-52 -translate-x-1/2 border bg-background px-2 py-1 text-[11px] leading-4 text-foreground shadow-sm'>
          {bubble}
        </span>
      )}
      <span aria-hidden='true' className='relative block shrink-0' style={{ width: size, height: size }}>
        {isClient && <BotAvatar type={type} color={color} face='mouth' size={size} seed={seed} shading={shading} paused={paused} interactive={interactive} {...MOODS[mood]} />}
        {alert && (
          <span className='absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-foreground text-xs font-bold text-background'>!</span>
        )}
      </span>
      {name && (
        <span className='flex w-max items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-black' style={{ backgroundColor: color ?? '#e5e5e5' }}>
          <span>{name}</span>
          {task && (
            <>
              <span className='opacity-50'>·</span>
              <span>{task}</span>
            </>
          )}
          {busy && (
            <span aria-hidden='true' className='flex gap-0.5 pl-0.5'>
              {[0, 200, 400].map((delay) => (
                <i key={delay} className='size-[3px] rounded-full bg-current motion-safe:animate-pulse' style={{ animationDelay: `${delay}ms` }} />
              ))}
            </span>
          )}
        </span>
      )}
    </span>
  )
}

export default AgentDot
