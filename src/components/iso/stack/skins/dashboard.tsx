import { circle, hline, pill, rect, vline } from '@/components/iso/stack/skins/shapes'

// A generic admin dashboard: sidebar with nav rows, top bar, a bar chart, a KPI tile and a table with column ticks.
export function dashboardPaths (): string[] {
  const paths = [
    rect(8, 8, 224, 164, 5),
    vline(56, 8, 164),
    rect(16, 15, 10, 10, 2),
    hline(56, 30, 176),
    pill(66, 14, 64, 10),
    circle(220, 19, 5),
  ]
  // Sidebar nav: the active row sits in a pill.
  paths.push(pill(13, 39, 38, 10))
  for (let i = 0; i < 5; i++) paths.push(hline(19, 44 + i * 14, i === 0 ? 24 : 18 + (i % 2) * 8))
  // Chart panel with a baseline and three bars.
  paths.push(rect(66, 38, 98, 56, 3), hline(76, 84, 78))
  const bars: [number, number][] = [[84, 22], [104, 36], [124, 28]]
  for (const [x, h] of bars) paths.push(rect(x, 84 - h, 12, h))
  // KPI tile: a number bar and a trend rule.
  paths.push(rect(172, 38, 50, 56, 3), hline(180, 52, 22), hline(180, 64, 32), hline(180, 74, 14))
  // Table: header with column ticks, then rows.
  paths.push(rect(66, 102, 156, 62, 3), hline(66, 114, 156))
  for (const x of [110, 150, 190]) paths.push(vline(x, 105, 6))
  for (let i = 0; i < 3; i++) {
    const y = 126 + i * 13
    if (i < 2) paths.push(hline(66, y + 6.5, 156))
    paths.push(hline(74, y, 26), hline(118, y, 22))
  }
  return paths
}
