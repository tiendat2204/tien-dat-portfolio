import { draw, fade, pulse, rise, travel } from '@/components/projects/diagram/anim'

// Portfolio: a browser wireframe of the site draws in, an .mdx document turns into a rendered blog post, then a
// light/dark sweep crosses the window. Progress 0..1 (see anim.ts).

const CARDS: [number, number][] = [[40, 172], [172, 172], [40, 262], [172, 262]]
const PARAS = [
  'M344 150H580M344 164H570M344 178H540',
  'M344 202H580M344 216H560',
]

export function PortfolioDiagram () {
  return (
    <svg viewBox='0 0 640 480' role='img' aria-label='Portfolio: a Next.js site wireframe with a card grid, an MDX document rendered as a blog post with a code block, then a light and dark theme sweep across the window' className='dg'>
      {/* browser window */}
      <rect x={24} y={32} width={592} height={416} rx={8} pathLength={1} className='dg-fill' style={draw(0, 0.12)} />
      <g style={fade(0.04, 0.12)}>
        <path d='M24 66H616' className='dg-edge' />
        {[40, 54, 68].map(x => <circle key={x} cx={x} cy={49} r={3.5} className='dg-edge' />)}
        <rect x={120} y={41} width={300} height={16} rx={8} className='dg-fill' />
        <text x={134} y={49} className='dg-dim dg-small'>portfolio · static pages</text>
      </g>

      {/* hero heading lines + card grid */}
      <path d='M40 94H250' pathLength={1} className='dg-line' style={{ ...draw(0.08, 0.16), strokeWidth: 6 }} />
      <path d='M40 116H190' pathLength={1} className='dg-line' style={{ ...draw(0.1, 0.18), strokeWidth: 6 }} />
      <path d='M40 140H280' pathLength={1} className='dg-edge' style={{ ...draw(0.12, 0.2), strokeWidth: 4 }} />
      {CARDS.map(([x, y], i) => (
        <g key={`${x}-${y}`} style={fade(0.14 + i * 0.03, 0.2 + i * 0.03)}>
          <rect x={x} y={y} width={120} height={78} rx={5} className='dg-fill' />
          <rect x={x + 8} y={y + 8} width={104} height={32} rx={3} className='dg-wash' />
          <path d={`M${x + 8} ${y + 54}H${x + 90}M${x + 8} ${y + 64}H${x + 62}`} className='dg-edge' />
        </g>
      ))}

      {/* the mdx document travels into the blog page */}
      <g style={{ ...travel(0.3, 0.5, 292, -66), ...pulse(0.26, 0.54, 0.04) }}>
        <rect x={40} y={380} width={104} height={32} rx={5} className='dg-fill dg-accent' />
        <text x={92} y={396} textAnchor='middle'>post.mdx</text>
      </g>
      <path d='M150 396H300' pathLength={1} className='dg-accent dg-dash' style={{ ...draw(0.28, 0.4), ...pulse(0.28, 0.56) }} />

      {/* rendered blog post */}
      <g style={rise(0.46, 0.56, 0, 12)}>
        <rect x={324} y={80} width={276} height={344} rx={6} className='dg-fill' />
      </g>
      <path d='M344 108H500' pathLength={1} className='dg-line' style={{ ...draw(0.52, 0.6), strokeWidth: 6 }} />
      {PARAS.map((d, i) => (
        <path key={d} d={d} pathLength={1} className='dg-edge' style={{ ...draw(0.56 + i * 0.04, 0.64 + i * 0.04), strokeWidth: 4 }} />
      ))}
      <g style={fade(0.64, 0.72)}>
        <rect x={344} y={244} width={236} height={84} rx={4} className='dg-wash' />
        <text x={356} y={260} className='dg-dim dg-small'>code</text>
        <path d='M356 278H430M368 292H470M368 306H410' className='dg-accent' />
      </g>
      <path d='M344 348H575M344 362H550M344 376H520' pathLength={1} className='dg-edge' style={{ ...draw(0.68, 0.74), strokeWidth: 4 }} />

      {/* light / dark sweep: wash grows from the left, the divider rides its edge */}
      <rect x={25} y={67} height={380} className='dg-ink' style={{ width: `calc(${'clamp(0, calc((var(--p) - 0.76) / 0.12), 1)'} * 295px)`, opacity: 0.12 }} />
      <path d='M25 67V447' pathLength={1} className='dg-accent' style={{ ...travel(0.76, 0.88, 295), ...pulse(0.76, 1, 0.02), opacity: 'calc(min(clamp(0, calc((var(--p) - 0.76) / 0.02), 1), 1 - clamp(0, calc((var(--p) - 0.88) / 0.04), 1)))' }} />
      <g style={fade(0.76, 0.82)}>
        <circle cx={570} cy={49} r={8} className='dg-fill' />
        <g style={{ opacity: 'calc(1 - clamp(0, calc((var(--p) - 0.8) / 0.08), 1))' }}>
          <circle cx={570} cy={49} r={3} className='dg-accent' />
          <path d='M570 42V44M570 54V56M563 49H565M575 49H577' className='dg-accent' />
        </g>
        <path d='M572 44A5 5 0 1 0 573 54A4 4 0 0 1 572 44Z' className='dg-solid' style={fade(0.82, 0.88)} />
      </g>
      <text x={590} y={49} textAnchor='end' className='dg-dim dg-small' style={fade(0.78, 0.86)}>theme</text>

      {/* the build facts */}
      <g style={fade(0.9, 0.96)}>
        <rect x={40} y={420} width={110} height={16} rx={8} className='dg-fill dg-accent' />
        <text x={95} y={428} textAnchor='middle' className='dg-small'>static generation</text>
        <rect x={160} y={420} width={124} height={16} rx={8} className='dg-fill dg-accent' />
        <text x={222} y={428} textAnchor='middle' className='dg-small'>image optimization</text>
      </g>
    </svg>
  )
}
