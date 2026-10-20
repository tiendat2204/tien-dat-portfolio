'use client'

import { ProgressProvider } from '@bprogress/next/app'
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
        </ProgressProvider>
      </ThemeProvider>
    </JotaiProvider>
  )
}
