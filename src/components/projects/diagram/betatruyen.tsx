import { draw, fade, pulse, rise, travel } from '@/components/projects/diagram/anim'

// BetaTruyen: a story forum with a top-up wallet (lục bảo, uy khí), a collection of items (củ hành and other
// legend-era treasures), story discussion threads, and a module linked with truyenyy. Progress 0..1 (see anim.ts).

const gem = (x: number, y: number, r = 8) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`
const bolt = (x: number, y: number) => `M${x + 2} ${y - 9}L${x - 5} ${y + 2}H${x}L${x - 2} ${y + 9}L${x + 5} ${y - 2}H${x}Z`

const SLOTS = [
  { x: 336, y: 62, label: 'củ hành' },
  { x: 428, y: 62, label: 'lục bảo' },
  { x: 520, y: 62, label: 'vật bảo' },
]
const EMPTY = [336, 428, 520]

export function BetatruyenDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='BetaTruyen forum: a top-up wallet with lục bảo and uy khí, a collection of items such as củ hành and treasures, story discussion threads, and a module linked with truyenyy' className='dg'>
      {/* top-up wallet */}
      <rect x={16} y={16} width={284} height={180} rx={6} pathLength={1} className='dg-fill' style={draw(0, 0.12)} />
      <text x={30} y={34} className='dg-dim dg-small' style={fade(0.06, 0.12)}>nạp · ví</text>
      {[
        { y: 60, label: 'lục bảo', icon: gem(46, 72, 9), fill: 0.62 },
        { y: 116, label: 'uy khí', icon: bolt(46, 128), fill: 0.38 },
      ].map(({ y, label, icon, fill }, i) => {
        const a = 0.1 + i * 0.05
        return (
          <g key={label}>
            <g style={fade(a, a + 0.05)}>
              <path d={icon} className='dg-accent' />
              <text x={66} y={y + 12}>{label}</text>
              <rect x={30} y={y + 32} width={256} height={8} rx={4} className='dg-edge' />
            </g>
            <rect x={30} y={y + 32} width={256 * fill} height={8} rx={4} className='dg-solid' style={{ transformOrigin: `30px ${y + 36}px`, transform: `scaleX(calc(${0.35 + i * 0.1} + 0.65 * clamp(0, calc((var(--p) - ${0.2 + i * 0.05}) / 0.25), 1)))`, opacity: `clamp(0, calc((var(--p) - ${a}) / 0.05), 1)` }} />
          </g>
        )
      })}
      <g style={fade(0.2, 0.26)}>
        <rect x={214} y={30} width={72} height={24} rx={12} className='dg-fill dg-accent' />
        <text x={250} y={42} textAnchor='middle'>nạp</text>
      </g>
      <circle cx={250} cy={42} r={14} className='dg-accent' style={pulse(0.26, 0.34, 0.03)} />

      {/* spending flows into the collection */}
      <path d='M300 106H322' pathLength={1} className='dg-accent dg-dash' style={draw(0.4, 0.48)} />
      <path d={gem(0, 0, 6)} className='dg-solid' transform='translate(300 106)' style={{ ...travel(0.42, 0.56, 36, 0), ...pulse(0.4, 0.58) }} />

      {/* item collection */}
      <rect x={316} y={16} width={308} height={180} rx={6} pathLength={1} className='dg-fill' style={draw(0.04, 0.16)} />
      <text x={330} y={34} className='dg-dim dg-small' style={fade(0.1, 0.16)}>sưu tầm · vật phẩm</text>
      {SLOTS.map((slot, i) => {
        const a = 0.5 + i * 0.08
        return (
          <g key={slot.label}>
            <rect x={slot.x} y={slot.y} width={76} height={64} rx={5} className='dg-edge dg-dash' style={fade(0.12, 0.2)} />
            <g style={rise(a, a + 0.06, 0, -10)}>
              <rect x={slot.x} y={slot.y} width={76} height={64} rx={5} className='dg-fill dg-accent' />
              {i === 0 && (
                <g>
                  <circle cx={slot.x + 38} cy={slot.y + 32} r={11} className='dg-line' />
                  <path d={`M${slot.x + 38} ${slot.y + 21}Q${slot.x + 33} ${slot.y + 13} ${slot.x + 38} ${slot.y + 9}M${slot.x + 38} ${slot.y + 21}Q${slot.x + 43} ${slot.y + 13} ${slot.x + 38} ${slot.y + 9}`} className='dg-line' />
                </g>
              )}
              {i === 1 && <path d={gem(slot.x + 38, slot.y + 28, 13)} className='dg-line' />}
              {i === 2 && (
                <g>
                  <rect x={slot.x + 22} y={slot.y + 22} width={32} height={20} rx={3} className='dg-line' />
                  <path d={`M${slot.x + 22} ${slot.y + 30}H${slot.x + 54}M${slot.x + 38} ${slot.y + 30}V${slot.y + 36}`} className='dg-line' />
                </g>
              )}
              <text x={slot.x + 38} y={slot.y + 55} textAnchor='middle' className='dg-small'>{slot.label}</text>
            </g>
          </g>
        )
      })}
      {EMPTY.map(x => (
        <rect key={x} x={x} y={136} width={76} height={44} rx={5} className='dg-edge dg-dash' style={fade(0.14, 0.22)} />
      ))}

      {/* story discussion */}
      <rect x={16} y={216} width={400} height={248} rx={6} pathLength={1} className='dg-fill' style={draw(0.06, 0.18)} />
      <text x={30} y={234} className='dg-dim dg-small' style={fade(0.12, 0.18)}>thảo luận · truyện</text>
      <g style={rise(0.62, 0.7, 0, 10)}>
        <circle cx={40} cy={266} r={9} className='dg-edge' />
        <path d='M58 262H190' className='dg-line' />
        <path d='M30 286H396M30 298H340' className='dg-edge' style={{ strokeWidth: 4 }} />
      </g>
      {[0, 1, 2].map((i) => {
        const a = 0.72 + i * 0.06
        const y = 318 + i * 46
        return (
          <g key={i} style={rise(a, a + 0.06, 0, 8)}>
            <path d={`M44 ${y}V${y + 18}H58`} className='dg-edge' />
            <rect x={60} y={y} width={320} height={34} rx={8} className={i === 1 ? 'dg-wash dg-accent' : 'dg-fill'} />
            <circle cx={76} cy={y + 17} r={6} className='dg-edge' />
            <path d={`M92 ${y + 12}H${230 + i * 40}M92 ${y + 22}H${300 - i * 30}`} className='dg-edge' style={{ strokeWidth: 4 }} />
          </g>
        )
      })}

      {/* the module linked with truyenyy */}
      <path d='M416 340H452' pathLength={1} className='dg-accent dg-dash' style={draw(0.84, 0.92)} />
      <g style={rise(0.82, 0.92, 12, 0)}>
        <rect x={452} y={290} width={172} height={100} rx={6} className='dg-fill dg-accent' />
        <text x={468} y={310} className='dg-dim dg-small'>module · link</text>
        <text x={468} y={336} style={{ fontSize: 14 }}>truyenyy</text>
        <path d='M468 360H600' className='dg-edge' />
        <path d='M468 372H560' className='dg-edge' style={{ strokeWidth: 4 }} />
      </g>
    </svg>
  )
}
