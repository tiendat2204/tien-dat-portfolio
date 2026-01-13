'use client'
import { Particles } from '@/components/ui/particles'
import { useTheme } from 'next-themes'
import React from 'react'

const ParticlesClient = () => {
  const theme = useTheme()
  return (
    <Particles
      className='absolute inset-0'
      quantity={100}
      ease={80}
      color={theme.theme === 'dark' ? '#fff' : '#000'}
      refresh
    />
  )
}

export default ParticlesClient
