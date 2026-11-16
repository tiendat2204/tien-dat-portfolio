'use client'

import { createContext, useContext } from 'react'

// True while the figure is near the viewport. A Live component passes it to the kit's useLoop as `running`,
// so its frame loop stops offscreen.
export const FigureActiveContext = createContext(false)

export function useFigureActive () {
  return useContext(FigureActiveContext)
}
