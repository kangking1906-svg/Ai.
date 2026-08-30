const {
  Events,
  ActivityType
} = require("discord.js");

const config =
  require("../config");

const {
  logger
} = require("../utils/logger");

module.exports = {
  name: Events.ClientReady,

  once: true,

  execute(client) {
    try {
      client.user.setPresence({
        activities: [
          {
            name:
              String(
                config.statusText ||
                "All-in-one AI Bot"
              ),

            type:
              ActivityType.Watching
          }
        ],

        status: "online"
      });

      logger.info(
        `Logged in as ${client.user.tag}`
      );
    } catch (error) {
      logger.error(
        "Failed to set Discord presence",
        error
      );
    }
  }
};
