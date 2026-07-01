/**
 * Advanced Audio Configurations for Studio-grade high sensitivity & standard processing
 */

export interface AudioConfigSettings {
  mode: 'voice' | 'studio' | 'custom';
  ans: boolean; // Active Noise Suppression
  agc: boolean; // Automatic Gain Control
  aec: boolean; // Acoustic Echo Cancellation
  profile: 'speech_standard' | 'music_standard' | 'high_quality' | 'high_quality_stereo';
  micVolume: number; // 0 to 100
}

const DEFAULT_AUDIO_CONFIG: AudioConfigSettings = {
  mode: 'voice',
  ans: true,
  agc: true,
  aec: true,
  profile: 'music_standard',
  micVolume: 100
};

export function getAudioConfig(): AudioConfigSettings {
  try {
    const stored = localStorage.getItem('bingo_live_audio_config');
    if (stored) {
      return { ...DEFAULT_AUDIO_CONFIG, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Failed to parse audio config', err);
  }
  return DEFAULT_AUDIO_CONFIG;
}

export function saveAudioConfig(config: AudioConfigSettings): void {
  try {
    localStorage.setItem('bingo_live_audio_config', JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save audio config', err);
  }
}

/**
 * Returns browser-compatible MediaTrackConstraints for getUserMedia audio
 */
export function getBrowserAudioConstraints(config?: AudioConfigSettings): MediaTrackConstraints {
  const cfg = config || getAudioConfig();
  
  if (cfg.mode === 'studio') {
    // Pin-drop sensitivity studio preset
    return {
      echoCancellation: true, // Echo cancellation stays on for feedback protection
      noiseSuppression: false, // Absolutely essential to hear soft ambient noise / pin-drop
      autoGainControl: false,  // Preserves full natural audio sensitivity & dynamic range
      channelCount: 2,         // Stereo recording
      sampleRate: 48000,       // Full HD CD sample rate
      sampleSize: 16
    };
  } else if (cfg.mode === 'voice') {
    // Normal speech-optimized mode (standard noise cancellation)
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 44100
    };
  } else {
    // Custom fine-tuned manual studio sliders
    return {
      echoCancellation: cfg.aec,
      noiseSuppression: cfg.ans,
      autoGainControl: cfg.agc,
      channelCount: cfg.profile === 'high_quality_stereo' ? 2 : 1,
      sampleRate: (cfg.profile === 'high_quality' || cfg.profile === 'high_quality_stereo') ? 48000 : 44100
    };
  }
}

/**
 * Returns Agora Microphone Audio Track Initialization options
 */
export function getAgoraAudioTrackInitOptions(config?: AudioConfigSettings) {
  const cfg = config || getAudioConfig();
  
  if (cfg.mode === 'studio') {
    return {
      AEC: true,
      ANS: false, // Disable noise suppression for studio-level raw sensitivity
      AGC: false, // Disable AGC to avoid dynamic squashing/level expansion
      encoderConfig: 'high_quality_stereo' as const
    };
  } else if (cfg.mode === 'voice') {
    return {
      AEC: true,
      ANS: true,
      AGC: true,
      encoderConfig: 'speech_standard' as const
    };
  } else {
    // Custom
    const encPreset: 'speech_standard' | 'music_standard' | 'high_quality' | 'high_quality_stereo' = cfg.profile;
    return {
      AEC: cfg.aec,
      ANS: cfg.ans,
      AGC: cfg.agc,
      encoderConfig: encPreset
    };
  }
}
