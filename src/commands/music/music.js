const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const {
  getLavalink
} = require("../../services/lavalink");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Lavalink music player")

    .addSubcommand(sub =>
      sub
        .setName("play")
        .setDescription("Play a song or search for a song")
        .addStringOption(option =>
          option
            .setName("query")
            .setDescription("Song name or URL")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("pause")
        .setDescription("Pause the current song")
    )

    .addSubcommand(sub =>
      sub
        .setName("resume")
        .setDescription("Resume the current song")
    )

    .addSubcommand(sub =>
      sub
        .setName("skip")
        .setDescription("Skip the current song")
    )

    .addSubcommand(sub =>
      sub
        .setName("stop")
        .setDescription("Stop music and leave voice")
    )

    .addSubcommand(sub =>
      sub
        .setName("queue")
        .setDescription("Show the music queue")
    )

    .addSubcommand(sub =>
      sub
        .setName("volume")
        .setDescription("Change music volume")
        .addIntegerOption(option =>
          option
            .setName("amount")
            .setDescription("Volume from 1 to 100")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    try {
      const manager = getLavalink();

      if (!manager) {
        return interaction.reply({
          content: "❌ Lavalink is not initialized.",
          ephemeral: true
        });
      }

      if (!manager.useable) {
        return interaction.reply({
          content:
            "❌ No Lavalink node is connected. Check LAVALINK_HOST, LAVALINK_PORT and LAVALINK_PASSWORD.",
          ephemeral: true
        });
      }

      const subcommand = interaction.options.getSubcommand();

      if (subcommand === "play") {
        const voiceChannel = interaction.member?.voice?.channel;

        if (!voiceChannel) {
          return interaction.reply({
            content: "❌ Join a voice channel first.",
            ephemeral: true
          });
        }

        await interaction.deferReply();

        let player = manager.getPlayer(interaction.guildId);

        if (!player) {
          player = await manager.createPlayer({
            guildId: interaction.guildId,
            voiceChannelId: voiceChannel.id,
            textChannelId: interaction.channelId,
            selfDeaf: true,
            selfMute: false,
            volume: 100
          });
        } else if (player.voiceChannelId !== voiceChannel.id) {
          await player.disconnect();
          player.options.voiceChannelId = voiceChannel.id;
          await player.connect();
        }

        if (!player.connected) {
          await player.connect();
        }

        const query = interaction.options.getString("query");

        const result = await player.search(
          {
            query
          },
          interaction.user
        );

        if (!result || !result.tracks || result.tracks.length === 0) {
          return interaction.editReply(
            "❌ I couldn't find that song."
          );
        }

        const track = result.tracks[0];

        await player.queue.add(track);

        if (!player.playing) {
          await player.play();
        }

        const title =
          track.info?.title ||
          track.info?.uri ||
          "Unknown song";

        const author =
          track.info?.author ||
          "Unknown artist";

        const embed = new EmbedBuilder()
          .setTitle("🎵 Added to queue")
          .setDescription(`**${title}**`)
          .addFields({
            name: "Artist",
            value: author,
            inline: true
          })
          .setFooter({
            text: `Requested by ${interaction.user.username}`
          });

        return interaction.editReply({
          embeds: [embed]
        });
      }

      const player = manager.getPlayer(interaction.guildId);

      if (!player) {
        return interaction.reply({
          content: "❌ Nothing is playing.",
          ephemeral: true
        });
      }

      if (subcommand === "pause") {
        await player.pause();

        return interaction.reply("⏸️ Paused.");
      }

      if (subcommand === "resume") {
        await player.resume();

        return interaction.reply("▶️ Resumed.");
      }

      if (subcommand === "skip") {
        await player.skip();

        return interaction.reply("⏭️ Skipped.");
      }

      if (subcommand === "stop") {
        await player.disconnect();

        return interaction.reply("⏹️ Music stopped.");
      }

      if (subcommand === "volume") {
        const amount = interaction.options.getInteger("amount");

        await player.setVolume(amount);

        return interaction.reply(
          `🔊 Volume set to **${amount}%**.`
        );
      }

      if (subcommand === "queue") {
        const tracks = player.queue?.tracks || [];

        if (!tracks.length) {
          return interaction.reply("🎵 The queue is empty.");
        }

        const list = tracks
          .slice(0, 10)
          .map(
            (track, index) =>
              `**${index + 1}.** ${track.info?.title || "Unknown"}`
          )
          .join("\n");

        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("🎵 Music Queue")
              .setDescription(list)
              .setFooter({
                text:
                  tracks.length > 10
                    ? `Showing 10 of ${tracks.length} songs`
                    : `${tracks.length} song(s)`
              })
          ]
        });
      }

      return interaction.reply({
        content: "❌ Unknown music command.",
        ephemeral: true
      });
    } catch (error) {
      console.error("Music command error:", error);

      const message =
        error?.message ||
        "An unknown music error occurred.";

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply(`❌ ${message}`);
      }

      return interaction.reply({
        content: `❌ ${message}`,
        ephemeral: true
      });
    }
  }
};
