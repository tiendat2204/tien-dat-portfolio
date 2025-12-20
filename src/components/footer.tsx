import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Icons } from '@/components/icons'

interface FooterProps {
  logo: React.ReactNode
  brandName: string
  socialLinks: {
    icon: React.ReactNode
    href: string
    label: string
  }[]
  mainLinks: {
    href: string
    label: string
  }[]
  legalLinks: {
    href: string
    label: string
  }[]
  copyright: {
    text: string
    license?: string
  }
}

export function Footer ({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className='md:py-18 py-8 border-x font-ibm relative '>
      <div className='px-4 lg:px-8'>
        <div className='md:flex md:items-start md:justify-between'>
          <Link
            href='/'
            className='flex items-center gap-x-2 w-full'
            aria-label={brandName}
          >
            <div className='size-10'>
              <Icons.Logo />
            </div>
            <span className='font-bold text-2xl font-doto whitespace-nowrap '>{brandName}</span>
          </Link>
          <ul className='flex list-none mt-6 md:mt-0 space-x-3'>
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant='secondary'
                  size='icon'
                  className='h-10 w-10 '
                  asChild
                >
                  <a href={link.href} target='_blank' aria-label={link.label} rel='noreferrer'>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <div className='border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10'>
          <nav className='lg:mt-0 lg:col-[4/11]'>
            <ul className='list-none flex flex-wrap -my-1 -mx-2 lg:justify-end'>
              {mainLinks.map((link, i) => (
                <li key={i} className='my-1 mx-2 shrink-0'>
                  <a
                    href={link.href}
                    className='text-sm text-primary underline-offset-4 hover:underline'
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

        </div>

      </div>
      <div className='mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap text-start px-4 lg:px-8'>
        <div>{copyright.text}</div>
      </div>
    </footer>
  )
}
