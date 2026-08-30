const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { getDb } = require('../../database');
const { logGuild } = require('../../services/logging');
const config = require('../../config');
const { logger } = require('../../utils/logger');
const { isModerator, isAdmin } = require('../../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('🛡️ Moderation commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

    .addSubcommand(sub =>
      sub
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
          option.setName('user').setDescription('User to warn').setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for warning').setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('warnings')
        .setDescription('Check user warnings')
        .addUserOption(option =>
          option.setName('user').setDescription('User to check').setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('kick')
        .setDescription('Kick a user')
        .addUserOption(option =>
          option.setName('user').setDescription('User to kick').setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for kick').setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName('ban')
        .setDescription('Ban a user')
        .addUserOption(option =>
          option.setName('user').setDescription('User to ban').setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason').setDescription('Reason for ban').setRequired(false)
        )
    ),

  async execute(interaction) {
    try {
      if (!isModerator(interaction.member)) {
        return interaction.reply({
          content: '❌ You do not have permission to use moderation commands.',
          ephemeral: true
        });
      }

      const subcommand = interaction.options.getSubcommand();
      const targetUser = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      const db = getDb();

      if (subcommand === 'warn') {
        db.prepare(
          'INSERT INTO warnings (guild_id, user_id, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?)'
        ).run(interaction.guildId, targetUser.id, interaction.user.id, reason, Date.now());

        const warnCount = db.prepare(
          'SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?'
        ).get(interaction.guildId, targetUser.id).count;

        await logGuild(interaction.guild, {
          title: '⚠️ User Warned',
          description: `${targetUser.tag} has been warned (${warnCount} total)`,
          color: 0xFFA500,
          author: { name: interaction.user.tag, iconURL: interaction.user.avatarURL() },
          fields: [{ name: 'Reason', value: reason }]
        });

        return interaction.reply({
          content: `⚠️ ${targetUser.tag} warned (${warnCount} warnings)`,
          ephemeral: true
        });
      }

      if (subcommand === 'warnings') {
        const warnings = db.prepare(
          'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC'
        ).all(interaction.guildId, targetUser.id);

        if (warnings.length === 0) {
          return interaction.reply({
            content: `✅ ${targetUser.tag} has no warnings.`,
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setTitle(`Warnings for ${targetUser.tag}`)
          .setColor(0xFFA500)
          .setDescription(`Total: ${warnings.length} warning(s)`);

        for (const warning of warnings.slice(0, 10)) {
          embed.addFields({
            name: `Warning #${warnings.indexOf(warning) + 1}`,
            value: `Reason: ${warning.reason}\nBy: <@${warning.moderator_id}>`,
            inline: false
          });
        }

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (subcommand === 'kick') {
        const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) {
          return interaction.reply({
            content: '❌ User not found in this server.',
            ephemeral: true
          });
        }

        await targetMember.kick(reason);
        await logGuild(interaction.guild, {
          title: '🚪 User Kicked',
          description: `${targetUser.tag} has been kicked`,
          color: 0xFF6B6B,
          fields: [{ name: 'Reason', value: reason }]
        });

        return interaction.reply({
          content: `🚪 ${targetUser.tag} has been kicked.`,
          ephemeral: true
        });
      }

      if (subcommand === 'ban') {
        await interaction.guild.members.ban(targetUser.id, { reason });
        await logGuild(interaction.guild, {
          title: '🔨 User Banned',
          description: `${targetUser.tag} has been banned`,
          color: 0xFF0000,
          fields: [{ name: 'Reason', value: reason }]
        });

        return interaction.reply({
          content: `🔨 ${targetUser.tag} has been banned.`,
          ephemeral: true
        });
      }
    } catch (error) {
      logger.error('Moderation command error', error);
      return interaction.reply({
        content: `❌ ${error.message}`,
        ephemeral: true
      });
    }
  }
};
