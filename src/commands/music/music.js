const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const {
  spawn
} = require("child_process");

const ffmpeg =
  process.env.FFMPEG_PATH || "ffmpeg";

const sessions = new Map();

function requireMusicPermission(interaction) {
  return interaction.memberPermissions?.has(
    PermissionFlagsBits.Connect
  );
}

async function playUrl(interaction, url) {
  if (!requireMusicPermission(interaction)) {
    throw new Error(
      "You need permission to connect to voice channels."
    );
  }

  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "That is not a valid URL."
    );
  }

  if (
    !["https:", "http:"].includes(
      parsed.protocol
    )
  ) {
    throw new Error(
      "Only HTTP(S) media URLs are supported."
    );
  }

  const voiceChannel =
    interaction.member?.voice?.channel;

  if (!voiceChannel) {
    throw new Error(
      "Join a voice channel first."
    );
  }

  const old = sessions.get(
    interaction.guildId
  );

  if (old) {
    try {
      old.player.stop(true);
    } catch {}

    try {
      old.ff.kill("SIGKILL");
    } catch {}

    try {
      old.connection.destroy();
    } catch {}

    sessions.delete(
      interaction.guildId
    );
  }

  const connection =
    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guildId,
      adapterCreator:
        interaction.guild.voiceAdapterCreator,
      selfDeaf: true
    });

  const player =
    createAudioPlayer();

  connection.subscribe(player);

  const ff = spawn(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      parsed.toString(),
      "-f",
      "s16le",
      "-ar",
      "48000",
      "-ac",
      "2",
      "pipe:1"
    ],
    {
      stdio: [
        "ignore",
        "pipe",
        "pipe"
      ]
    }
  );

  ff.on(
    "error",
    error => {
      try {
        connection.destroy();
      } catch {}

      sessions.delete(
        interaction.guildId
      );
    }
  );

  ff.stderr.on(
    "data",
    () => {}
  );

  player.play(
    createAudioResource(
      ff.stdout,
      {
        inputType: "raw"
      }
    )
  );

  const session = {
    connection,
    player,
    ff,
    channelId: voiceChannel.id
  };

  sessions.set(
    interaction.guildId,
    session
  );

  player.once(
    AudioPlayerStatus.Idle,
    () => {
      try {
        ff.kill("SIGKILL");
      } catch {}

      try {
        connection.destroy();
      } catch {}

      sessions.delete(
        interaction.guildId
      );
    }
  );
}

function stopPlayback(guildId) {
  const session =
    sessions.get(guildId);

  if (!session) {
    return false;
  }

  try {
    session.player.stop(true);
  } catch {}

  try {
    session.ff.kill("SIGKILL");
  } catch {}

  try {
    session.connection.destroy();
  } catch {}

  sessions.delete(guildId);

  return true;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription(
      "Play direct audio/media URLs"
    )
    .addSubcommand(sub =>
      sub
        .setName("play")
        .setDescription(
          "Play a direct media URL"
        )
        .addStringOption(option =>
          option
            .setName("url")
            .setDescription(
              "HTTP(S) audio/media URL"
            )
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("stop")
        .setDescription(
          "Stop music"
        )
    ),

  async execute(interaction) {
    const subcommand =
      interaction.options.getSubcommand();

    try {
      if (
        subcommand === "play"
      ) {
        const url =
          interaction.options.getString(
            "url",
            true
          );

        await playUrl(
          interaction,
          url
        );

        return interaction.reply(
          "▶️ Playing the media URL."
        );
      }

      if (
        subcommand === "stop"
      ) {
        const stopped =
          stopPlayback(
            interaction.guildId
          );

        return interaction.reply(
          stopped
            ? "⏹️ Music stopped."
            : "ℹ️ Nothing is playing."
        );
      }

      return interaction.reply({
        content:
          "Unknown music action.",
        ephemeral: true
      });
    } catch (error) {
      return interaction.reply({
        content:
          `❌ ${error.message}`,
        ephemeral: true
      });
    }
  }
};
