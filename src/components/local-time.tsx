'use client'

import { useEffect, useState } from 'react'

const TIMEZONE = 'Asia/Ho_Chi_Minh'

function now () {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE })
}

// Live Ho Chi Minh City time. Rendered only after mount so server and client HTML match.
export function LocalTime () {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(now())
    const id = setInterval(() => setTime(now()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <time suppressHydrationWarning className='tabular-nums'>
      {time ?? '--:--'}
    </time>
  )
}
