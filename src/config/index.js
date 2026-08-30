const path = require("path");

function bool(value, fallback = false) {
  if (value == null) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on"
  ].includes(
    String(value).toLowerCase()
  );
}

function num(value, fallback) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

const config = {
  // Core Discord settings
  port: num(process.env.PORT, 8080),
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || "",
  ownerId: process.env.BOT_OWNER_ID || "",

  // Database
  databasePath: path.resolve(
    process.env.DATABASE_PATH ||
    "./data/bot.sqlite"
  ),

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
  prefix: process.env.COMMAND_PREFIX || "!",
  statusText: process.env.STATUS_TEXT ||
    "✨ /help | All-in-One AI Bot",

  // Custom roles
  customBotRoleId: process.env.CUSTOM_BOT_ROLE_ID || "",

  // AI Configuration
  ai: {
    provider: (
      process.env.AI_PROVIDER ||
      "none"
    ).toLowerCase(),

    key: process.env.AI_API_KEY || "",

    model: process.env.AI_MODEL ||
      "llama-3.3-70b-versatile",

    baseUrl: process.env.AI_BASE_URL || "",

    maxTokens: num(
      process.env.AI_MAX_TOKENS,
      2000
    ),

    temperature: num(
      process.env.AI_TEMPERATURE,
      0.7
    ),

    contextMessages: num(
      process.env.AI_CONTEXT_MESSAGES,
      10
    ),

    userCooldownMs: num(
      process.env.AI_USER_COOLDOWN_MS,
      3000
    ),

    guildEnabled: bool(
      process.env.AI_GUILD_ENABLED,
      true
    ),

    systemPrompt: process.env.AI_SYSTEM_PROMPT ||
      "You are a helpful Discord bot assistant. Be friendly, concise, and helpful."
  },

  // TTS Configuration
  tts: {
    provider: (
      process.env.TTS_PROVIDER ||
      "edge"
    ).toLowerCase(),

    key: process.env.TTS_API_KEY || "",

    defaultVoice: process.env.TTS_DEFAULT_VOICE ||
      "en-US-AriaNeural",

    maxChars: num(
      process.env.TTS_MAX_CHARS,
      2000
    ),

    userCooldownMs: num(
      process.env.TTS_USER_COOLDOWN_MS,
      2000
    )
  },

  // Dashboard
  dashboardEnabled: bool(
    process.env.DASHBOARD_ENABLED,
    true
  ),

  dashboardPublic: bool(
    process.env.DASHBOARD_PUBLIC,
    true
  ),

  // Message settings
  maxMessageLength: num(
    process.env.MAX_MESSAGE_LENGTH,
    2000
  ),

  maxBulkDelete: Math.min(
    num(process.env.MAX_BULK_DELETE, 100),
    100
  ),

  allowMassMentions: bool(
    process.env.AI_ALLOW_MASS_MENTIONS,
    false
  ),

  // Command settings
  autoRegister: bool(
    process.env.AUTO_REGISTER_COMMANDS,
    true
  ),

  // Lavalink Configuration
  lavalink: {
    host: process.env.LAVALINK_HOST || "",
    port: num(process.env.LAVALINK_PORT, 2333),
    password: process.env.LAVALINK_PASSWORD || "",
    nodeId: process.env.LAVALINK_NODE_ID || "main",
    secure: bool(process.env.LAVALINK_SECURE, false),
    searchPlatform: process.env.LAVALINK_SEARCH_PLATFORM || "ytsearch"
  },

  // Rate limiting
  rateLimits: {
    commands: num(process.env.RATE_LIMIT_COMMANDS, 3),
    commandWindow: num(process.env.RATE_LIMIT_WINDOW, 5000),
    aiRequests: num(process.env.RATE_LIMIT_AI, 2),
    aiWindow: num(process.env.RATE_LIMIT_AI_WINDOW, 10000)
  },

  // Features
  features: {
    aiEnabled: bool(process.env.FEATURE_AI, true),
    musicEnabled: bool(process.env.FEATURE_MUSIC, true),
    ttsEnabled: bool(process.env.FEATURE_TTS, true),
    moderationEnabled: bool(process.env.FEATURE_MODERATION, true),
    economyEnabled: bool(process.env.FEATURE_ECONOMY, true),
    levelsEnabled: bool(process.env.FEATURE_LEVELS, true),
    ticketsEnabled: bool(process.env.FEATURE_TICKETS, true),
    giveawaysEnabled: bool(process.env.FEATURE_GIVEAWAYS, true)
  }
};

function validateStartup() {
  if (!config.discordToken) {
    throw new Error("❌ DISCORD_TOKEN is missing.");
  }

  if (!config.clientId) {
    throw new Error("❌ CLIENT_ID is missing.");
  }

  const allowedAI = [
    "none",
    "groq",
    "gemini",
    "openrouter"
  ];

  if (
    !allowedAI.includes(
      config.ai.provider
    )
  ) {
    throw new Error(
      `❌ Unsupported AI_PROVIDER: ${config.ai.provider}. Allowed: ${allowedAI.join(", ")}`
    );
  }

  const allowedTTS = [
    "none",
    "edge",
    "elevenlabs"
  ];

  if (
    !allowedTTS.includes(
      config.tts.provider
    )
  ) {
    throw new Error(
      `❌ Unsupported TTS_PROVIDER: ${config.tts.provider}. Allowed: ${allowedTTS.join(", ")}`
    );
  }

  if (config.ai.contextMessages < 0) {
    throw new Error("❌ AI_CONTEXT_MESSAGES must be >= 0.");
  }

  if (config.ai.maxTokens < 1) {
    throw new Error("❌ AI_MAX_TOKENS must be >= 1.");
  }

  if (config.tts.maxChars < 1) {
    throw new Error("❌ TTS_MAX_CHARS must be >= 1.");
  }

  if (config.ai.temperature < 0 || config.ai.temperature > 1) {
    throw new Error("❌ AI_TEMPERATURE must be between 0 and 1.");
  }
}

module.exports = {
  ...config,
  validateStartup
};