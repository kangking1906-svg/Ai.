require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  Events
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
  createLavalinkManager
} = require("./src/services/lavalink");

async function main() {
  config.validateStartup();

  initDatabase();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildModeration
    ],

    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember
    ]
  });

  client.commands = new Collection();

  /*
   * Lavalink
   */
  client.lavalink = createLavalinkManager(client);

  /*
   * Forward Discord gateway packets to Lavalink.
   */
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

  /*
   * Initialize Lavalink after Discord is ready.
   */
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

        logger.info("Lavalink manager initialized.");
      }
    } catch (error) {
      logger.error("Lavalink initialization failed", error);
    }
  });

  /*
   * Load commands.
   */
  await loadCommands(client);

  /*
   * Load events.
   */
  loadEvents(client);

  /*
   * HTTP server for Railway.
   */
  const app = express();

  app.disable("x-powered-by");

  app.get("/health", (_req, res) => {
    res.status(200).json({
      ok: true,
      uptime: process.uptime(),
      discordReady: client.isReady(),
      guilds: client.guilds.cache.size,
      lavalink: getLavalinkStatus(client),
      timestamp: new Date().toISOString()
    });
  });

  app.get("/", (_req, res) => {
    res.status(200).send("Discord AI Bot is online.");
  });

  if (config.dashboardEnabled) {
    createDashboard(app, client);
  }

  const port = Number(process.env.PORT || config.port || 8080);

  app.listen(
    port,
    "0.0.0.0",
    () => {
      logger.info(`HTTP on 0.0.0.0:${port}`);
    }
  );

  /*
   * Discord login.
   */
  await client.login(config.discordToken);

  /*
   * Register slash commands.
   */
  try {
    await registerSlashCommands(client);
  } catch (error) {
    logger.error("DISCORD COMMAND REGISTRATION FAILED", error);
  }

  /*
   * Start schedulers.
   */
  startSchedulers(client);

  /*
   * Graceful shutdown.
   */
  const shutdown = async () => {
    logger.info("Shutting down...");

    try {
      stopSchedulers();
    } catch {}

    try {
      if (client.lavalink) {
        const players = client.lavalink.players;

        if (players && typeof players.values === "function") {
          for (const player of players.values()) {
            try {
              await player.destroy();
            } catch {}
          }
        }
      }
    } catch {}

    try {
      client.destroy();
    } catch {}

    try {
      closeDatabase();
    } catch {}

    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

function getLavalinkStatus(client) {
  try {
    if (!client.lavalink) {
      return "not-created";
    }

    const nodes =
      client.lavalink.nodeManager?.nodes;

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
  } catch {
    return "unknown";
  }
}

process.on("uncaughtException", error => {
  console.error("UNCAUGHT EXCEPTION:", error);
});

process.on("unhandledRejection", error => {
  console.error("UNHANDLED REJECTION:", error);
});

main().catch(error => {
  console.error("FATAL STARTUP ERROR:", error);
  process.exit(1);
});
