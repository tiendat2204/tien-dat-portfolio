'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'

type ShellPromptProps = {
  command: string
  dir?: string
  // The command's output: shown once the command has been typed and "run".
  children?: ReactNode
  // Milliseconds per typed character.
  speed?: number
  className?: string
}

const REDUCED = '(prefers-reduced-motion: reduce)'
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const reducedNow = () => window.matchMedia(REDUCED).matches

// A zsh prompt in the oh-my-zsh "robbyrussell" look (green arrow, cyan directory) that types its command, then
// prints the output below it and leaves a fresh prompt with a blinking block cursor. With reduced motion, or before
// scripts run, the finished state is what a reader gets.
export function ShellPrompt ({ command, dir = '~', children, speed = 90, className }: ShellPromptProps) {
  const reduced = useSyncExternalStore(subscribeReduced, reducedNow, () => false)
  const [step, setStep] = useState(0)
  const typed = reduced ? command.length : step
  const done = typed >= command.length

  useEffect(() => {
    if (reduced) return
    let timer: ReturnType<typeof setTimeout>
    const advance = (index: number) => {
      setStep(index)
      if (index < command.length) timer = setTimeout(() => advance(index + 1), speed + (index % 3) * 18)
    }
    timer = setTimeout(() => advance(1), 650)
    return () => clearTimeout(timer)
  }, [command, speed, reduced])

  const prompt = (
    <>
      <span className='text-emerald-600 dark:text-emerald-400'>➜</span>
      <span className='ml-2 text-cyan-600 dark:text-cyan-400'>{dir}</span>
    </>
  )
  const cursor = <span aria-hidden='true' className='ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] bg-foreground motion-safe:animate-pulse' />

  return (
    <div className={`font-ibm ${className ?? ''}`}>
      <p className='whitespace-nowrap text-xs sm:text-sm'>
        {prompt}
        <span aria-hidden='true' className='ml-2'>{command.slice(0, typed)}</span>
        <span className='sr-only'>{done ? '' : command}</span>
        {!done && cursor}
      </p>
      <div className='shell-output' data-shown={done ? '' : undefined}>
        {children}
        <p className='whitespace-nowrap text-xs sm:text-sm'>
          {prompt}
          {done && cursor}
        </p>
      </div>
    </div>
  )
}
