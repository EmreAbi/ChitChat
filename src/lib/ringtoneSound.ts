let audioContext: AudioContext | null = null
let activeNodes: { stop: () => void }[] = []

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * Plays a repeating ringtone for incoming calls.
 * Returns a stop function.
 */
export function playRingtone(): () => void {
  try {
    const ctx = getAudioContext()
    let stopped = false
    let timeoutId: ReturnType<typeof setTimeout>

    function playBurst() {
      if (stopped) return
      const now = ctx.currentTime

      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      gain.connect(ctx.destination)
      osc1.connect(gain)
      osc2.connect(gain)

      // Classic phone ring - two alternating tones
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(440, now)
      osc1.frequency.setValueAtTime(480, now + 0.25)

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(480, now)
      osc2.frequency.setValueAtTime(440, now + 0.25)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.setValueAtTime(0.2, now + 0.5)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.55)
      osc2.stop(now + 0.55)

      // Repeat every 2 seconds (ring-pause pattern)
      timeoutId = setTimeout(playBurst, 2000)
    }

    playBurst()

    const stopFn = () => {
      stopped = true
      clearTimeout(timeoutId)
    }
    activeNodes.push({ stop: stopFn })
    return stopFn
  } catch {
    return () => {}
  }
}

/**
 * Plays a repeating ringback tone for outgoing calls.
 * Returns a stop function.
 */
export function playRingback(): () => void {
  try {
    const ctx = getAudioContext()
    let stopped = false
    let timeoutId: ReturnType<typeof setTimeout>

    function playTone() {
      if (stopped) return
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      gain.connect(ctx.destination)
      osc.connect(gain)

      // Standard ringback: 440Hz + 480Hz, 2s on, 4s off
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)

      gain.gain.setValueAtTime(0.1, now)
      gain.gain.setValueAtTime(0.1, now + 1.8)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0)

      osc.start(now)
      osc.stop(now + 2.0)

      timeoutId = setTimeout(playTone, 4000)
    }

    playTone()

    const stopFn = () => {
      stopped = true
      clearTimeout(timeoutId)
    }
    activeNodes.push({ stop: stopFn })
    return stopFn
  } catch {
    return () => {}
  }
}

/** Stops all active ringtones/ringback tones */
export function stopAllTones() {
  activeNodes.forEach(n => n.stop())
  activeNodes = []
}
