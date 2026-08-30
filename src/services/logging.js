const { EmbedBuilder } = require('discord.js');
const { getDb, ensureGuild } = require('../database');
const { logger } = require('../utils/logger');

async function logGuild(guild, log) {
  if (!guild) return;
  try {
    ensureGuild(guild.id);
    const db = getDb();
    const settings = db.prepare(
      'SELECT log_channel_id FROM guild_settings WHERE guild_id = ?'
    ).get(guild.id);
    if (!settings || !settings.log_channel_id) return;
    const channel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) return;
    const embed = new EmbedBuilder()
      .setTitle(log.title || 'Event Logged')
      .setDescription(log.description || '')
      .setColor(log.color || 0x3498db)
      .setTimestamp(new Date())
      .setFooter({ text: guild.name });
    if (log.author) {
      embed.setAuthor({
        name: log.author.name,
        iconURL: log.author.iconURL
      });
    }
    if (log.fields && Array.isArray(log.fields)) {
      for (const field of log.fields) {
        embed.addFields(field);
      }
    }
    await channel.send({ embeds: [embed] }).catch(err => {
      logger.error(`Failed to send log to guild ${guild.id}`, err);
    });
  } catch (error) {
    logger.error('logGuild error', error);
  }
}

module.exports = {
  logGuild
};
