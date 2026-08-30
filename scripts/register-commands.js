require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  REST,
  Routes
} = require("discord.js");

const files = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      walk(fullPath);
    } else if (item.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
}

// Sort files so the order is always predictable
files.sort();

walk(path.join(__dirname, "..", "src", "commands"));

// Discord requires required options BEFORE optional options.
// Fix this automatically at every level.
function fixOptions(options) {
  if (!Array.isArray(options)) return options;

  const fixed = options.map(option => {
    const copy = { ...option };

    if (Array.isArray(copy.options)) {
      copy.options = fixOptions(copy.options);
    }

    return copy;
  });

  fixed.sort((a, b) => {
    const aRequired = a.required === true;
    const bRequired = b.required === true;

    if (aRequired && !bRequired) return -1;
    if (!aRequired && bRequired) return 1;

    return 0;
  });

  return fixed;
}

const commands = [];

for (const file of files) {
  try {
    const command = require(file);

    if (!command.data) {
      console.log(`⚠️ Skipping ${file}: no data`);
      continue;
    }

    const json = command.data.toJSON();

    if (Array.isArray(json.options)) {
      json.options = fixOptions(json.options);
    }

    console.log(`✅ Command: ${json.name} ← ${file}`);

    commands.push(json);

  } catch (error) {
    console.error(`❌ Failed to load: ${file}`);
    console.error(error);
  }
}

async function register() {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN is missing.");
  }

  if (!process.env.CLIENT_ID) {
    throw new Error("CLIENT_ID is missing.");
  }

  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  console.log(`📦 Registering ${commands.length} commands...`);

  if (process.env.GUILD_ID) {
    console.log(`📍 Guild: ${process.env.GUILD_ID}`);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands
      }
    );
  } else {
    console.log("🌍 Registering globally...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands
      }
    );
  }

  console.log(`✅ Successfully registered ${commands.length} commands!`);
}

register().catch(error => {
  console.error("❌ COMMAND REGISTRATION FAILED");
  console.error(error);

  if (error.rawError?.errors) {
    console.error(
      JSON.stringify(error.rawError.errors, null, 2)
    );
  }

  process.exit(1);
});
