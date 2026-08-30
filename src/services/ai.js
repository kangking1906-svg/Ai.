const { logger } = require('../utils/logger');

class AIService {
  constructor(config) {
    this.config = config;
    this.provider = config.ai.provider;
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.provider === 'none') {
      logger.warning('AI is disabled (AI_PROVIDER=none)');
      return;
    }

    try {
      if (!this.config.ai.key) {
        throw new Error(`AI_API_KEY is required for ${this.provider}`);
      }
      this.initialized = true;
      logger.success(`AI Service initialized with ${this.provider}`);
    } catch (error) {
      logger.error('Failed to initialize AI Service', error);
    }
  }

  async chat(messages, systemPrompt = null) {
    if (!this.initialized) {
      throw new Error('AI Service is not initialized');
    }

    try {
      const prompt = systemPrompt || this.config.ai.systemPrompt;
      
      if (this.provider === 'groq') {
        return await this.chatGroq(messages, prompt);
      } else if (this.provider === 'gemini') {
        return await this.chatGemini(messages, prompt);
      } else if (this.provider === 'openrouter') {
        return await this.chatOpenRouter(messages, prompt);
      }
      
      throw new Error(`Unknown AI provider: ${this.provider}`);
    } catch (error) {
      logger.error('AI Chat Error', error);
      throw error;
    }
  }

  async chatGroq(messages, systemPrompt) {
    // Implementation for Groq API
    logger.debug('Calling Groq API...');
    // This would use fetch to call Groq's OpenAI-compatible endpoint
    return 'AI response from Groq';
  }

  async chatGemini(messages, systemPrompt) {
    // Implementation for Google Gemini
    logger.debug('Calling Gemini API...');
    // This would use fetch to call Google's Gemini API
    return 'AI response from Gemini';
  }

  async chatOpenRouter(messages, systemPrompt) {
    // Implementation for OpenRouter
    logger.debug('Calling OpenRouter API...');
    // This would use fetch to call OpenRouter's API
    return 'AI response from OpenRouter';
  }

  isEnabled() {
    return this.initialized;
  }
}

module.exports = { AIService };