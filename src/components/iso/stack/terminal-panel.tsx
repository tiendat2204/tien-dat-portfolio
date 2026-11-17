import type { Ref } from 'react'

import type { terminalAt } from '@/components/iso/stack/engine'
import type { TerminalStep } from '@/components/iso/stack/types'

export type TerminalState = ReturnType<typeof terminalAt>

type Cursor = TerminalState['cursor']

const CURSOR_CLASS = 'ml-px inline-block h-3 w-1.5 translate-y-0.5 bg-foreground motion-safe:animate-pulse'

// Row r of block i: 0 is the prompt, 1..n the code lines, n + 1 the result. The cursor sits on a row while that row
// is being typed; once a block prints its result it moves to the idle `$` row after the last block.
function rowText (state: TerminalState, i: number, r: number, lineCount: number): string {
  const block = state.blocks[i]
  if (!block) return ''
  if (r === 0) return block.prompt
  if (r <= lineCount) return block.typed[r - 1] ?? ''
  return block.result ?? ''
}

function cursorOn (cursor: Cursor, i: number, r: number, lineCount: number) {
  return cursor.block === i && cursor.line === r && r <= lineCount
}

function rowShown (state: TerminalState, i: number, r: number, lineCount: number) {
  const block = state.blocks[i]
  if (!block) return false
  if (cursorOn(state.cursor, i, r, lineCount)) return true
  if (r === 0) return block.prompt.length > 0
  if (r <= lineCount) return r - 1 < block.typed.length
  return block.result !== null
}

function idleShown (state: TerminalState, steps: TerminalStep[]) {
  const step = steps[state.cursor.block]
  return step ? state.cursor.line > step.lines.length : true
}

type PanelProps = { id: string, steps: TerminalStep[], state: TerminalState, scroll?: boolean, panelRef?: Ref<HTMLDivElement> }

// The sheet's NOTES block in the owner's terminal voice: a `$` prompt in muted ink, typed code in Plex Mono, a muted
// result line and the pixel-block cursor, under a hatch title strip. The sheet's grid draws its border. Static renders
// it once; Live renders it once and then rewrites it with `writeTerminal`.
export function TerminalPanel ({ id, steps, state, scroll = false, panelRef }: PanelProps) {
  const cursor = <span data-cursor='' aria-hidden='true' className={CURSOR_CLASS} />
  const idle = idleShown(state, steps)
  return (
    <div ref={panelRef} className='stack-term font-ibm'>
      <div className='sheet-strip bg-lines-pattern-light dark:bg-lines-pattern'>
        <span>notes</span>
        <span>~/{id}</span>
      </div>
      <div className='stack-term-screen' data-scroll={scroll ? '' : undefined} tabIndex={scroll ? 0 : undefined} aria-label={scroll ? 'Terminal output' : undefined}>
        <div className='stack-term-log'>
          {steps.map((step, i) => {
            const lineCount = step.lines.length
            const rows = Array.from({ length: lineCount + 2 }, (_, r) => r)
            return (
              <div key={i} data-block={i} className='stack-term-block'>
                {rows.map(r => {
                  const here = cursorOn(state.cursor, i, r, lineCount)
                  const text = rowText(state, i, r, lineCount)
                  const shown = rowShown(state, i, r, lineCount)
                  if (r === 0) {
                    return (
                      <p key={r} data-row={r} hidden={!shown}>
                        <span className='text-muted-foreground'>$</span> <span data-text=''>{text}</span>{here && cursor}
                      </p>
                    )
                  }
                  return (
                    <p key={r} data-row={r} hidden={!shown} className={r > lineCount ? 'text-muted-foreground' : undefined}>
                      <span data-text=''>{text}</span>{here && cursor}
                    </p>
                  )
                })}
              </div>
            )
          })}
          <p data-idle='' hidden={!idle}>
            <span className='text-muted-foreground'>$</span>{idle && cursor}
          </p>
        </div>
      </div>
    </div>
  )
}

// Rewrite the panel in place for a new state: text, visibility and where the cursor sits. Writes only what changed.
export function writeTerminal (root: HTMLElement, state: TerminalState) {
  const cursor = root.querySelector<HTMLElement>('[data-cursor]')
  const blocks = [...root.querySelectorAll<HTMLElement>('[data-block]')]
  let home: HTMLElement | null = null
  for (const [i, block] of blocks.entries()) {
    const rows = [...block.querySelectorAll<HTMLElement>('[data-row]')]
    const lineCount = rows.length - 2
    for (const [r, row] of rows.entries()) {
      const text = rowText(state, i, r, lineCount)
      const slot = row.querySelector<HTMLElement>('[data-text]')
      if (slot && slot.textContent !== text) slot.textContent = text
      const shown = rowShown(state, i, r, lineCount)
      if (row.hidden === shown) row.hidden = !shown
      if (cursorOn(state.cursor, i, r, lineCount)) home = row
    }
  }
  const idle = root.querySelector<HTMLElement>('[data-idle]')
  const current = blocks[state.cursor.block]
  const idleOn = !current || state.cursor.line > current.querySelectorAll('[data-row]').length - 2
  if (idle && idle.hidden === idleOn) idle.hidden = !idleOn
  if (idle && idleOn) home = idle
  if (cursor && home && cursor.parentElement !== home) home.appendChild(cursor)
}
