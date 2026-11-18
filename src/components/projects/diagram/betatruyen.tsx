import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'

// Betatruyen: a story reader page with chapter list and reading progress, a star rating, a comment thread with
// replies, and a ranking list whose rows swap order. Progress 0..1 (see anim.ts).

const star = (cx: number, cy: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 4.8 : 12
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join('') + 'Z'

const CHAPTERS = ['chapter 1', 'chapter 2', 'chapter 3']
// start slot -> end slot of the ranking rows
const RANK: { from: number, to: number }[] = [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }, { from: 3, to: 3 }]
const slotY = (s: number) => 318 + s * 34

export function BetatruyenDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='Betatruyen: a story reader page with a chapter list and reading progress, a star rating, a comment thread with replies, and a ranking list whose rows swap order' className='dg'>
      {/* reader page */}
      <rect x={24} y={28} width={290} height={424} rx={6} pathLength={1} className='dg-fill' style={draw(0, 0.1)} />
      <text x={40} y={48} style={fade(0.04, 0.1)}>title</text>
      <path d='M40 62H298' className='dg-edge' />
      {CHAPTERS.map((c, i) => (
        <g key={c} style={fade(0.08 + i * 0.03, 0.14 + i * 0.03)}>
          <circle cx={46} cy={82 + i * 20} r={3.5} className={i === 1 ? 'dg-solid' : 'dg-fill'} />
          <text x={58} y={82 + i * 20} className={i === 1 ? '' : 'dg-dim'}>{c}</text>
        </g>
      ))}
      <path d='M40 154H298' pathLength={1} className='dg-edge' style={{ ...draw(0.1, 0.16), strokeWidth: 5 }} />
      <path d='M40 154H298' pathLength={1} className='dg-accent' style={{ ...draw(0.18, 0.7), strokeWidth: 5 }} />
      <circle cx={40} cy={154} r={5} className='dg-solid' style={travel(0.18, 0.7, 258)} />
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M40 ${178 + i * 20}H${i % 4 === 3 ? 200 : 298}`} pathLength={1} className='dg-edge' style={{ ...draw(0.14 + i * 0.03, 0.2 + i * 0.03), strokeWidth: 5 }} />
      ))}

      {/* star rating */}
      <g style={rise(0.3, 0.38, 12, 0)}>
        <rect x={334} y={28} width={282} height={68} rx={6} className='dg-fill' />
        <text x={348} y={44} className='dg-dim dg-small'>rating</text>
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <path d={star(364 + i * 36, 70)} pathLength={1} className='dg-line' style={draw(0.3, 0.38)} />
          {i < 4 && <path d={star(364 + i * 36, 70)} className='dg-solid' style={fade(0.38 + i * 0.04, 0.42 + i * 0.04)} />}
        </g>
      ))}

      {/* comment thread */}
      <g style={rise(0.46, 0.54, 12, 0)}>
        <rect x={334} y={108} width={282} height={158} rx={6} className='dg-fill' />
        <circle cx={354} cy={128} r={8} className='dg-fill' />
        <path d='M370 124H430' className='dg-line' />
        <path d='M370 134H590M346 152H590' className='dg-edge' style={{ strokeWidth: 4 }} />
        <text x={348} y={118} className='dg-dim dg-small'>comment</text>
      </g>
      {[0, 1].map((i) => (
        <g key={i} style={{ ...rise(0.54 + i * 0.07, 0.6 + i * 0.07, 0, 8), transformOrigin: `${380}px ${190 + i * 40}px` }}>
          <path d={`M358 ${174 + i * 40}V${190 + i * 40}H370`} className='dg-edge' />
          <rect x={372} y={174 + i * 40} width={228} height={32} rx={8} className='dg-wash dg-accent' />
          <path d={`M384 ${186 + i * 40}H${540 - i * 50}M384 ${196 + i * 40}H${480 - i * 30}`} className='dg-edge' style={{ strokeWidth: 4 }} />
        </g>
      ))}

      {/* ranking */}
      <g style={rise(0.64, 0.7, 12, 0)}>
        <rect x={334} y={278} width={282} height={174} rx={6} className='dg-fill' />
        <text x={348} y={292} className='dg-dim dg-small'>ranking</text>
      </g>
      {RANK.map(({ from, to }, i) => {
        const moved = to !== from
        return (
          <g key={i} style={{ ...fade(0.66 + i * 0.01, 0.72 + i * 0.01), ...(moved ? travel(0.76, 0.9, 0, (to - from) * 34) : {}) }}>
            <rect x={346} y={slotY(from) - 12} width={258} height={26} rx={4} className={i === 2 ? 'dg-wash dg-accent' : 'dg-fill'} />
            <circle cx={364} cy={slotY(from)} r={9} className={i === 2 ? 'dg-solid' : 'dg-fill'} />
            <text x={364} y={slotY(from)} textAnchor='middle' className={i === 2 ? 'dg-on dg-small' : 'dg-small'} style={{ opacity: moved ? `calc(1 - ${seg(0.8, 0.86)})` : 1 }}>{from + 1}</text>
            {moved && <text x={364} y={slotY(from)} textAnchor='middle' className={i === 2 ? 'dg-on dg-small' : 'dg-small'} style={fade(0.82, 0.88)}>{to + 1}</text>}
            <path d={`M382 ${slotY(from)}H${500 - i * 22}`} className='dg-line' style={{ strokeWidth: 4 }} />
            <path d={`M552 ${slotY(from)}h40`} className='dg-edge' style={{ strokeWidth: 4 }} />
          </g>
        )
      })}
      <path d='M340 300H610' className='dg-accent dg-dash' pathLength={1} style={{ ...draw(0.74, 0.8), ...pulse(0.74, 0.92) }} />
    </svg>
  )
}
