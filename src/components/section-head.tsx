import Link from 'next/link'

type SectionHeadProps = {
  index: number
  total: number
  title: string
  // Optional link on the right, e.g. "all projects".
  link?: { href: string, label: string }
}

// The home page's section heading in the spec-sheet voice used on /projects: a Doto title on the left and a mono
// "§ 05 / 10" sheet number (or a link) on the right.
export function SectionHead ({ index, total, title, link }: SectionHeadProps) {
  const sheet = `${String(index).padStart(2, '0')} / ${total}`
  return (
    <div className='flex items-baseline justify-between gap-4 px-4'>
      <h2 className='font-doto text-2xl font-extrabold'>{title}</h2>
      {link
        ? (
          <Link href={link.href} className='font-ibm text-[11px] uppercase tracking-wide text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline'>
            {link.label} →
          </Link>
          )
        : <span className='font-ibm text-[11px] uppercase tracking-wide text-muted-foreground'>§ {sheet}</span>}
    </div>
  )
}
