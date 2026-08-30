const dotenv = require("dotenv");

dotenv.config();

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

const config = {
  discordToken: process.env.DISCORD_TOKEN || "",
  clientId: process.env.CLIENT_ID || "",
  guildId: process.env.GUILD_ID || "",

  ownerId: process.env.BOT_OWNER_ID || "",

  statusText: process.env.STATUS_TEXT || "AI Assistant",

  port: numberEnv("PORT", 3000),

  databasePath:
    process.env.DATABASE_PATH || "./data/bot.sqlite",

  logLevel:
    process.env.LOG_LEVEL || "info",

  dashboardEnabled:
    String(process.env.DASHBOARD_ENABLED || "true").toLowerCase() === "true",

  autoRegister:
    String(process.env.AUTO_REGISTER_COMMANDS || "true").toLowerCase() === "true",

  customBotRoleId:
    process.env.CUSTOM_BOT_ROLE_ID || "",

  ai: {
    provider:
      String(process.env.AI_PROVIDER || "none").toLowerCase(),

    key:
      process.env.AI_API_KEY || "",

    model:
      process.env.AI_MODEL || "",

    contextMessages:
      numberEnv("AI_CONTEXT_MESSAGES", 12),

    temperature:
      numberEnv("AI_TEMPERATURE", 0.7),

    maxTokens:
      numberEnv("AI_MAX_TOKENS", 2048),

    userCooldownMs:
      numberEnv("AI_USER_COOLDOWN_MS", 5000),

    baseUrl:
      process.env.AI_BASE_URL || ""
  },

  tts: {
    provider:
      String(process.env.TTS_PROVIDER || "none").toLowerCase(),

    key:
      process.env.TTS_API_KEY || "",

    defaultVoice:
      process.env.TTS_DEFAULT_VOICE ||
      "en-US-AndrewMultilingualNeural",

    maxChars:
      numberEnv("TTS_MAX_CHARS", 1000),

    userCooldownMs:
      numberEnv("TTS_USER_COOLDOWN_MS", 3000)
  }
};

function validateStartup() {
  if (!config.discordToken) {
    throw new Error("DISCORD_TOKEN is missing.");
  }

  if (!config.clientId) {
    throw new Error("CLIENT_ID is missing.");
  }

  const allowedAI = [
    "none",
    "groq",
    "gemini",
    "openrouter"
  ];

  if (!allowedAI.includes(config.ai.provider)) {
    throw new Error(
      `Unsupported AI_PROVIDER: ${config.ai.provider}`
    );
  }

  const allowedTTS = [
    "none",
    "edge",
    "elevenlabs"
  ];

  if (!allowedTTS.includes(config.tts.provider)) {
    throw new Error(
      `Unsupported TTS_PROVIDER: ${config.tts.provider}`
    );
  }

  if (config.ai.contextMessages < 0) {
    throw new Error("AI_CONTEXT_MESSAGES must be >= 0.");
  }

  if (config.ai.maxTokens < 1) {
    throw new Error("AI_MAX_TOKENS must be >= 1.");
  }

  if (config.tts.maxChars < 1) {
    throw new Error("TTS_MAX_CHARS must be >= 1.");
  }
}

module.exports = {
  ...config,
  validateStartup
};
