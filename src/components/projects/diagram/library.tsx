import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// Library: shelved books (floor + shelf), a barcode scanned in the browser, the ISBN lookup filling the entry form,
// then a loan card with borrow, due and return dates. Progress 0..1 (see anim.ts).

const SPINES = [
  [14, 56], [10, 66], [16, 50], [12, 62], [14, 58], [10, 48], [16, 64], [12, 54], [14, 60], [10, 52], [16, 66], [12, 58],
]
const OFFSETS = SPINES.map((_, i) => 40 + SPINES.slice(0, i).reduce((sum, [w]) => sum + w + 4, 0))
const FIELDS = ['isbn', 'title', 'author']

function Shelf ({ y, label, hot }: { y: number, label: string, hot?: number }) {
  return (
    <g>
      {SPINES.map(([w, h], i) => {
        return <rect key={i} x={OFFSETS[i]} y={y - h} width={w} height={h} rx={1.5} className={i === hot ? 'dg-wash dg-accent' : 'dg-fill'} />
      })}
      <path d={`M32 ${y}H316`} className='dg-line' />
      <text x={32} y={y + 14} className='dg-dim dg-small'>{label}</text>
    </g>
  )
}

export function LibraryDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='Library: books on shelves by floor, a barcode scanned in the browser, the ISBN lookup filling the entry form, then a loan card with borrow, due and return dates' className='dg'>
      {/* shelves */}
      <g style={fade(0, 0.14)}>
        <Shelf y={100} label='floor 1 · shelf A' />
        <Shelf y={190} label='floor 2 · shelf B' hot={4} />
      </g>
      <path d='M32 40V204M316 40V204' pathLength={1} className='dg-edge' style={draw(0, 0.12)} />

      {/* barcode card */}
      <g style={rise(0.14, 0.24, 0, 10)}>
        <rect x={32} y={256} width={284} height={176} rx={6} className='dg-fill' />
        <text x={48} y={272} className='dg-dim dg-small'>camera · barcode</text>
        <path d='M148 190V244' className='dg-accent dg-dash' />
      </g>
      <g className='dg-ink' style={fade(0.2, 0.28)}>
        {[0, 4, 7, 9, 13, 16, 18, 22, 25, 27, 31, 34, 36, 40, 43, 45].map((o, i) => (
          <rect key={o} x={90 + o * 2.6} y={296} width={i % 3 === 0 ? 4 : 2.4} height={80} />
        ))}
      </g>
      <text x={174} y={392} textAnchor='middle' className='dg-small' style={fade(0.2, 0.28)}>isbn</text>
      <rect x={76} y={292} width={196} height={2.4} rx={1.2} className='dg-solid' style={{ ...travel(0.3, 0.5, 0, 88), ...pulse(0.3, 0.52) }} />
      <rect x={76} y={288} width={196} height={96} rx={3} className='dg-accent' style={fade(0.46, 0.52)} />

      {/* scan fills the entry form */}
      <path d='M320 340H356V160H368' pathLength={1} className='dg-accent dg-dash' style={draw(0.5, 0.6)} />
      <g style={rise(0.52, 0.6, 12, 0)}>
        <rect x={368} y={40} width={248} height={176} rx={6} className='dg-fill' />
        <text x={384} y={58} className='dg-dim dg-small'>entry form · lookup</text>
      </g>
      {FIELDS.map((f, i) => {
        const y = 80 + i * 44
        const a = 0.58 + i * 0.07
        return (
          <g key={f}>
            <text x={384} y={y} className='dg-small' style={fade(0.54, 0.6)}>{f}</text>
            <rect x={384} y={y + 10} width={216} height={20} rx={3} className='dg-fill' style={fade(0.54, 0.6)} />
            <rect x={390} y={y + 17} height={6} rx={3} className='dg-solid' style={{ width: `calc(${seg(a, a + 0.07)} * ${i === 0 ? 120 : 170 - i * 20}px)` }} />
          </g>
        )
      })}

      {/* loan card with three dates */}
      <path d='M492 220V248' pathLength={1} className='dg-accent dg-dash' style={draw(0.74, 0.8)} />
      <g style={rise(0.76, 0.84, 0, 12)}>
        <rect x={368} y={252} width={248} height={180} rx={6} className='dg-fill' />
        <text x={384} y={270} className='dg-dim dg-small'>loan card</text>
      </g>
      {['borrow', 'due', 'return'].map((f, i) => {
        const y = 288 + i * 34
        return (
          <g key={f} style={fade(0.8 + i * 0.03, 0.86 + i * 0.03)}>
            <text x={384} y={y + 10} className='dg-small'>{f}</text>
            <rect x={456} y={y} width={144} height={20} rx={3} className={i === 1 ? 'dg-wash dg-accent' : 'dg-fill'} />
            <path d={`M466 ${y + 10}H${i === 2 ? 500 : 540}`} className='dg-edge' />
          </g>
        )
      })}
      <g style={fade(0.9, 0.96)}>
        <circle cx={388} cy={404} r={7} className='dg-fill dg-accent' />
        <path d='M384.5 404L387 406.5L391.5 401.5' pathLength={1} className='dg-accent' style={draw(0.9, 0.96)} />
        <text x={402} y={404} className='dg-small'>due check</text>
      </g>
    </svg>
  )
}
