// Hero: the "TD" initials as isometric voxels.
// Each letter is a 5x7 pixel glyph (the same grid as the Doto font),
// and every lit pixel becomes a small cube. Same drawing in light and dark mode.

const GLYPHS = {
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
}

const UNIT = 14
const CUBE = 0.78
const HEIGHT = 0.78
const COS = Math.cos(Math.PI / 6)
const SIN = Math.sin(Math.PI / 6)

type Voxel = { x: number; y: number }

// Glyph columns run along x (reading direction), rows along y.
const VOXELS: Voxel[] = [GLYPHS.T, GLYPHS.D].flatMap((rows, letter) =>
  rows.flatMap((row, y) =>
    [...row].flatMap((cell, x) => (cell === '1' ? [{ x: x + letter * 6.5, y }] : []))
  )
)

function project (x: number, y: number, z: number) {
  return [(x - y) * COS * UNIT, ((x + y) * SIN - z) * UNIT] as const
}

function toPoints (pts: (readonly [number, number])[]) {
  return pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
}

function cubeFaces ({ x, y }: Voxel) {
  const x1 = x + CUBE
  const y1 = y + CUBE
  const h = HEIGHT
  return {
    top: toPoints([project(x, y, h), project(x1, y, h), project(x1, y1, h), project(x, y1, h)]),
    right: toPoints([project(x1, y, h), project(x1, y1, h), project(x1, y1, 0), project(x1, y, 0)]),
    front: toPoints([project(x, y1, h), project(x1, y1, h), project(x1, y1, 0), project(x, y1, 0)]),
  }
}

// Back to front so nearer cubes cover farther ones.
// Each cube also gets a drop-in delay that sweeps left to right, like the letters being typed.
const FACES = [...VOXELS]
  .sort((a, b) => a.x + a.y - (b.x + b.y))
  .map((v, i) => ({
    ...cubeFaces(v),
    delay: Math.round(v.x * 45 + v.y * 15),
    // Fixed pseudo-random burst direction (Konami easter egg), same on server and client.
    dx: Math.round(Math.sin(i * 12.9898) * 140),
    dy: Math.round(Math.cos(i * 78.233) * 90 - 40),
    rot: Math.round(Math.sin(i * 3.7) * 180),
  }))

const corners = VOXELS.flatMap(({ x, y }) => [
  project(x, y + CUBE, 0),
  project(x + CUBE, y, 0),
  project(x, y, HEIGHT),
  project(x + CUBE, y + CUBE, 0),
])
const minX = Math.min(...corners.map(([px]) => px))
const maxX = Math.max(...corners.map(([px]) => px))
const minY = Math.min(...corners.map(([, py]) => py))
const maxY = Math.max(...corners.map(([, py]) => py))
const PAD = 4
const VIEW_BOX = `${minX - PAD} ${minY - PAD} ${maxX - minX + PAD * 2} ${maxY - minY + PAD * 2}`

export function IsoLogo ({ className }: { className?: string }) {
  return (
    <svg viewBox={VIEW_BOX} className={className} fill='none' aria-hidden='true'>
      <defs>
        <pattern id='iso-dots' width='3' height='3' patternUnits='userSpaceOnUse'>
          <circle cx='1.5' cy='1.5' r='0.55' className='fill-neutral-500 dark:fill-neutral-400' />
        </pattern>
      </defs>
      <g strokeWidth='0.75' strokeLinejoin='round' className='stroke-neutral-700 dark:stroke-neutral-400'>
        {FACES.map((face, i) => (
          <g
            key={i}
            className='voxel'
            style={{ animationDelay: `${face.delay}ms`, '--dx': `${face.dx}px`, '--dy': `${face.dy}px`, '--rot': `${face.rot}deg` } as React.CSSProperties}
          >
            <polygon points={face.right} className='fill-neutral-200 dark:fill-neutral-800' />
            <polygon points={face.front} className='fill-neutral-100 dark:fill-neutral-900' />
            <polygon points={face.top} className='fill-background' />
            <polygon points={face.top} fill='url(#iso-dots)' />
          </g>
        ))}
      </g>
    </svg>
  )
}

export function IsoHero () {
  return (
    <div className='absolute inset-0 touch-manipulation overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(var(--color-neutral-300)_1px,transparent_1px)] dark:bg-[radial-gradient(var(--color-neutral-700)_1px,transparent_1px)] [background-size:12px_12px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]' />
      <div className='absolute inset-x-0 inset-y-4 flex justify-center'>
        <IsoLogo className='h-full w-auto' />
      </div>
      <span className='absolute bottom-2 left-3 font-ibm text-[11px] text-neutral-400 dark:text-neutral-500'>
        fig.01 — td.voxel
      </span>
    </div>
  )
}
