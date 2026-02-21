export type VoiceEffect = 'none' | 'robot' | 'deep' | 'high' | 'echo' | 'disguise'

export const VOICE_EFFECTS: { id: VoiceEffect; labelKey: string }[] = [
  { id: 'none', labelKey: 'voiceEffect.none' },
  { id: 'robot', labelKey: 'voiceEffect.robot' },
  { id: 'deep', labelKey: 'voiceEffect.deep' },
  { id: 'high', labelKey: 'voiceEffect.high' },
  { id: 'echo', labelKey: 'voiceEffect.echo' },
  { id: 'disguise', labelKey: 'voiceEffect.disguise' },
]

const STORAGE_KEY = 'chitchat_voice_effect'

export function getStoredVoiceEffect(): VoiceEffect {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && ['none', 'robot', 'deep', 'high', 'echo', 'disguise'].includes(stored)) {
    return stored as VoiceEffect
  }
  return 'none'
}

export function setStoredVoiceEffect(effect: VoiceEffect): void {
  localStorage.setItem(STORAGE_KEY, effect)
}

/**
 * Creates a soft-clipping WaveShaper curve for subtle harmonic distortion.
 */
function createSoftClipCurve(samples: number = 256): Float32Array {
  const curve = new Float32Array(samples)
  for (let i = 0; i < samples; i++) {
    const x = (2 * i) / samples - 1
    curve[i] = (Math.PI + 3.5) * x / (Math.PI + 3.5 * Math.abs(x))
  }
  return curve
}

/**
 * Builds the effect node chain and returns the final output node.
 * Connect the returned node to the destination.
 */
export async function applyVoiceEffect(
  audioContext: AudioContext,
  source: MediaStreamAudioSourceNode,
  effect: VoiceEffect
): Promise<AudioNode> {
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

    case 'disguise': {
      // Phase vocoder pitch shifting + formant EQ + waveshaper
      await audioContext.audioWorklet.addModule('/pitch-shift-processor.js')

      // 1. Pitch shifter (lower voice)
      const pitchShifter = new AudioWorkletNode(audioContext, 'pitch-shift-processor')
      const pitchParam = pitchShifter.parameters.get('pitchFactor')
      if (pitchParam) pitchParam.value = 0.75

      // 2. Notch filter: suppress original F1 region (~500Hz)
      const notch = audioContext.createBiquadFilter()
      notch.type = 'notch'
      notch.frequency.value = 500
      notch.Q.value = 2.0

      // 3. Peaking filter: boost new F1 region (~700Hz)
      const peaking1 = audioContext.createBiquadFilter()
      peaking1.type = 'peaking'
      peaking1.frequency.value = 700
      peaking1.Q.value = 1.5
      peaking1.gain.value = 8

      // 4. Peaking filter: boost new F2 region (~1800Hz)
      const peaking2 = audioContext.createBiquadFilter()
      peaking2.type = 'peaking'
      peaking2.frequency.value = 1800
      peaking2.Q.value = 1.5
      peaking2.gain.value = 6

      // 5. WaveShaper: subtle harmonic distortion for timbre change
      const waveshaper = audioContext.createWaveShaper()
      waveshaper.curve = createSoftClipCurve() as unknown as Float32Array<ArrayBuffer>
      waveshaper.oversample = '2x'

      // Chain: source → pitchShifter → notch → peaking1 → peaking2 → waveshaper
      source.connect(pitchShifter)
      pitchShifter.connect(notch)
      notch.connect(peaking1)
      peaking1.connect(peaking2)
      peaking2.connect(waveshaper)

      return waveshaper
    }

    default:
      return source
  }
}
