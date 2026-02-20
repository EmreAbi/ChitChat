let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

export function playMessageSound() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    // Two-tone WhatsApp-style notification
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    gain.connect(ctx.destination)
    osc1.connect(gain)
    osc2.connect(gain)

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    osc1.frequency.setValueAtTime(1046, now + 0.08)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(660, now)
    osc2.frequency.setValueAtTime(784, now + 0.08)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.15)
    osc2.stop(now + 0.15)
  } catch {
    // Audio not available
  }
}
