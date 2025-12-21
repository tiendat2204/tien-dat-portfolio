'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const GRID_CONFIG_THEME = {
  light: {
    background: {
      color: '#000000',
      maxOpacity: 0.05,
      flickerChance: 0.08,
      squareSize: 6,
      gridGap: 6,
    },
    logo: {
      color: '#000000',
      maxOpacity: 0.95,
      flickerChance: 0.12,
      squareSize: 4,
      gridGap: 8,
    },
  },
  dark: {
    background: {
      color: '#cccccc',
      maxOpacity: 0.05,
      flickerChance: 0.08,
      squareSize: 6,
      gridGap: 6,
    },
    logo: {
      color: '#FFFFFF',
      maxOpacity: 0.95,
      flickerChance: 0.12,
      squareSize: 4,
      gridGap: 8,
    },
  },
} as const

export function useGridConfig () {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const currentTheme = theme === 'system' ? systemTheme : theme
  const themeMode = (currentTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark'

  if (!mounted) {
    return GRID_CONFIG_THEME.light
  }

  return GRID_CONFIG_THEME[themeMode]
}
