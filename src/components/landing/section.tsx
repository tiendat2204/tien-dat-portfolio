import type React from 'react'
import { cn } from '@/lib/utils'
import SectionSvg from './section-svg'

const Section = ({
  className,
  id,
  crosses,
  crossesOffset,
  customPaddings,
  children
}: {
  className: string
  id: string
  crosses?: boolean
  crossesOffset: string
  customPaddings: boolean
  children: React.ReactNode
}) => {
  return (
    <div
      id={id}
      className={cn(
        'relative',
        customPaddings ? '' : 'py-10 lg:py-16',
        className
      )}
    >
      {/* Content */}
      {children}

      {/* Vertical Pattern Borders - Left & Right */}
      <div
        className={cn(
          'hidden absolute top-0 left-5 w-8 h-full pointer-events-none lg:block lg:left-16 xl:left-16',
          'before:absolute before:border-x before:border-stone-200 dark:before:border-stone-800 before:left-0 before:top-0 before:-z-1 before:w-8 before:h-full',
          'before:bg-[repeating-linear-gradient(135deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-border)]/56'
        )}
      />

      {/* Right Border */}
      <div
        className={cn(
          'hidden absolute top-0 right-5 w-8 h-full pointer-events-none lg:block lg:right-14 xl:right-14',
          'before:absolute before:border-x before:border-stone-200 dark:before:border-stone-800 before:top-0 before:-z-1 before:w-8 before:h-full',
          'before:bg-[repeating-linear-gradient(-135deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-border)]/56'
        )}
      />

      {/* Side Lines */}
      {/* <div className='hidden absolute top-0 left-5 w-px h-[calc(100%+30px)] dark:bg-[#26242C] bg-stone-200 pointer-events-none lg:block lg:left-16 xl:left-16' />
      <div className='hidden absolute top-0 right-5 w-px h-[calc(100%+30px)] dark:bg-[#26242C] bg-stone-200 pointer-events-none lg:block lg:right-14 xl:right-14' /> */}

      {/* Crosses SVG */}
      {crosses && (
        <SectionSvg crossesOffset={crossesOffset} />
      )}
    </div>
  )
}

export default Section
