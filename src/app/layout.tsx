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
import { SITE_INFO, UMAMI_WEBSITE_ID } from '@/data/config'
import { SEO_PROFILE } from '@/data/seo'
import Script from 'next/script'
import Section from '@/components/landing/section'
import TransitionProvider from '@/components/TransitionProvider'
import { CommandMenu } from '@/components/command-menu'
import { UiEffects } from '@/components/ui-effects'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { getAllPosts } from '@/data/blog'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  title: {
    default: SEO_PROFILE.homeTitle,
    template: '%s – Tien Dat',
  },
  description: SEO_PROFILE.description,
  keywords: [...SEO_PROFILE.keywords],
  authors: [{ name: SEO_PROFILE.name, url: SITE_INFO.url }],
  creator: SEO_PROFILE.name,
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
    siteName: SEO_PROFILE.name,
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
    card: 'summary_large_image',
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
          'min-h-screen bg-background antialiased   mt-2 md:mt-0 overflow-x-hidden px-4'
        )}
        suppressHydrationWarning
      >
        <TransitionProvider>
          <Section
            className='overflow-x-clip w-full'
            crossesOffset='lg:translate-y-[3.15rem]'
            customPaddings
            id='hero'
          >

            <ReactLenis root />
            <TooltipProvider delayDuration={0}>

              <Providers>
                <Header />

                {children}
                <Footer />
                <CommandMenu posts={getAllPosts().map((p) => ({ slug: p.slug, title: p.metadata.title }))} />
                <UiEffects />
                <KeyboardShortcuts />
              </Providers>
            </TooltipProvider>

          </Section>
        </TransitionProvider>
        {UMAMI_WEBSITE_ID && (
          <Script
            src='https://cloud.umami.is/script.js'
            data-website-id={UMAMI_WEBSITE_ID}
            data-domains={new URL(SITE_INFO.url).host}
            strategy='afterInteractive'
          />
        )}
      </body>
    </html>
  )
}
