const { SlashCommandBuilder } = require('discord.js');
const { chat } = require('../../services/ai');
const { checkCooldown } = require('../../utils/cooldown');
const config = require('../../config');
const { logger } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Chat with AI')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('Your question for the AI')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    try {
      if (!config.features.aiEnabled) {
        return interaction.reply({
          content: '❌ AI features are disabled.',
          ephemeral: true
        });
      }

      const cooldownKey = `ai-${interaction.user.id}`;
      const cooldownMs = checkCooldown(cooldownKey, config.rateLimits.aiWindow);
      
      if (cooldownMs > 0) {
        return interaction.reply({
          content: `⏱️ Please wait ${Math.ceil(cooldownMs / 1000)}s before using AI again.`,
          ephemeral: true
        });
      }

      await interaction.deferReply();

      const question = interaction.options.getString('question', true);

      const answer = await chat({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        prompt: question
      });

      const maxLength = config.maxMessageLength;
      if (answer.length > maxLength) {
        await interaction.editReply(answer.slice(0, maxLength) + '...');
      } else {
        await interaction.editReply(answer);
      }

      logger.command(`/ai`, interaction.user.tag, interaction.guild?.name);
    } catch (error) {
      logger.error('AI command error', error);
      const message = error.message || 'An error occurred while processing your request.';
      
      try {
        if (interaction.deferred) {
          await interaction.editReply(`❌ ${message}`);
        } else {
          await interaction.reply({
            content: `❌ ${message}`,
            ephemeral: true
          });
        }
      } catch (e) {
        logger.error('Failed to send error reply', e);
      }
    }
  }
};
