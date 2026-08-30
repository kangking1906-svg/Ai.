const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const { getLavalink } = require("../../services/lavalink");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("🎵 Lavalink music player")

    .addSubcommand(sub =>
      sub
        .setName("play")
        .setDescription("Play or search for a song")
        .addStringOption(option =>
          option
            .setName("query")
            .setDescription("Song name, YouTube URL, or other supported URL")
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
        .setDescription("Stop music and leave the voice channel")
    )

    .addSubcommand(sub =>
      sub
        .setName("queue")
        .setDescription("Show the current music queue")
    )

    .addSubcommand(sub =>
      sub
        .setName("volume")
        .setDescription("Change the music volume")
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
          content:
            "❌ Lavalink is not initialized. Check your Lavalink configuration.",
          ephemeral: true
        });
      }

      if (!manager.useable) {
        return interaction.reply({
          content:
            "❌ No Lavalink node is connected.\n\nCheck:\n• LAVALINK_HOST\n• LAVALINK_PORT\n• LAVALINK_PASSWORD\n• LAVALINK_SECURE",
          ephemeral: true
        });
      }

      const subcommand = interaction.options.getSubcommand();

      /*
       * PLAY
       */
      if (subcommand === "play") {
        const voiceChannel = interaction.member?.voice?.channel;

        if (!voiceChannel) {
          return interaction.reply({
            content: "❌ Join a voice channel first.",
            ephemeral: true
          });
        }

        await interaction.deferReply();

        const query = interaction.options.getString("query", true);

        let player = manager.getPlayer(interaction.guildId);

        /*
         * Create player if this guild doesn't have one.
         */
        if (!player) {
          player = await manager.createPlayer({
            guildId: interaction.guildId,
            voiceChannelId: voiceChannel.id,
            textChannelId: interaction.channelId,
            selfDeaf: true,
            selfMute: false,
            volume: 100
          });
        }

        /*
         * If the bot is in another voice channel,
         * move the Lavalink player to the user's channel.
         */
        if (player.voiceChannelId !== voiceChannel.id) {
          try {
            await player.disconnect();
          } catch (_) {}

          player.options.voiceChannelId = voiceChannel.id;

          await player.connect();
        }

        /*
         * Make sure the player is
