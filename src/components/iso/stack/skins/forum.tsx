import { circle, hline, pill, poly, rect, vline } from '@/components/iso/stack/skins/shapes'

// Up and down vote ticks (two chevrons) left of a post.
function votes (x: number, y: number): string[] {
  return [poly([[x - 4, y + 3], [x, y - 1], [x + 4, y + 3]]), poly([[x - 4, y + 9], [x, y + 13], [x + 4, y + 9]])]
}

// A generic forum: top bar, a post with vote ticks and an indented reply thread, then two more posts.
export function forumPaths (): string[] {
  const paths = [
    rect(8, 8, 224, 164, 5),
    hline(8, 24, 224),
    pill(16, 12, 72, 8),
    pill(196, 12, 28, 8),
  ]
  // The open post: votes, avatar, title, meta.
  paths.push(...votes(20, 34), circle(38, 39, 6), hline(50, 36, 96), hline(50, 43, 52))
  // The reply thread: a rail from the post avatar, elbows into two indented replies.
  paths.push(vline(38, 45, 35), hline(38, 60, 13), 'M38 80 A4 4 0 0 0 42 84 H51')
  for (const y of [60, 84]) paths.push(circle(56, y, 5), hline(66, y - 3, 70), hline(66, y + 3, 44))
  paths.push(hline(8, 100, 224))
  // Two more posts.
  for (const y of [110, 140]) {
    paths.push(...votes(20, y), circle(38, y + 5, 6), hline(50, y + 2, 84), hline(50, y + 9, 46))
    if (y === 110) paths.push(hline(8, 130, 224))
  }
  return paths
}
