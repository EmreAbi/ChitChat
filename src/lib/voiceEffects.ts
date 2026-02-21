export type VoiceEffect = 'normal' | 'disguise' | 'shadow' | 'phantom' | 'cyber'

export const VOICE_EFFECTS: { id: VoiceEffect; labelKey: string }[] = [
  { id: 'normal', labelKey: 'voiceEffect.normal' },
  { id: 'disguise', labelKey: 'voiceEffect.disguise' },
  { id: 'shadow', labelKey: 'voiceEffect.shadow' },
  { id: 'phantom', labelKey: 'voiceEffect.phantom' },
  { id: 'cyber', labelKey: 'voiceEffect.cyber' },
]

const STORAGE_KEY = 'chitchat_voice_effect'
const VALID_EFFECTS: VoiceEffect[] = ['normal', 'disguise', 'shadow', 'phantom', 'cyber']

export function getStoredVoiceEffect(): VoiceEffect {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && VALID_EFFECTS.includes(stored as VoiceEffect)) {
    return stored as VoiceEffect
  }
  return 'normal'
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

const workletLoadedContexts = new WeakSet<AudioContext>()

async function ensureWorklet(audioContext: AudioContext) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
  if (!workletLoadedContexts.has(audioContext)) {
    await audioContext.audioWorklet.addModule('/pitch-shift-processor.js')
    workletLoadedContexts.add(audioContext)
  }
}

/**
 * Builds a disguise effect chain with pitch shifting + formant EQ + waveshaper.
 */
function buildDisguiseChain(
  audioContext: AudioContext,
  source: MediaStreamAudioSourceNode,
  pitchFactor: number,
  f1Notch: number,
  f1Boost: number,
  f1BoostGain: number,
  f2Boost: number,
  f2BoostGain: number,
): AudioNode {
  // 1. Pitch shifter via phase vocoder
  const pitchShifter = new AudioWorkletNode(audioContext, 'pitch-shift-processor')
  const pitchParam = pitchShifter.parameters.get('pitchFactor')
  if (pitchParam) pitchParam.value = pitchFactor

  // 2. Notch filter: suppress original F1 region
  const notch = audioContext.createBiquadFilter()
  notch.type = 'notch'
  notch.frequency.value = f1Notch
  notch.Q.value = 2.0

  // 3. Peaking filter: boost new F1 region
  const peaking1 = audioContext.createBiquadFilter()
  peaking1.type = 'peaking'
  peaking1.frequency.value = f1Boost
  peaking1.Q.value = 1.5
  peaking1.gain.value = f1BoostGain

  // 4. Peaking filter: boost new F2 region
  const peaking2 = audioContext.createBiquadFilter()
  peaking2.type = 'peaking'
  peaking2.frequency.value = f2Boost
  peaking2.Q.value = 1.5
  peaking2.gain.value = f2BoostGain

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

/**
 * Builds the effect node chain and returns the final output node.
 * Connect the returned node to the destination.
 */
export async function applyVoiceEffect(
  audioContext: AudioContext,
  source: MediaStreamAudioSourceNode,
  effect: VoiceEffect
): Promise<AudioNode> {
  if (effect === 'normal') {
    // Passthrough: no processing
    return source
  }

  await ensureWorklet(audioContext)

  switch (effect) {
    case 'disguise':
      // Balanced disguise: moderate pitch down + formant shift
      return buildDisguiseChain(audioContext, source, 0.75, 500, 700, 8, 1800, 6)

    case 'shadow':
      // Very deep, dark voice
      return buildDisguiseChain(audioContext, source, 0.65, 500, 600, 10, 1600, 5)

    case 'phantom':
      // Higher, thinner voice
      return buildDisguiseChain(audioContext, source, 1.3, 500, 800, 8, 2200, 7)

    case 'cyber': {
      // Mechanical-disguise hybrid: pitch shift + formant EQ + ring modulation
      const chain = buildDisguiseChain(audioContext, source, 0.85, 500, 750, 7, 2000, 6)

      // Add ring modulation on top
      const oscillator = audioContext.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = 30
      oscillator.start()

      const ringMod = audioContext.createGain()
      ringMod.gain.value = 0

      oscillator.connect(ringMod.gain)
      chain.connect(ringMod)

      return ringMod
    }
  }
}
