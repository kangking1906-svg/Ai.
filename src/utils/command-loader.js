const fs = require("fs");
const path = require("path");

const {
  REST,
  Routes
} = require("discord.js");

const config = require("../config");
const { logger } = require("./logger");

function walk(dir) {
  return fs
    .readdirSync(dir, {
      withFileTypes: true
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    )
    .flatMap(entry => {
      const fullPath = path.join(
        dir,
        entry.name
      );

      if (entry.isDirectory()) {
        return walk(fullPath);
      }

      return entry.name.endsWith(".js")
        ? [fullPath]
        : [];
    });
}

function fixOptions(options) {
  if (!Array.isArray(options)) {
    return options;
  }

  const fixed = options.map(option => {
    const copy = {
      ...option
    };

    if (Array.isArray(copy.options)) {
      copy.options = fixOptions(
        copy.options
      );
    }

    return copy;
  });

  fixed.sort((a, b) => {
    if (
      a.required === true &&
      b.required !== true
    ) {
      return -1;
    }

    if (
      a.required !== true &&
      b.required === true
    ) {
      return 1;
    }

    return 0;
  });

  return fixed;
}

async function loadCommands(client) {
  const commandDir = path.join(
    __dirname,
    "..",
    "commands"
  );

  for (const file of walk(commandDir)) {
    try {
      delete require.cache[
        require.resolve(file)
      ];

      const command = require(file);

      if (!command.data) {
        throw new Error(
          "Command must export data."
        );
      }

      if (
        typeof command.execute !== "function"
      ) {
        throw new Error(
          "Command must export execute()."
        );
      }

      client.commands.set(
        command.data.name,
        command
      );
    } catch (error) {
      logger.error(
        `Failed to load command ${file}`,
        error
      );
    }
  }

  logger.info(
    `Loaded ${client.commands.size} commands`
  );
}

async function registerSlashCommands(client) {
  if (!config.autoRegister) {
    logger.info(
      "Automatic slash-command registration is disabled."
    );
    return;
  }

  const rest = new REST({
    version: "10"
  }).setToken(
    config.discordToken
  );

  const body = [
    ...client.commands.values()
  ].map(command => {
    const json =
      command.data.toJSON();

    if (Array.isArray(json.options)) {
      json.options =
        fixOptions(json.options);
    }

    return json;
  });

  if (config.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(
        config.clientId,
        config.guildId
      ),
      {
        body
      }
    );

    logger.info(
      `Registered ${body.length} guild slash commands`
    );
  } else {
    await rest.put(
      Routes.applicationCommands(
        config.clientId
      ),
      {
        body
      }
    );

    logger.info(
      `Registered ${body.length} global slash commands`
    );
  }
}

module.exports = {
  loadCommands,
  registerSlashCommands
};
