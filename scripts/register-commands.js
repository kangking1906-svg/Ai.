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

walk(path.join(__dirname, "..", "src", "commands"));

const commands = [];

for (const file of files) {
  try {
    const command = require(file);

    if (!command.data) {
      console.log(`⚠️ SKIPPED: ${file} - no data`);
      continue;
    }

    const json = command.data.toJSON();

    console.log(`✅ Checking: ${file}`);
    console.log(`   Command: ${json.name}`);

    commands.push({
      file,
      json
    });
  } catch (error) {
    console.error(`❌ FAILED TO LOAD: ${file}`);
    console.error(error);
  }
}

async function register() {
  const rest = new REST({ version: "10" })
    .setToken(process.env.DISCORD_TOKEN);

  const body = [];

  for (const command of commands) {
    try {
      body.push(command.json);
    } catch (error) {
      console.error(`❌ Invalid command: ${command.file}`);
      console.error(error);
    }
  }

  console.log(`📦 Total commands: ${body.length}`);

  try {
    let result;

    if (process.env.GUILD_ID) {
      console.log("📍 Registering to guild:", process.env.GUILD_ID);

      result = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body }
      );
    } else {
      console.log("🌍 Registering globally");

      result = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body }
      );
    }

    console.log(`✅ Successfully registered ${result.length} commands.`);
  } catch (error) {
    console.error("❌ DISCORD COMMAND REGISTRATION FAILED");
    console.error(error);

    if (error.rawError?.errors) {
      console.error(
        JSON.stringify(error.rawError.errors, null, 2)
      );
    }

    process.exit(1);
  }
}

register();
