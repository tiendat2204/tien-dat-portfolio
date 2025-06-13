import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DATA } from '@/data/resume'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import './globals.css'
import { ReactLenis } from 'lenis/react'
import { Footer } from '@/components/footer'
import Navbar from '@/components/navbar'

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: `${DATA.name}`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: `${DATA.name}`,
    card: 'summary_large_image',
  },
  verification: {
    google: '',
    yandex: '',
  },
}

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background antialiased max-w-3xl mx-auto py-12  md:pb-0 mt-8 md:mt-0 overflow-x-hidden px-4'
        )}
        suppressHydrationWarning
      >
        <ReactLenis root />
        <ThemeProvider attribute='class' defaultTheme='dark'>
          <TooltipProvider delayDuration={0}>
            {children}
            <Navbar />
            <Footer
              logo={DATA.footer.logo}
              brandName={DATA.footer.brandName}
              socialLinks={DATA.footer.socialLinks.map(link => ({
                icon: link.icon,
                href: link.url,
                label: link.name
              }))}
              mainLinks={DATA.footer.mainLinks.map(link => ({
                href: link.href,
                label: link.name
              }))}
              legalLinks={DATA.footer.legalLinks.map(link => ({
                href: link.href,
                label: link.name
              }))}
              copyright={{
                text: DATA.footer.copyright,
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
