const path = require("path");

function bool(
  value,
  fallback = false
) {
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

function num(
  value,
  fallback
) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

const config = {
  port: num(
    process.env.PORT,
    8080
  ),

  discordToken:
    process.env.DISCORD_TOKEN,

  clientId:
    process.env.CLIENT_ID,

  guildId:
    process.env.GUILD_ID || "",

  ownerId:
    process.env.BOT_OWNER_ID || "",

  databasePath:
    path.resolve(
      process.env.DATABASE_PATH ||
      "./data/bot.sqlite"
    ),

  logLevel:
    process.env.LOG_LEVEL ||
    "info",

  prefix:
    process.env.COMMAND_PREFIX ||
    "!",

  customBotRoleId:
    process.env.CUSTOM_BOT_ROLE_ID ||
    "",

  ai: {
    provider:
      (
        process.env.AI_PROVIDER ||
        "none"
      ).toLowerCase(),

    key:
      process.env.AI_API_KEY ||
      "",

    model:
      process.env.AI_MODEL ||
      "llama-3.3-70b-versatile",

    baseUrl:
      process.env.AI_BASE_URL ||
      "",

    maxTokens:
      num(
        process.env.AI_MAX_TOKENS,
        1200
      ),

    temperature:
      num(
        process.env.AI_TEMPERATURE,
        0.7
      ),

    contextMessages:
      num(
        process.env.AI_CONTEXT_MESSAGES,
        8
      ),

    userCooldownMs:
      num(
        process.env.AI_USER_COOLDOWN_MS,
        8000
      ),

    guildEnabled:
      bool(
        process.env.AI_GUILD_ENABLED,
        true
      )
  },

  tts: {
    provider:
      (
        process.env.TTS_PROVIDER ||
        "edge"
      ).toLowerCase(),

    key:
      process.env.TTS_API_KEY ||
      "",

    defaultVoice:
      process.env.TTS_DEFAULT_VOICE ||
      "en-US-AndrewMultilingualNeural",

    maxChars:
      num(
        process.env.TTS_MAX_CHARS,
        1200
      ),

    userCooldownMs:
      num(
        process.env.TTS_USER_COOLDOWN_MS,
        4000
      )
  },

  dashboardEnabled:
    bool(
      process.env.DASHBOARD_ENABLED,
      true
    ),

  dashboardPublic:
    bool(
      process.env.DASHBOARD_PUBLIC,
      true
    ),

  maxMessageLength:
    num(
      process.env.MAX_MESSAGE_LENGTH,
      2000
    ),

  maxBulkDelete:
    Math.min(
      num(
        process.env.MAX_BULK_DELETE,
        100
      ),
      100
    ),

  allowMassMentions:
    bool(
      process.env.AI_ALLOW_MASS_MENTIONS,
      false
    ),

  autoRegister:
    bool(
      process.env.AUTO_REGISTER_COMMANDS,
      true
    ),

  statusText:
    process.env.STATUS_TEXT ||
    "Use /help | All-in-one AI Bot",

  lavalink: {
    host:
      process.env.LAVALINK_HOST ||
      "",

    port:
      num(
        process.env.LAVALINK_PORT,
        2333
      ),

    password:
      process.env.LAVALINK_PASSWORD ||
      "",

    nodeId:
      process.env.LAVALINK_NODE_ID ||
      "main",

    secure:
      bool(
        process.env.LAVALINK_SECURE,
        false
      ),

    searchPlatform:
      process.env.LAVALINK_SEARCH_PLATFORM ||
      "ytsearch"
  }
};

function validateStartup() {
  if (!config.discordToken) {
    throw new Error(
      "DISCORD_TOKEN is missing."
    );
  }

  if (!config.clientId) {
    throw new Error(
      "CLIENT_ID is missing."
    );
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
      `Unsupported AI_PROVIDER: ${config.ai.provider}`
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
