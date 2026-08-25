/**
 * Voice Service Abstraction
 * 
 * Provides Speech-to-Text (STT), Text-to-Speech (TTS), and language detection.
 * Guardrails: Does NOT store raw voice recordings by default for privacy.
 */
export class VoiceProvider {
  async transcribeAudio(audioBuffer, mimeType, languageHint = 'auto') {
    throw new Error('transcribeAudio must be implemented');
  }

  async synthesizeSpeech(text, language = 'en', voiceGender = 'neutral') {
    throw new Error('synthesizeSpeech must be implemented');
  }

  async detectLanguage(textOrAudioSample) {
    throw new Error('detectLanguage must be implemented');
  }
}

export class MockVoiceProvider extends VoiceProvider {
  /**
   * Transcribes patient voice to text.
   * Returns { transcript, detectedLanguage, confidence }
   */
  async transcribeAudio(audioBuffer, mimeType, languageHint = 'en') {
    // Simulated STT responses based on language hint
    const transcripts = {
      en: 'I have had stomach pain and burning sensation since three days.',
      hi: 'मुझे पिछले तीन दिनों से पेट में तेज दर्द और जलन हो रही है।',
      mr: 'मला गेल्या तीन दिवसांपासून पोटात तीव्र दुखत आहे आणि जळजळ होत आहे.',
    };

    const transcript = transcripts[languageHint] || transcripts.en;

    return {
      transcript,
      detectedLanguage: languageHint === 'auto' ? 'en' : languageHint,
      confidence: 0.95,
      provider: 'MockVoiceProvider',
    };
  }

  /**
   * Synthesizes question text to speech.
   * In local/mock mode, returns audio format metadata. Client uses Web Speech API or generated audio.
   */
  async synthesizeSpeech(text, language = 'en', voiceGender = 'neutral') {
    return {
      audioUrl: null, // Client browser SpeechSynthesis fallback
      text,
      language,
      voiceGender,
      format: 'audio/mp3',
      useClientSynthesis: true,
    };
  }

  async detectLanguage(text) {
    if (!text) return 'en';
    // Devanagari script detection (Hindi / Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
      if (/आहे|नाही|आणि|होते|केले/.test(text)) return 'mr';
      return 'hi';
    }
    return 'en';
  }
}

export class VoiceService {
  constructor(provider = new MockVoiceProvider()) {
    this.provider = provider;
  }

  setProvider(provider) {
    this.provider = provider;
  }

  async transcribe(audioBuffer, mimeType, languageHint) {
    return this.provider.transcribeAudio(audioBuffer, mimeType, languageHint);
  }

  async synthesize(text, language, voiceGender) {
    return this.provider.synthesizeSpeech(text, language, voiceGender);
  }

  async detectLanguage(sample) {
    return this.provider.detectLanguage(sample);
  }
}

export default new VoiceService();
