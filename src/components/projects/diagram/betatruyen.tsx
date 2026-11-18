import type { CSSProperties, ReactNode } from 'react'

import { draw, fade, pulse, rise, seg, travel } from '@/components/projects/diagram/anim'
import { AXIS, BOARDS, CHIPS, PACKET, charWidth, type Board } from '@/components/projects/diagram/betatruyen-parts'

// BetaTruyen, as a spec sheet: left, the forum as the reader sees it (a story thread with its replies, the wallet
// with two in-forum currencies and its nạp button, the item collection, the module linked with truyenyy); right, the
// frontend's real layers as an exploded stack with numbered balloons that point back into the scene. Over scroll:
// draw the forum (0-0.2), open the stack and number it (0.2-0.54), press nạp and run the request down to the API
// and back (0.54-0.8), then collect, reply, link and type the CI line (0.8-1). Progress is `--p` (see anim.ts).

const DOTO: CSSProperties = { fontFamily: 'var(--font-doto)', fontWeight: 700 }

// The scene's window and its two columns.
const WIN = { x: 12, y: 28, w: 280, h: 380 }
const COL = { x: 176, w: 106 }
const WALLET = { x: COL.x, y: 84, w: COL.w, h: 92 }
const ITEMS = { x: COL.x, y: 186, w: COL.w, h: 106 }
const LINK = { x: COL.x, y: 302, w: COL.w, h: 44 }
const BAR = { x: WALLET.x + 8, w: WALLET.w - 16 }

const SLOT = 30
const SLOT_X = [188, 236]
const SLOT_Y = [202, 250]
const SLOTS = [
  { x: SLOT_X[0], y: SLOT_Y[0], label: 'củ hành' },
  { x: SLOT_X[1], y: SLOT_Y[0], label: 'vật bảo' },
]

const gem = (x: number, y: number, r: number) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}ZM${x - r} ${y}H${x + r}`
const bolt = (x: number, y: number) => `M${x + 2} ${y - 7}L${x - 4} ${y + 1}H${x}L${x - 2} ${y + 7}L${x + 4} ${y - 1}H${x}Z`
const onion = (x: number, y: number) => `M${x} ${y + 10}A8 8 0 1 1 ${x + 0.01} ${y + 10}M${x} ${y + 2}Q${x - 4} ${y - 4} ${x} ${y - 9}M${x} ${y + 2}Q${x + 4} ${y - 4} ${x} ${y - 9}`
const chest = (x: number, y: number) => `M${x - 10} ${y - 2}H${x + 10}V${y + 8}H${x - 10}ZM${x - 10} ${y - 2}V${y - 6}A3 3 0 0 1 ${x - 7} ${y - 9}H${x + 7}A3 3 0 0 1 ${x + 10} ${y - 6}V${y - 2}M${x} ${y - 2}V${y + 3}`
const chevrons = (x: number, y: number) => `M${x - 4} ${y}L${x} ${y - 4}L${x + 4} ${y}M${x - 4} ${y + 8}L${x} ${y + 12}L${x + 4} ${y + 8}`
const cross = (x: number, y: number) => `M${x - 3} ${y}H${x + 3}M${x} ${y - 3}V${y + 3}`

// The `+` crosshairs of a sub-panel, the owner's card mark on the panels inside the drawing.
function Crosshairs ({ x, y, w, h, style }: { x: number, y: number, w: number, h: number, style: CSSProperties }) {
  return <path d={[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([cx, cy]) => cross(cx, cy)).join('')} className='dg-line' style={{ ...style, strokeWidth: 0.9 }} />
}

// A numbered balloon with its leader: the circle is drawn where the leader ends.
function Balloon ({ n, from, at, a, active }: { n: number, from: [number, number], at: [number, number], a: number, active?: CSSProperties }) {
  return (
    <g>
      <path d={`M${from[0]} ${from[1]}L${at[0] + 7} ${at[1] + 2.5}`} pathLength={1} className='dg-line' style={{ ...draw(a, a + 0.05), strokeWidth: 0.8, strokeDasharray: '1 1' }} />
      <circle cx={from[0]} cy={from[1]} r={1.2} className='dg-ink' style={fade(a, a + 0.02)} />
      <g style={fade(a + 0.04, a + 0.08)}>
        <circle cx={at[0]} cy={at[1]} r={7} className='dg-fill' style={{ strokeWidth: 0.9 }} />
        <text x={at[0]} y={at[1]} textAnchor='middle' className='dg-small'>{n}</text>
      </g>
      {active && <circle cx={at[0]} cy={at[1]} r={7} className='dg-solid' style={active} />}
    </g>
  )
}

// A small numbered tag in the scene, matching a balloon.
function Tag ({ n, x, y, a }: { n: number, x: number, y: number, a: number }) {
  return (
    <g style={rise(a, a + 0.05, 0, 4)}>
      <circle cx={x} cy={y} r={6} className='dg-wash dg-accent' style={{ strokeWidth: 0.8 }} />
      <text x={x} y={y} textAnchor='middle' className='dg-small'>{n}</text>
    </g>
  )
}

// One board of the stack, in the kit's tones: the slab's shades and top under a hairline edge, the API board as a
// dashed outline (it is another team's service, consumed over HTTP).
function BoardView ({ board, children }: { board: Board, children?: ReactNode }) {
  const { paths, external } = board
  const a = 0.04 + (4 - board.i) * 0.02
  return (
    <g style={{ ...travel(0.2, 0.36, board.open[0], board.open[1]), '--anatomy-weight': '0.8px' } as CSSProperties}>
      <g style={fade(a, a + 0.06)}>
        <path className='iso-fill' d={paths.fill} style={external ? { fillOpacity: 0.5 } : undefined} />
        {!external && paths.shades.map((d, shade) => (d ? <path key={shade} className='iso-shade' data-shade={shade} d={d} /> : null))}
        {!external && <path className='iso-top' d={paths.top} />}
        {paths.crease && <path className='iso-line' data-tone='faint' d={paths.crease} />}
        {paths.bevel && !external && <path className='iso-line' data-tone='faint' d={paths.bevel} />}
        <path className='iso-line' data-tone='faint' d={board.inset} />
        <path className='iso-line' data-tone={external ? 'mid' : 'hi'} data-dashed={external ? '' : undefined} d={paths.outline} />
      </g>
      {children}
    </g>
  )
}

const CMD = 'pnpm lint && pnpm build'
const CMD_SIZE = 11
const CMD_X = 36
const CMD_Y = 444
const CMD_W = charWidth(CMD_SIZE) * CMD.length
const CMD_A = 0.86
const CMD_B = 0.96

export function BetatruyenDiagram () {
  return (
    <svg viewBox='0 0 640 520' role='img' aria-label='BetaTruyen spec sheet: the forum with a story thread, a wallet of lục bảo and uy khí with a nạp button, the item collection and the truyenyy link module, beside the exploded stack of its frontend layers (ui, hooks, data, auth, api) with numbered balloons, a terminal line and a title block' className='dg'>
      {/* ---- the forum window ---------------------------------------------------------------------------------- */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={4} pathLength={1} className='dg-fill' style={draw(0, 0.1)} />
      <path d={`M${WIN.x} 48H${WIN.x + WIN.w}`} pathLength={1} className='dg-edge' style={draw(0.04, 0.1)} />
      <g style={fade(0.06, 0.12)}>
        {[24, 34, 44].map(x => <circle key={x} cx={x} cy={38} r={2.4} className='dg-edge' />)}
        <rect x={60} y={32} width={150} height={12} rx={6} className='dg-edge' />
        <text x={68} y={38} className='dg-dim dg-small'>betatruyen · diễn đàn truyện</text>
      </g>
      {/* header: wordmark, nav, account */}
      <g style={fade(0.1, 0.16)}>
        <text x={22} y={62} style={{ ...DOTO, fontSize: 14 }}>BetaTruyen</text>
        {[126, 158, 190].map(x => <rect key={x} x={x} y={57} width={24} height={9} rx={4.5} className='dg-edge' />)}
        <circle cx={270} cy={61} r={7} className='dg-line' />
        <path d='M266 65Q270 60 274 65M268 59A2 2 0 1 0 272 59A2 2 0 1 0 268 59' className='dg-line' style={{ strokeWidth: 0.9 }} />
        <path d={`M${WIN.x} 74H${WIN.x + WIN.w}`} className='dg-edge' />
      </g>

      {/* the open thread: votes, title, rank badge, body, replies */}
      <g style={fade(0.12, 0.2)}>
        <path d={chevrons(30, 90)} className='dg-line' />
        <path d='M44 86H126' className='dg-line' style={{ strokeWidth: 3 }} />
        <rect x={136} y={80} width={30} height={12} rx={6} className='dg-wash dg-accent' style={{ strokeWidth: 0.9 }} />
        <text x={151} y={86} textAnchor='middle' className='dg-small'>rank</text>
        <path d='M44 98H160M44 106H120' className='dg-edge' style={{ strokeWidth: 3 }} />
        <circle cx={34} cy={128} r={5} className='dg-edge' />
        <path d='M34 133V204M34 148H44M34 176H44M34 204H44' className='dg-edge' />
      </g>
      {[0, 1].map(i => {
        const y = 140 + i * 28
        return (
          <g key={i} style={rise(0.16 + i * 0.03, 0.22 + i * 0.03, 0, 6)}>
            <rect x={46} y={y} width={120} height={20} rx={4} className='dg-fill' />
            <circle cx={56} cy={y + 10} r={4} className='dg-edge' />
            <path d={`M66 ${y + 7}H${140 - i * 24}M66 ${y + 13}H${118 + i * 10}`} className='dg-edge' style={{ strokeWidth: 3 }} />
          </g>
        )
      })}
      {/* the reader's own reply lands in phase 4 */}
      <g style={rise(0.88, 0.94, 0, 8)}>
        <rect x={46} y={196} width={120} height={20} rx={4} className='dg-wash dg-accent' style={{ strokeWidth: 0.9 }} />
        <circle cx={56} cy={206} r={4} className='dg-accent' />
        <path d='M66 203H150M66 209H104' className='dg-accent' style={{ strokeWidth: 3, opacity: 0.5 }} />
      </g>
      {/* two more threads and the load-more sentinel */}
      {[232, 272].map((y, i) => (
        <g key={y} style={fade(0.18 + i * 0.03, 0.24 + i * 0.03)}>
          <path d={`M22 ${y - 4}H166`} className='dg-edge' />
          <path d={chevrons(30, y + 8)} className='dg-line' />
          <circle cx={50} cy={y + 12} r={5} className='dg-edge' />
          <path d={`M62 ${y + 8}H${150 - i * 20}M62 ${y + 16}H${110 + i * 16}`} className='dg-edge' style={{ strokeWidth: 3 }} />
        </g>
      ))}
      <g style={fade(0.24, 0.3)}>
        <path d='M22 312H166' className='dg-edge' />
        <rect x={64} y={322} width={60} height={14} rx={7} className='dg-edge dg-dash' />
        <text x={94} y={329} textAnchor='middle' className='dg-dim dg-small'>tải thêm</text>
      </g>
      {/* comment box */}
      <g style={fade(0.26, 0.32)}>
        <rect x={22} y={352} width={144} height={42} rx={4} className='dg-fill' />
        <text x={30} y={364} className='dg-dim dg-small'>bình luận…</text>
      </g>
      <path d='M30 384H120' pathLength={1} className='dg-accent' style={{ ...draw(0.82, 0.88), strokeWidth: 3, opacity: 0.6 }} />

      {/* ---- wallet: two in-forum currencies and nạp ---------------------------------------------------------- */}
      <rect x={WALLET.x} y={WALLET.y} width={WALLET.w} height={WALLET.h} rx={3} pathLength={1} className='dg-fill' style={draw(0.08, 0.16)} />
      <Crosshairs x={WALLET.x} y={WALLET.y} w={WALLET.w} h={WALLET.h} style={fade(0.14, 0.18)} />
      <text x={WALLET.x + 8} y={WALLET.y + 10} className='dg-dim dg-small' style={fade(0.14, 0.2)}>ví · nạp</text>
      {[
        { y: 112, label: 'lục bảo', icon: gem(192, 112, 5), rest: 0.3, a: 0.74 },
        { y: 142, label: 'uy khí', icon: bolt(192, 142), rest: 0.22, a: 0.79 },
      ].map(({ y, label, icon, rest, a }, i) => (
        <g key={label}>
          <g style={fade(0.16 + i * 0.03, 0.22 + i * 0.03)}>
            <path d={icon} className='dg-accent' style={{ strokeWidth: 1 }} />
            <text x={202} y={y} className='dg-small'>{label}</text>
            <rect x={BAR.x} y={y + 8} width={BAR.w} height={5} rx={2.5} className='dg-edge' />
          </g>
          <rect x={BAR.x} y={y + 8} width={BAR.w} height={5} rx={2.5} className='dg-solid' style={{ ...fade(0.16 + i * 0.03, 0.22 + i * 0.03), transformOrigin: `${BAR.x}px ${y + 10.5}px`, transform: `scaleX(calc(${rest} + ${1 - rest - 0.12 * i} * ${seg(a, a + 0.06)}))` }} />
        </g>
      ))}
      <g style={fade(0.2, 0.26)}>
        <rect x={238} y={88} width={36} height={14} rx={7} className='dg-fill dg-accent' />
        <text x={256} y={95} textAnchor='middle' className='dg-small'>nạp</text>
      </g>
      <rect x={236} y={86} width={40} height={18} rx={9} className='dg-accent' style={{ ...pulse(0.54, 0.62), strokeWidth: 1.6 }} />
      <text x={BAR.x} y={WALLET.y + WALLET.h - 10} className='dg-dim dg-small' style={fade(0.8, 0.85)}>đã nạp ✓</text>

      {/* ---- item collection -------------------------------------------------------------------------------- */}
      <rect x={ITEMS.x} y={ITEMS.y} width={ITEMS.w} height={ITEMS.h} rx={3} pathLength={1} className='dg-fill' style={draw(0.1, 0.18)} />
      <Crosshairs x={ITEMS.x} y={ITEMS.y} w={ITEMS.w} h={ITEMS.h} style={fade(0.16, 0.2)} />
      <text x={ITEMS.x + 8} y={ITEMS.y + 10} className='dg-dim dg-small' style={fade(0.16, 0.22)}>sưu tầm · vật phẩm</text>
      {SLOT_Y.map(y => SLOT_X.map(x => (
        <rect key={`${x}-${y}`} x={x} y={y} width={SLOT} height={SLOT} rx={3} className='dg-edge dg-dash' style={fade(0.18, 0.26)} />
      )))}
      {SLOTS.map((slot, i) => {
        const a = 0.85 + i * 0.05
        return (
          <g key={slot.label} style={rise(a, a + 0.06, 0, -8)}>
            <rect x={slot.x} y={slot.y} width={SLOT} height={SLOT} rx={3} className='dg-fill dg-accent' />
            <path d={i === 0 ? onion(slot.x + 15, slot.y + 13) : chest(slot.x + 15, slot.y + 15)} className='dg-line' style={{ strokeWidth: 1 }} />
            <text x={slot.x + 15} y={slot.y + SLOT + 8} textAnchor='middle' className='dg-small'>{slot.label}</text>
          </g>
        )
      })}
      {/* spending: a gem leaves the wallet for the first slot */}
      <g transform={`translate(${BAR.x + 6} 162)`}>
        <path d={gem(0, 0, 4)} className='dg-solid' style={{ ...travel(0.81, 0.89, 0, 54), ...pulse(0.8, 0.9) }} />
      </g>

      {/* ---- the module linked with truyenyy -------------------------------------------------------------------- */}
      <g style={rise(0.91, 0.97, 8, 0)}>
        <rect x={LINK.x} y={LINK.y} width={LINK.w} height={LINK.h} rx={3} className='dg-fill dg-accent' />
        <text x={LINK.x + 8} y={LINK.y + 12} className='dg-dim dg-small'>module · liên kết</text>
        <text x={LINK.x + 8} y={LINK.y + 30} style={{ fontSize: 12 }}>truyenyy</text>
        <path d='M254 326a4 4 0 0 1 0 8h-4a4 4 0 0 1 0-8m8 0h4a4 4 0 0 1 0 8h-4m-8-4h12' className='dg-line' style={{ strokeWidth: 1 }} />
        <path d={`M${LINK.x + LINK.w} ${LINK.y + 22}H${WIN.x + WIN.w + 6}`} className='dg-accent dg-dash' />
      </g>
      <path d={`M${LINK.x + LINK.w / 2} ${LINK.y + LINK.h}V${WIN.y + WIN.h}`} className='dg-edge dg-dash' style={fade(0.92, 0.97)} />

      {/* scene tags matching the balloons */}
      <Tag n={1} x={112} y={62} a={0.36} />
      <Tag n={2} x={134} y={329} a={0.4} />
      <Tag n={3} x={WALLET.x + WALLET.w - 10} y={WALLET.y + WALLET.h - 10} a={0.44} />
      <Tag n={4} x={283} y={50} a={0.48} />

      {/* ---- the anatomy stack --------------------------------------------------------------------------------- */}
      <text x={346} y={46} className='dg-dim dg-small' style={fade(0.04, 0.1)}>frontend · exploded view · {BOARDS.length} layers</text>
      <path d='M346 52H628' pathLength={1} className='dg-edge' style={draw(0.04, 0.12)} />
      {BOARDS.map((board, k) => {
        const a = 0.34 + k * 0.035
        const lit = board.external ? pulse(0.64, 0.72) : board.n === 1 ? pulse(0.54, 0.6) : undefined
        return (
          <BoardView key={board.label} board={board}>
            <Balloon n={board.n} from={board.root} at={board.balloon} a={a} active={lit} />
            <g style={fade(a + 0.02, a + 0.08)}>
              <text x={board.tag[0]} y={board.tag[1] - 8} style={{ fontSize: 10 }}>{board.label}{board.external ? ' · external' : ''}</text>
              {board.tech.map((line, row) => <text key={line} x={board.tag[0]} y={board.tag[1] + 3 + row * 10} className='dg-dim dg-small'>{line}</text>)}
            </g>
          </BoardView>
        )
      })}
      {/* the dashed centerline through the open stack, drawn in with the explode */}
      <path d={`M${AXIS.from[0]} ${AXIS.from[1]}L${AXIS.to[0]} ${AXIS.to[1]}`} style={{ transformOrigin: `${AXIS.from[0]}px ${AXIS.from[1]}px`, transform: `scaleY(${seg(0.2, 0.36)})`, fill: 'none', stroke: 'var(--anatomy-mid)', strokeWidth: 0.8, strokeDasharray: '9 2.5 1.5 2.5' }} />
      {/* the request packet: down the axis to the API, the response back up */}
      <g transform={`translate(${PACKET.at[0]} ${PACKET.at[1]})`}>
        <path d={gem(0, 0, 4.5)} className='dg-solid' style={{ ...travel(0.56, 0.66, 0, PACKET.drop), ...pulse(0.55, 0.67) }} />
      </g>
      <g transform={`translate(${PACKET.at[0]} ${PACKET.at[1] + PACKET.drop})`}>
        <circle r={3.5} className='dg-fill dg-accent' style={{ ...travel(0.68, 0.77, 0, -PACKET.drop), ...pulse(0.67, 0.78), strokeWidth: 1.4 }} />
      </g>
      <text x={PACKET.at[0] + 10} y={PACKET.at[1] + PACKET.drop + 2} className='dg-small' style={pulse(0.64, 0.72)}>200</text>
      {/* dimension of the explode, left of the balloons */}
      <g style={fade(0.5, 0.56)}>
        <path d={`M318 ${AXIS.to[1] + 18}V${AXIS.from[1] - 4}M315 ${AXIS.to[1] + 18}H321M315 ${AXIS.from[1] - 4}H321`} className='dg-edge' style={{ strokeWidth: 0.8 }} />
      </g>

      {/* side modules */}
      <text x={346} y={356} className='dg-dim dg-small' style={fade(0.42, 0.48)}>beside the stack</text>
      {CHIPS.map((chip, k) => (
        <g key={chip.label} style={rise(0.44 + k * 0.04, 0.5 + k * 0.04, 0, 6)}>
          <g transform={`translate(${chip.at[0]} ${chip.at[1]})`} style={{ '--anatomy-weight': '0.8px' } as CSSProperties}>
            <path className='iso-fill' d={chip.paths.fill} />
            {chip.paths.shades.map((d, shade) => (d ? <path key={shade} className='iso-shade' data-shade={shade} d={d} /> : null))}
            <path className='iso-top' d={chip.paths.top} />
            <path className='iso-line' data-tone='hi' d={chip.paths.outline} />
          </g>
          <text x={chip.at[0]} y={chip.at[1] + 22} textAnchor='middle' className='dg-small'>{chip.label}</text>
          <text x={chip.at[0]} y={chip.at[1] + 33} textAnchor='middle' className='dg-dim dg-small'>{chip.tech}</text>
        </g>
      ))}

      {/* ---- terminal line and title block ------------------------------------------------------------------- */}
      <text x={22} y={CMD_Y} className='dg-accent' style={{ ...fade(CMD_A - 0.02, CMD_A), fill: 'hsl(var(--primary))', stroke: 'none', fontSize: CMD_SIZE }}>$</text>
      <text x={CMD_X} y={CMD_Y} textLength={CMD_W} lengthAdjust='spacing' style={{ fontSize: CMD_SIZE }}>
        {CMD.split(' ').map((word, i, words) => {
          const n = words.length
          return <tspan key={i} style={{ fillOpacity: seg(CMD_A + (i / n) * (CMD_B - CMD_A), CMD_A + ((i + 1) / n) * (CMD_B - CMD_A)) }}>{word}{i < n - 1 ? ' ' : ''}</tspan>
        })}
      </text>
      <rect x={CMD_X} y={CMD_Y - 6.5} width={charWidth(CMD_SIZE)} height={13} className='dg-solid' style={{ ...travel(CMD_A, CMD_B, CMD_W + 1), ...fade(CMD_A - 0.02, CMD_A) }} />
      <text x={CMD_X + CMD_W + 26} y={CMD_Y} className='dg-dim dg-small' style={fade(0.96, 1)}>✓ ci · GitHub Actions</text>

      <g style={fade(0.94, 1)}>
        <rect x={12} y={476} width={616} height={30} className='dg-fill' />
        <path d='M150 476V506M330 476V506M440 476V506M530 476V506' className='dg-edge' />
        <text x={22} y={491} style={{ ...DOTO, fontSize: 13 }}>BETATRUYEN</text>
        <text x={160} y={486} className='dg-dim dg-small'>sheet</text>
        <text x={160} y={498} className='dg-small'>forum · spec sheet</text>
        <text x={340} y={486} className='dg-dim dg-small'>scale</text>
        <text x={340} y={498} className='dg-small'>1:1</text>
        <text x={450} y={486} className='dg-dim dg-small'>rev</text>
        <text x={450} y={498} className='dg-small'>A</text>
        <text x={540} y={486} className='dg-dim dg-small'>fig</text>
        <text x={540} y={498} className='dg-small'>8 / 8 · frontend</text>
      </g>
    </svg>
  )
}
