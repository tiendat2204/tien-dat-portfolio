import { draw, fade, rise, travel } from '@/components/projects/diagram/anim'

// Tangni: a profile moves through the two-level review (member drafts and submits, secretary reviews, admin gives final
// approval), with a public lookup below it. Progress 0..1 (see anim.ts).

const COLS = [
  { label: 'member', x: 24, step: 'draft + submit' },
  { label: 'secretary', x: 232, step: 'review' },
  { label: 'admin', x: 440, step: 'final approval' },
]
const COL_W = 176
const MODULES = ['accounts', 'roles', 'permissions']

export function TangniDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='Tangni: a member drafts a profile with documents, a secretary reviews it, an admin gives final approval; a public lookup page finds profiles' className='dg'>
      {/* three actor columns */}
      {COLS.map((c, i) => (
        <g key={c.label}>
          <rect x={c.x} y={32} width={COL_W} height={236} rx={6} pathLength={1} className='dg-fill' style={draw(0.02 * i, 0.1 + 0.02 * i)} />
          <path d={`M${c.x} 62H${c.x + COL_W}`} className='dg-edge' style={fade(0.06, 0.12)} />
          <text x={c.x + COL_W / 2} y={47} textAnchor='middle' style={fade(0.06, 0.12)}>{c.label}</text>
          <g style={fade(i === 0 ? 0.1 : i === 1 ? 0.42 : 0.74, i === 0 ? 0.16 : i === 1 ? 0.5 : 0.82)}>
            <rect x={c.x + 18} y={218} width={COL_W - 36} height={34} rx={5} className={i === 2 ? 'dg-wash dg-accent' : 'dg-edge'} />
            <text x={c.x + COL_W / 2} y={235} textAnchor='middle' className='dg-small'>{c.step}</text>
          </g>
        </g>
      ))}

      {/* gates between columns */}
      <path d='M200 150H232M224 144L232 150L224 156' pathLength={1} className='dg-accent dg-dash' style={draw(0.2, 0.3)} />
      <path d='M408 150H440M432 144L440 150L432 156' pathLength={1} className='dg-accent dg-dash' style={draw(0.5, 0.6)} />

      {/* the profile card, drafted in member, passed on twice */}
      <rect x={57} y={110} width={110} height={80} rx={5} className='dg-edge dg-dash' style={fade(0.1, 0.16)} />
      <g style={travel(0.28, 0.4, 208)}>
        <g style={travel(0.58, 0.7, 208)}>
          <g style={rise(0.08, 0.2, 0, 10)}>
            <rect x={57} y={110} width={110} height={80} rx={5} className='dg-fill dg-accent' />
            <text x={69} y={126} className='dg-small'>profile</text>
            <circle cx={81} cy={152} r={10} className='dg-line' />
            <path d='M98 146H154M98 158H140M69 176H154' className='dg-edge' />
            {/* attached identity document */}
            <g style={fade(0.16, 0.22)}>
              <path d='M140 102H158V128H140Z' className='dg-fill' />
              <path d='M144 110H154M144 116H154M144 122H150' className='dg-line' />
            </g>
          </g>
        </g>
      </g>
      <text x={24} y={282} className='dg-dim dg-small' style={fade(0.18, 0.24)}>+ identity document</text>

      {/* secretary review check */}
      <g style={fade(0.44, 0.5)}>
        <circle cx={320} cy={88} r={11} className='dg-fill dg-accent' />
      </g>
      <path d='M314.5 88L318.5 92L326 83.5' pathLength={1} className='dg-accent' style={draw(0.42, 0.5)} />

      {/* admin final approval stamp */}
      <g style={rise(0.76, 0.86, 0, -16)}>
        <circle cx={528} cy={88} r={14} className='dg-wash dg-accent' />
        <path d='M521 88L526 93L536 82' className='dg-accent' />
      </g>
      <text x={528} y={118} textAnchor='middle' className='dg-small' style={fade(0.82, 0.88)} />

      {/* public lookup */}
      <text x={24} y={304} className='dg-dim dg-small' style={fade(0.64, 0.7)}>public · lookup</text>
      <g style={rise(0.64, 0.76, 0, 12)}>
        <rect x={24} y={316} width={400} height={30} rx={15} className='dg-fill' />
        <circle cx={44} cy={331} r={5} className='dg-line' />
        <path d='M48 335L53 340' className='dg-line' />
        <text x={64} y={331} className='dg-dim dg-small'>monastery or profile</text>
      </g>
      <g style={rise(0.8, 0.9, 0, 10)}>
        <rect x={24} y={356} width={400} height={34} rx={5} className='dg-fill' />
        <circle cx={44} cy={373} r={8} className='dg-edge' />
        <text x={64} y={373} className='dg-small'>monastery · profile</text>
        <path d='M250 373H400' className='dg-edge' />
      </g>

      {/* admin modules */}
      <text x={452} y={304} className='dg-dim dg-small' style={fade(0.86, 0.92)}>admin modules</text>
      {MODULES.map((m, i) => (
        <g key={m} style={fade(0.88 + i * 0.03, 0.94 + i * 0.03)}>
          <rect x={452} y={316 + i * 26} width={120} height={22} rx={4} className='dg-fill' />
          <text x={464} y={327 + i * 26} className='dg-small'>{m}</text>
        </g>
      ))}
    </svg>
  )
}
