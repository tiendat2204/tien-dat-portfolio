import { circle, hline, pill, poly, rect } from '@/components/iso/stack/skins/shapes'

// A generic web page: browser chrome (three dots, address bar), a hero with an image placeholder, three cards, a footer.
export function webPaths (): string[] {
  const paths = [
    rect(8, 8, 224, 164, 6),
    hline(8, 26, 224),
    circle(18, 17, 2.2),
    circle(26, 17, 2.2),
    circle(34, 17, 2.2),
    pill(64, 12.5, 112, 9),
    // Hero: heading, sub line, button, image placeholder (a frame with a sun and hills).
    rect(20, 36, 200, 54, 3),
    hline(32, 52, 84),
    hline(32, 61, 64),
    pill(32, 71, 30, 9),
    rect(148, 44, 60, 38, 2),
    circle(190, 54, 3.5),
    poly([[148, 82], [166, 64], [178, 74], [188, 66], [208, 82]]),
  ]
  // Three cards, each with a thumbnail rule and two text lines.
  for (let i = 0; i < 3; i++) {
    const x = 20 + i * 69
    paths.push(rect(x, 98, 62, 48, 3), hline(x, 120, 62), hline(x + 7, 129, 40), hline(x + 7, 137, 28))
  }
  // Footer.
  paths.push(hline(8, 155, 224), hline(20, 164, 36), hline(184, 164, 36))
  return paths
}
