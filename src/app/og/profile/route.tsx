import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

import { SEO_PROFILE } from '@/data/seo'

// Rendered once at build: the card every link preview of the home page shows (Zalo, Facebook, Slack, X).
export const dynamic = 'force-static'

const BACKGROUND = '#09090b'
const LINE = '#27272a'
const PHOTO = 630

// `+` crosshair on the card's corners, as on the site.
function Cross ({ top, left }: { top?: number, left?: number }) {
  return (
    <div style={{ position: 'absolute', display: 'flex', width: 24, height: 24, top, left, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: 24, height: 2, background: '#fafafa' }} />
      <div style={{ position: 'absolute', width: 2, height: 24, background: '#fafafa' }} />
    </div>
  )
}

export async function GET () {
  const photo = await readFile(path.join(process.cwd(), 'public', 'me.jpg'))
  const src = `data:image/jpeg;base64,${photo.toString('base64')}`

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: BACKGROUND, color: '#fafafa' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: '64px 56px 56px 72px' }}>
          <div style={{ display: 'flex', fontSize: 30, fontFamily: 'monospace' }}>
            <span style={{ color: '#34d399' }}>$</span>
            <span style={{ color: '#22d3ee', marginLeft: 14 }}>~</span>
            <span style={{ marginLeft: 14 }}>whoami</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -3, whiteSpace: 'nowrap' }}>{SEO_PROFILE.name}</div>
            <div style={{ display: 'flex', fontSize: 46, marginTop: 20 }}>{SEO_PROFILE.jobTitle}</div>
            <div style={{ display: 'flex', fontSize: 26, color: '#a1a1aa', marginTop: 18, maxWidth: 480, lineHeight: 1.35 }}>
              Frontend focus, React and Next.js, Ho Chi Minh City
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 28, fontFamily: 'monospace', color: '#a1a1aa' }}>tiendat.work</div>
        </div>

        <div style={{ display: 'flex', width: PHOTO, height: PHOTO, borderLeft: `2px solid ${LINE}`, overflow: 'hidden', position: 'relative' }}>
          {/* The portrait is tall and the face sits near its top, so it is shown from the top instead of centre-cropped. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={PHOTO} height={Math.round(PHOTO * 1.532)} alt='' style={{ position: 'absolute', top: -34, left: 0 }} />
        </div>

        <div style={{ position: 'absolute', display: 'flex', inset: 0, border: `2px solid ${LINE}` }} />
        <Cross top={-1} left={-1} />
        <Cross top={-1} left={1176} />
        <Cross top={606} left={-1} />
        <Cross top={606} left={1176} />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
