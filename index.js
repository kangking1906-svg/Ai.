require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events,
  ActivityType
} = require("discord.js");

const express = require("express");
const config = require("./src/config");

const {
  initDatabase,
  closeDatabase
} = require("./src/database");

const {
  loadCommands,
  registerSlashCommands
} = require("./src/utils/command-loader");

const {
  loadEvents
} = require("./src/utils/event-loader");

const {
  logger
} = require("./src/utils/logger");

const {
  startSchedulers,
  stopSchedulers
} = require("./src/services/scheduler");

const {
  createDashboard
} = require("./src/web/dashboard");

const {
  createLavalink
} = require("./src/services/lavalink");

async function main() {
  try {
    config.validateStartup();
    logger.info("🚀 Initializing Discord AI Bot...");

    initDatabase();
    logger.info("📊 Database initialized successfully");

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.DirectMessages
      ],

      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
      ]
    });

    client.commands = new Collection();
    client.cooldowns = new Collection();
    client.blacklist = new Set();

    logger.info("🎵 Initializing Lavalink manager...");
    client.lavalink = createLavalink(client);

    // Forward Discord gateway packets to Lavalink
    client.on("raw", packet => {
      try {
        if (
          client.lavalink &&
          typeof client.lavalink.sendRawData === "function"
        ) {
          client.lavalink.sendRawData(packet);
        }
      } catch (error) {
        logger.error("Lavalink raw packet error", error);
      }
    });

    // Initialize Lavalink after Discord is ready
    client.once(Events.ClientReady, async readyClient => {
      try {
        if (
          client.lavalink &&
          typeof client.lavalink.init === "function"
        ) {
          await client.lavalink.init({
            id: readyClient.user.id,
            username: readyClient.user.username
          });

          logger.info("✅ Lavalink manager initialized successfully");
        }

        // Set bot status
        readyClient.user.setActivity({
          name: config.statusText,
          type: ActivityType.Watching
        });
      } catch (error) {
        logger.error("Lavalink initialization failed", error);
      }
    });

    // Load commands
    logger.info("📂 Loading commands...");
    await loadCommands(client);

    // Load events
    logger.info("📡 Loading events...");
    loadEvents(client);

    // HTTP server
    const app = express();
    app.disable("x-powered-by");

    app.get("/health", (_req, res) => {
      res.status(200).json({
        ok: true,
        uptime: process.uptime(),
        discordReady: client.isReady(),
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        lavalink: getLavalinkStatus(client),
        timestamp: new Date().toISOString(),
        version: require('./package.json').version
      });
    });

    app.get("/", (_req, res) => {
      res.status(200).json({
        name: "All-in-One Discord AI Bot",
        status: "online",
        message: "Discord AI Bot is running smoothly! 🚀"
      });
    });

    if (config.dashboardEnabled) {
      logger.info("🖥️ Initializing dashboard...");
      createDashboard(app, client);
    }

    const port = Number(process.env.PORT || config.port || 8080);

    app.listen(port, "0.0.0.0", () => {
      logger.info(`🌐 HTTP server running on 0.0.0.0:${port}`);
    });

    // Discord login
    logger.info("🔐 Connecting to Discord...");
    await client.login(config.discordToken);

    // Register slash commands
    try {
      logger.info("📝 Registering slash commands...");
      await registerSlashCommands(client);
      logger.info("✅ Slash commands registered successfully");
    } catch (error) {
      logger.error("DISCORD COMMAND REGISTRATION FAILED", error);
    }

    // Start schedulers
    logger.info("⏱️ Starting background schedulers...");
    startSchedulers(client);
    logger.info("✅ All systems initialized successfully!");

    // Graceful shutdown
    const shutdown = async () => {
      logger.warn("🛑 Shutting down gracefully...");

      try {
        stopSchedulers();
      } catch (e) {
        logger.error("Error stopping schedulers", e);
      }

      try {
        if (client.lavalink) {
          const players = client.lavalink.players;

          if (players && typeof players.values === "function") {
            for (const player of players.values()) {
              try {
                await player.destroy();
              } catch (e) {
                logger.error("Error destroying player", e);
              }
            }
          }
        }
      } catch (e) {
        logger.error("Error cleaning up Lavalink", e);
      }

      try {
        client.destroy();
      } catch (e) {
        logger.error("Error destroying client", e);
      }

      try {
        closeDatabase();
      } catch (e) {
        logger.error("Error closing database", e);
      }

      logger.info("✅ Shutdown complete!");
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("FATAL STARTUP ERROR", error);
    process.exit(1);
  }
}

function getLavalinkStatus(client) {
  try {
    if (!client.lavalink) {
      return "not-created";
    }

    const nodes = client.lavalink.nodeManager?.nodes;

    if (!nodes) {
      return "created";
    }

    const nodeList =
      typeof nodes.values === "function"
        ? [...nodes.values()]
        : [];

    if (!nodeList.length) {
      return "no-nodes";
    }

    return nodeList.some(node =>
      node.connected === true ||
      node.isConnected === true
    )
      ? "connected"
      : "disconnected";
  } catch (error) {
    logger.error("Error getting Lavalink status", error);
    return "unknown";
  }
}

process.on("uncaughtException", error => {
  logger.error("UNCAUGHT EXCEPTION", error);
  process.exit(1);
});

process.on("unhandledRejection", error => {
  logger.error("UNHANDLED REJECTION", error);
});

main().catch(error => {
  console.error("FATAL STARTUP ERROR:", error);
  process.exit(1);
});
