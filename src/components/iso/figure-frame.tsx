/*
  Theme binding: the kit styles its tokens on `.iso` (dark) and `.iso[data-theme="light"]`. This site's theme is
  next-themes with attribute='class', i.e. `.dark` on <html>. Instead of mirroring that into a `data-theme` attribute
  (which needs JS, flashes before hydration and re-renders), figure-frame.css re-declares the kit's light tokens under
  `html:not(.dark) .iso`. A theme toggle is then a pure CSS repaint: no React update, no remount of the figure.
  Figures must colour parts only through the kit's `--anatomy-*` tokens (or their own tokens derived from them).
*/
import type { ReactNode } from 'react'

import { Icon } from '@/components/Icon'
import { Status, StatusIndicator } from '@/components/kibo-ui/status'

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

const CORNER = 'absolute z-20 size-6 text-black dark:text-white'

// The shared card in the site's own style: `+` corner marks, a dot-matrix `Fig N` and title on a hairline header row,
// the drawing over the line-pattern hatch, and a footer with the mono hint and the live readout as a status pill.
// `.iso-plate` and `[data-readout]` stay: the kit's useReadout() finds the readout through them.
export function FigureFrame ({ fig, title, hint, readout, children }: FigureFrameProps) {
  return (
    <div className='iso figure-frame relative border'>
      <Icon aria-hidden='true' className={`${CORNER} -top-3 -left-3`} />
      <Icon aria-hidden='true' className={`${CORNER} -top-3 -right-3`} />
      <Icon aria-hidden='true' className={`${CORNER} -bottom-3 -left-3`} />
      <Icon aria-hidden='true' className={`${CORNER} -right-3 -bottom-3`} />
      <figure className='iso-figure'>
        <div className='iso-plate'>
          <div className='figure-frame-head flex items-center justify-between gap-4 border-b px-3'>
            <span className='shrink-0 font-doto text-base font-extrabold' data-corner='fig'>Fig {fig}</span>
            <span className='truncate font-doto text-base font-extrabold' data-corner='title'>{title}</span>
          </div>
          <div className='figure-frame-body bg-lines-pattern-light dark:bg-lines-pattern'>
            {children}
          </div>
          <div className='figure-frame-foot flex items-center justify-between gap-3 border-t px-3'>
            <span className='truncate font-ibm text-[11px] text-muted-foreground' data-corner='hint'>{hint}</span>
            <Status status='online' className='min-w-0 max-w-[60%] font-ibm text-[11px]'>
              <StatusIndicator />
              <span className='truncate' data-corner='readout' data-readout=''>{readout}</span>
            </Status>
          </div>
        </div>
      </figure>
    </div>
  )
}
