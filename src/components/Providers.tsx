'use client'

import { ProgressProvider } from '@bprogress/next/app'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Provider as JotaiProvider } from 'jotai'
import { ThemeProvider } from 'next-themes'

export function Providers ({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        storageKey='theme'
        defaultTheme='dark'
        attribute='class'
      >
        <ProgressProvider
          height='2px'
          color='#ffffff'
          options={{ showSpinner: false }}
          shallowRouting
        >
          {children}
          <Analytics />
          <SpeedInsights />
        </ProgressProvider>
      </ThemeProvider>
    </JotaiProvider>
  )
}
