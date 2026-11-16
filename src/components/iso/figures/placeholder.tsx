import type { FigureModule } from '@/components/iso/figure-contract'

type PlaceholderSpec = Pick<FigureModule, 'id' | 'fig' | 'title' | 'hint'>

// Stand-in until the real figure lands: the same module shape, drawing only a line of text.
export function placeholderFigure (spec: PlaceholderSpec): FigureModule {
  function Placeholder () {
    return <p className='text-center font-mono text-xs text-muted-foreground'>Fig {spec.fig} · not built</p>
  }
  return { ...spec, Static: Placeholder, Live: Placeholder }
}
