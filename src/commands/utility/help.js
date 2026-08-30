const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const groups = {
  AI: '`/ai` — Chat with AI',
  Music: '`/music play` — Play music\n`/music pause` — Pause\n`/music resume` — Resume\n`/music skip` — Skip\n`/music queue` — Show queue\n`/music volume` — Set volume',
  Voice: '`/voice join` — Join voice\n`/voice leave` — Leave voice\n`/voice speak` — Speak text',
  Moderation: '`/mod warn` — Warn user\n`/mod kick` — Kick user\n`/mod ban` — Ban user',
  Economy: '`/economy balance` — Check balance\n`/economy daily` — Daily reward\n`/economy transfer` — Send money',
  Levels: '`/levels rank` — Your rank\n`/levels leaderboard` — Top users',
  Tickets: '`/ticket create` — Create ticket',
  Giveaway: '`/giveaway start` — Start giveaway',
  Utility: '`/help` — Help\n`/remind` — Set reminder\n`/embed` — Create embed'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    try {
      const embeds = Object.entries(groups).map(([category, commands]) =>
        new EmbedBuilder()
          .setTitle(`📚 ${category} Commands`)
          .setDescription(commands)
          .setColor(0x5865F2)
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Choose a category')
        .addOptions(
          Object.keys(groups).map(category => ({
            label: category,
            value: category,
            description: `${category} commands`
          }))
        );

      const actionRow = new ActionRowBuilder().addComponents(selectMenu);

      return interaction.reply({
        embeds: [embeds[0]],
        components: [actionRow],
        ephemeral: false
      });
    } catch (error) {
      return interaction.reply({
        content: '❌ Error displaying help.',
        ephemeral: true
      });
    }
  }
};
