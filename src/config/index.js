const dotenv = require("dotenv");

dotenv.config();

const config = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || "",

  ownerId: process.env.BOT_OWNER_ID || "",

  port: Number(process.env.PORT || 3000),

  databasePath:
    process.env.DATABASE_PATH || "./data/bot.sqlite",

  logLevel:
    process.env.LOG_LEVEL || "info",

  ai: {
    provider:
      (process.env.AI_PROVIDER || "none").toLowerCase(),

    apiKey:
      process.env.AI_API_KEY || "",

    model:
      process.env.AI_MODEL || ""
  },

  tts: {
    provider:
      (process.env.TTS_PROVIDER || "none").toLowerCase(),

    apiKey:
      process.env.TTS_API_KEY || "",

    voice:
      process.env.TTS_DEFAULT_VOICE ||
      "en-US-AndrewMultilingualNeural"
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
}

module.exports = {
  ...config,
  validateStartup
};
