import { TooltipProvider } from '@/components/ui/tooltip'
import { DATA, META_THEME_COLORS } from '@/data/resume'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ReactLenis } from 'lenis/react'
import { Footer } from '@/components/footer'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import type { WebSite, WithContext } from 'schema-dts'
import { SITE_INFO } from '@/data/config'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description: DATA.description,
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/logo.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: {
      url: '/logo.svg',
      sizes: '180x180',
    },
  },
  openGraph: {
    title: `${DATA.name}`,
    description: DATA.description,
    url: DATA.url,
    siteName: `${DATA.name}`,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${DATA.url}me.jpg`,
        width: 1200,
        height: 630,
        alt: DATA.name
      }
    ]
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
function getWebSiteJsonLd (): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_INFO.name,
    url: SITE_INFO.url,
    alternateName: [DATA.name],
  }
}
const darkModeScript = String.raw`
  try {
    if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
    }
  } catch (_) {}

  try {
    if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
      document.documentElement.classList.add('os-macos')
    }
  } catch (_) {}
`
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: META_THEME_COLORS.light,
}
export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          type='text/javascript'
          dangerouslySetInnerHTML={{ __html: darkModeScript }}
        />
        {/*
          Thanks @tailwindcss. We inject the script via the `<Script/>` tag again,
          since we found the regular `<script>` tag to not execute when rendering a not-found page.
         */}
        <Script src={`data:text/javascript;base64,${btoa(darkModeScript)}`} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebSiteJsonLd()).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background antialiased max-w-3xl mx-auto py-2  md:py-5 mt-2 md:mt-0 overflow-x-hidden px-4'
        )}
        suppressHydrationWarning
      >
        <ReactLenis root />
        <TooltipProvider delayDuration={0}>

          <Providers>
            <Header />

            {children}
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
          </Providers>
        </TooltipProvider>

      </body>
    </html>
  )
}
