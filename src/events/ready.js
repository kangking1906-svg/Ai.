const { Events, ActivityType } = require("discord.js");
const config = require("../config");
const { logger } = require("../utils/logger");

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    const statusText =
      typeof config.statusText === "string" && config.statusText.trim()
        ? config.statusText
        : "AI Assistant";

    client.user.setPresence({
      activities: [
        {
          name: statusText,
          type: ActivityType.Watching
        }
      ],
      status: "online"
    });

    logger.info(`Logged in as ${client.user.tag}`);
  }
};
