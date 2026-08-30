const { LavalinkManager } = require("lavalink-client");

let manager = null;

function createLavalink(client) {
  if (manager) {
    return manager;
  }

  const host = process.env.LAVALINK_HOST;
  const port = Number(process.env.LAVALINK_PORT || 2333);
  const password = process.env.LAVALINK_PASSWORD;
  const secure =
    String(process.env.LAVALINK_SECURE || "false").toLowerCase() ===
    "true";

  if (!host) {
    console.warn(
      "[Lavalink] LAVALINK_HOST is missing. Music will be unavailable."
    );
    return null;
  }

  if (!password) {
    console.warn(
      "[Lavalink] LAVALINK_PASSWORD is missing. Music will be unavailable."
    );
    return null;
  }

  manager = new LavalinkManager({
    nodes: [
      {
        id: process.env.LAVALINK_NAME || "main",
        host,
        port,
        authorization: password,
        secure,
        retryAmount: 5,
        retryDelay: 10000
      }
    ],

    sendToShard: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);

      if (!guild) return;

      guild.shard.send(payload);
    },

    client: {
      id: client.user?.id || process.env.CLIENT_ID,
      username: client.user?.username || "Discord Bot"
    },

    autoSkip: true,

    playerOptions: {
      defaultSearchPlatform:
        process.env.LAVALINK_SEARCH_PLATFORM || "ytmsearch",

      clientBasedPositionUpdateInterval: 150,

      onDisconnect: {
        autoReconnect: true,
        destroyPlayer: false
      },

      onEmptyQueue: {
        destroyAfterMs: 30000
      }
    },

    queueOptions: {
      maxPreviousTracks: 25
    }
  });

  manager.on("nodeConnect", node => {
    console.log(
      `[Lavalink] Node connected: ${node?.id || "unknown"}`
    );
  });

  manager.on("nodeError", (node, error) => {
    console.error(
      `[Lavalink] Node error: ${node?.id || "unknown"}`,
      error
    );
  });

  manager.on("trackStart", (player, track) => {
    console.log(
      `[Lavalink] Playing: ${
        track?.info?.title || "Unknown track"
      }`
    );
  });

  manager.on("trackEnd", (player, track) => {
    console.log(
      `[Lavalink] Finished: ${
        track?.info?.title || "Unknown track"
      }`
    );
  });

  manager.on("trackError", (player, track, payload) => {
    console.error(
      "[Lavalink] Track error:",
      payload
    );
  });

  manager.on("queueEnd", player => {
    console.log(
      `[Lavalink] Queue ended for ${player.guildId}`
    );
  });

  return manager;
}

function getLavalink() {
  return manager;
}

module.exports = {
  createLavalink,
  getLavalink
};
