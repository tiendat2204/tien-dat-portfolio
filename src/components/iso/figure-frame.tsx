/*
  Theme binding: the kit styles its tokens on `.iso` (dark) and `.iso[data-theme="light"]`. This site's theme is
  next-themes with attribute='class', i.e. `.dark` on <html>. Instead of mirroring that into a `data-theme` attribute
  (which needs JS, flashes before hydration and re-renders), figure-frame.css re-declares the kit's light tokens under
  `html:not(.dark) .iso`. A theme toggle is then a pure CSS repaint: no React update, no remount of the figure.
  Figures must colour parts only through the kit's `--anatomy-*` tokens (or their own tokens derived from them).
*/
import type { ReactNode } from 'react'

import { Plate } from '@/components/iso/kit/react/draw'

import '@/components/iso/kit/iso.css'
import '@/components/iso/figure-frame.css'

type FigureFrameProps = {
  fig: number
  title: string
  hint: string
  // Resting readout text; Live components overwrite it in place via the kit's useReadout().say().
  readout?: string
  children: ReactNode
}

// The shared card: `Fig N` top-left, title top-right, hint bottom-left, live readout bottom-right.
export function FigureFrame ({ fig, title, hint, readout, children }: FigureFrameProps) {
  return (
    <div className='iso figure-frame'>
      <Plate fig={`Fig ${fig}`} title={title} hint={hint} readout={readout}>
        {children}
      </Plate>
    </div>
  )
}
