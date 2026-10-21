import { ImageResponse } from 'next/og'

import { SEO_PROFILE } from '@/data/seo'

const MAX_TITLE_LENGTH = 100
// Literal copy of META_THEME_COLORS.dark: importing resume.tsx would pull React icon components into the route.
const BACKGROUND = '#09090b'

export function GET (request: Request) {
  const raw = new URL(request.url).searchParams.get('title')?.trim() ?? ''
  const base = raw || SEO_PROFILE.name
  const title = base.length > MAX_TITLE_LENGTH ? `${base.slice(0, MAX_TITLE_LENGTH - 1).trimEnd()}…` : base

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: BACKGROUND,
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', fontSize: 36 }}>{SEO_PROFILE.homeTitle}</div>
          <div style={{ display: 'flex', fontSize: 28, color: '#a1a1aa' }}>tiendat.work</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
