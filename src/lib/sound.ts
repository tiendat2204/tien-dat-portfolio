'use client'

// Tiny UI sounds synthesized with the Web Audio API (no audio files).
// Browsers only start audio after a user gesture, so the first click unlocks it.
let ctx: AudioContext | null = null

type SoundName = 'click' | 'open'

const TONES: Record<SoundName, { freq: number; to: number; duration: number; type: OscillatorType }> = {
  click: { freq: 1400, to: 900, duration: 0.04, type: 'square' },
  open: { freq: 500, to: 900, duration: 0.1, type: 'triangle' },
}

export function playSound (name: SoundName = 'click') {
  if (typeof window === 'undefined') return
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const { freq, to, duration, type } = TONES[name]
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(to, now + duration)
    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration)
  } catch {}
}
