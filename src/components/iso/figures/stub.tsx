import type { FigureModule } from '@/components/iso/figure-contract'

type StubSpec = Pick<FigureModule, 'id' | 'fig' | 'title' | 'hint'>

// Stand-in until the stack-anatomy drawing lands: the full module shape, drawing one line of text.
export function stubFigure (spec: StubSpec): FigureModule {
  function Stub () {
    return <p className='text-center font-mono text-xs text-muted-foreground'>Fig {spec.fig} · building</p>
  }
  return { ...spec, Static: Stub, Live: Stub }
}
