import { circle, hline, pill, rect, vline } from '@/components/iso/stack/skins/shapes'

// A generic phone app: device frame with side buttons and a notch, a title bar, four list rows with avatars, a tab bar.
export function phonePaths (): string[] {
  const paths = [
    rect(86, 6, 68, 168, 11),
    vline(84.5, 34, 12),
    vline(155.5, 42, 18),
    pill(108, 11, 24, 6),
    hline(96, 28, 28),
    circle(141, 28, 3),
  ]
  for (let i = 0; i < 4; i++) {
    const y = 38 + i * 27
    paths.push(circle(103, y + 11, 6.5), hline(115, y + 8, 28), hline(115, y + 14.5, 18))
    if (i < 3) paths.push(hline(96, y + 25, 48))
  }
  // Tab bar and home indicator.
  paths.push(hline(86, 150, 68))
  for (const x of [102, 120, 138]) paths.push(circle(x, 158, 2.2))
  paths.push(hline(109, 168, 22))
  return paths
}
