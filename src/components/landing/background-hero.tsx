'use client'

import { FlickeringGrid } from '@/components/ui/flickering-grid-hero'
import { useGridConfig } from '@/hooks/useGridConfig'
import { maskStyle } from '@/data/config'

export function BackgroundHero () {
  const gridConfig = useGridConfig()

  return (
    <div className='flex w-full h-[200px] justify-center items-center'>
      <FlickeringGrid
        className='absolute inset-0 z-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] motion-safe:animate-pulse'
        {...gridConfig.background}
      />
      <div
        className='absolute inset-0 z-0 motion-safe:animate-fade-in'
        style={{
          ...maskStyle,
          animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <FlickeringGrid {...gridConfig.logo} />
      </div>
    </div>
  )
}
