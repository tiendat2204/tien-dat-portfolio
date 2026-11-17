import { hline, rect, vline } from '@/components/iso/stack/skins/shapes'

// A generic document editor: app window with a toolbar, a page with a heading, paragraphs and a small table.
export function editorPaths (): string[] {
  const paths = [
    rect(8, 8, 224, 164, 5),
    hline(8, 24, 224),
  ]
  // Toolbar: two groups of tool squares split by a tick.
  for (const x of [16, 26, 36]) paths.push(rect(x, 12.5, 7, 7, 1.5))
  paths.push(vline(49, 12, 8))
  for (const x of [55, 65]) paths.push(rect(x, 12.5, 7, 7, 1.5))
  // The page.
  paths.push(rect(52, 32, 136, 132, 2), hline(64, 46, 64))
  for (const [y, w] of [[58, 112], [65, 106], [72, 112], [79, 70]]) paths.push(hline(64, y, w))
  // Small table: 3 rows by 3 columns.
  paths.push(rect(64, 90, 112, 36), hline(64, 102, 112), hline(64, 114, 112), vline(101, 90, 36), vline(139, 90, 36))
  for (const [y, w] of [[138, 112], [145, 100], [152, 56]]) paths.push(hline(64, y, w))
  return paths
}
