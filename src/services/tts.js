const { logger } = require('../utils/logger');

class TTSService {
  constructor(config) {
    this.config = config;
    this.provider = config.tts.provider;
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.provider === 'none') {
      logger.warning('TTS is disabled (TTS_PROVIDER=none)');
      return;
    }

    try {
      if (this.provider === 'elevenlabs' && !this.config.tts.key) {
        throw new Error('TTS_API_KEY is required for elevenlabs');
      }
      this.initialized = true;
      logger.success(`TTS Service initialized with ${this.provider}`);
    } catch (error) {
      logger.error('Failed to initialize TTS Service', error);
    }
  }

  async synthesize(text, voiceName = null) {
    if (!this.initialized) {
      throw new Error('TTS Service is not initialized');
    }

    const voice = voiceName || this.config.tts.defaultVoice;

    try {
      if (text.length > this.config.tts.maxChars) {
        throw new Error(`Text exceeds maximum length of ${this.config.tts.maxChars} characters`);
      }

      if (this.provider === 'edge') {
        return await this.synthesizeEdge(text, voice);
      } else if (this.provider === 'elevenlabs') {
        return await this.synthesizeElevenLabs(text, voice);
      }

      throw new Error(`Unknown TTS provider: ${this.provider}`);
    } catch (error) {
      logger.error('TTS Synthesis Error', error);
      throw error;
    }
  }

  async synthesizeEdge(text, voice) {
    // Implementation for Microsoft Edge TTS
    logger.debug(`Edge TTS: "${text}" with voice ${voice}`);
    // This would use node-edge-tts package
    return Buffer.from('audio-data');
  }

  async synthesizeElevenLabs(text, voice) {
    // Implementation for ElevenLabs
    logger.debug(`ElevenLabs TTS: "${text}" with voice ${voice}`);
    // This would use ElevenLabs API
    return Buffer.from('audio-data');
  }

  isEnabled() {
    return this.initialized;
  }

  getAvailableVoices() {
    const voices = {
      edge: ['en-US-AriaNeural', 'en-US-GuyNeural', 'en-US-JennyNeural'],
      elevenlabs: ['Rachel', 'Domi', 'Bella', 'Antoni', 'Elli']
    };
    return voices[this.provider] || [];
  }
}

module.exports = { TTSService };