export type VoiceEffect = 'none' | 'robot' | 'deep' | 'high' | 'echo'

export const VOICE_EFFECTS: { id: VoiceEffect; labelKey: string }[] = [
  { id: 'none', labelKey: 'voiceEffect.none' },
  { id: 'robot', labelKey: 'voiceEffect.robot' },
  { id: 'deep', labelKey: 'voiceEffect.deep' },
  { id: 'high', labelKey: 'voiceEffect.high' },
  { id: 'echo', labelKey: 'voiceEffect.echo' },
]

const STORAGE_KEY = 'chitchat_voice_effect'

export function getStoredVoiceEffect(): VoiceEffect {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && ['none', 'robot', 'deep', 'high', 'echo'].includes(stored)) {
    return stored as VoiceEffect
  }
  return 'none'
}

export function setStoredVoiceEffect(effect: VoiceEffect): void {
  localStorage.setItem(STORAGE_KEY, effect)
}

/**
 * Builds the effect node chain and returns the final output node.
 * Connect the returned node to the destination.
 */
export function applyVoiceEffect(
  audioContext: AudioContext,
  source: MediaStreamAudioSourceNode,
  effect: VoiceEffect
): AudioNode {
  switch (effect) {
    case 'robot': {
      // Ring modulation: multiply signal with a low-frequency oscillator
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = 50
      oscillator.start()

      const modulationGain = audioContext.createGain()
      modulationGain.gain.value = 0

      oscillator.connect(modulationGain.gain)
      source.connect(modulationGain)

      return modulationGain
    }

    case 'deep': {
      // Lowpass filter to cut highs + boost low frequencies
      const lowpass = audioContext.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 800
      lowpass.Q.value = 1

      const lowBoost = audioContext.createBiquadFilter()
      lowBoost.type = 'lowshelf'
      lowBoost.frequency.value = 300
      lowBoost.gain.value = 12

      source.connect(lowpass)
      lowpass.connect(lowBoost)

      return lowBoost
    }

    case 'high': {
      // Highpass filter to cut lows + boost high frequencies
      const highpass = audioContext.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 800
      highpass.Q.value = 1

      const highBoost = audioContext.createBiquadFilter()
      highBoost.type = 'highshelf'
      highBoost.frequency.value = 3000
      highBoost.gain.value = 12

      source.connect(highpass)
      highpass.connect(highBoost)

      return highBoost
    }

    case 'echo': {
      // Mix dry signal with delayed wet signal
      const dry = audioContext.createGain()
      dry.gain.value = 1.0

      const delay = audioContext.createDelay(1.0)
      delay.delayTime.value = 0.3

      const wet = audioContext.createGain()
      wet.gain.value = 0.5

      const merger = audioContext.createGain()
      merger.gain.value = 1.0

      source.connect(dry)
      dry.connect(merger)

      source.connect(delay)
      delay.connect(wet)
      wet.connect(merger)

      // Feedback loop for trailing echo
      wet.connect(delay)

      return merger
    }

    default:
      return source
  }
}
