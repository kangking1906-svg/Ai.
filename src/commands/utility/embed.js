const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Build an embed")

    .addSubcommand((s) =>
      s
        .setName("create")
        .setDescription("Create and send embed")

        // REQUIRED option MUST come first
        .addStringOption((o) =>
          o
            .setName("description")
            .setDescription("Description")
            .setRequired(true)
        )

        // Optional options come AFTER the required option
        .addStringOption((o) =>
          o
            .setName("title")
            .setDescription("Title")
        )

        .addStringOption((o) =>
          o
            .setName("color")
            .setDescription("Hex color, e.g. #5865F2")
        )

        .addStringOption((o) =>
          o
            .setName("footer")
            .setDescription("Footer")
        )

        .addStringOption((o) =>
          o
            .setName("image")
            .setDescription("Image URL")
        )

        .addStringOption((o) =>
          o
            .setName("thumbnail")
            .setDescription("Thumbnail URL")
        )
    ),

  async execute(interaction) {
    if (
      !interaction.memberPermissions.has(
        PermissionFlagsBits.ManageMessages
      )
    ) {
      return interaction.reply({
        content: "❌ Missing Manage Messages permission.",
        ephemeral: true,
      });
    }

    const options = interaction.options;

    const embed = new EmbedBuilder().setDescription(
      options.getString("description")
    );

    const title = options.getString("title");
    if (title) {
      embed.setTitle(title);
    }

    const footer = options.getString("footer");
    if (footer) {
      embed.setFooter({ text: footer });
    }

    const color = options.getString("color");
    if (color) {
      try {
        embed.setColor(parseInt(color.replace("#", ""), 16));
      } catch {
        // Ignore invalid color
      }
    }

    const image = options.getString("image");
    if (image) {
      embed.setImage(image);
    }

    const thumbnail = options.getString("thumbnail");
    if (thumbnail) {
      embed.setThumbnail(thumbnail);
    }

    await interaction.reply({
      content: "✅ Embed sent.",
      ephemeral: true,
    });

    return interaction.channel.send({
      embeds: [embed],
    });
  },
}
