const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getDb } = require('../../database');
const { parseDuration } = require('../../utils/time');

const data = new SlashCommandBuilder()
  .setName('automation').setDescription('Automation tools')
  .addSubcommand(s => s.setName('remind').setDescription('Create a reminder')
    .addStringOption(o => o.setName('time').setDescription('10m/2h/1d').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Reminder').setRequired(true)))
  .addSubcommand(s => s.setName('customcommand-create').setDescription('Create custom command')
    .addStringOption(o => o.setName('name').setDescription('Name').setRequired(true))
    .addStringOption(o => o.setName('response').setDescription('Response').setRequired(true)))
  .addSubcommand(s => s.setName('customcommand-delete').setDescription('Delete custom command')
    .addStringOption(o => o.setName('name').setDescription('Name').setRequired(true)))
  .addSubcommand(s => s.setName('customcommand-list').setDescription('List custom commands'))
  .addSubcommand(s => s.setName('autoresponder-create').setDescription('Create autoresponder')
    .addStringOption(o => o.setName('trigger').setDescription('Trigger').setRequired(true))
    .addStringOption(o => o.setName('response').setDescription('Response').setRequired(true))
    .addStringOption(o => o.setName('mode').setDescription('Match mode').addChoices(
      { name: 'contains', value: 'contains' }, { name: 'exact', value: 'exact' }, { name: 'regex', value: 'regex' })))
  .addSubcommand(s => s.setName('autoresponder-delete').setDescription('Delete autoresponder')
    .addStringOption(o => o.setName('trigger').setDescription('Trigger').setRequired(true)))
  .addSubcommand(s => s.setName('schedule').setDescription('Schedule an announcement')
    .addStringOption(o => o.setName('time').setDescription('10m/2h/1d').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true))
    .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)));

module.exports = {
  data,
  async execute(i) {
    const p = i.options.getSubcommand();
    const db = getDb();
    if (p === 'remind') {
      const ms = parseDuration(i.options.getString('time'));
      if (!ms) return i.reply({ content: 'Use e.g. 10m, 2h, 1d.', ephemeral: true });
      db.prepare('INSERT INTO reminders(guild_id,user_id,remind_at,message) VALUES(?,?,?,?)').run(i.guildId, i.user.id, Date.now() + ms, i.options.getString('message'));
      return i.reply('⏰ Reminder scheduled.');
    }
    if (!i.memberPermissions.has(PermissionFlagsBits.ManageGuild)) return i.reply({ content: '❌ Missing Manage Server.', ephemeral: true });
    if (p === 'customcommand-create') {
      const n = i.options.getString('name').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
      db.prepare('INSERT INTO custom_commands(guild_id,name,response,created_by,created_at) VALUES(?,?,?,?,?) ON CONFLICT(guild_id,name) DO UPDATE SET response=excluded.response').run(i.guildId, n, i.options.getString('response'), i.user.id, Date.now());
      return i.reply(`✅ Custom command !${n} saved.`);
    }
    if (p === 'customcommand-delete') {
      db.prepare('DELETE FROM custom_commands WHERE guild_id=? AND name=?').run(i.guildId, i.options.getString('name').toLowerCase());
      return i.reply('✅ Deleted.');
    }
    if (p === 'customcommand-list') {
      const rows = db.prepare('SELECT name FROM custom_commands WHERE guild_id=? ORDER BY name').all(i.guildId);
      return i.reply(rows.length ? rows.map(x => `!${x.name}`).join(', ') : 'No custom commands.');
    }
    if (p === 'autoresponder-create') {
      db.prepare('INSERT INTO autoresponders(guild_id,trigger,response,mode,created_at) VALUES(?,?,?,?,?)').run(i.guildId, i.options.getString('trigger'), i.options.getString('response'), i.options.getString('mode') || 'contains', Date.now());
      return i.reply('✅ Autoresponder created.');
    }
    if (p === 'autoresponder-delete') {
      db.prepare('DELETE FROM autoresponders WHERE guild_id=? AND trigger=?').run(i.guildId, i.options.getString('trigger'));
      return i.reply('✅ Deleted.');
    }
    const ms = parseDuration(i.options.getString('time'));
    if (!ms) return i.reply({ content: 'Invalid time.', ephemeral: true });
    const channel = i.options.getChannel('channel');
    db.prepare('INSERT INTO scheduled_jobs(guild_id,run_at,type,payload) VALUES(?,?,?,?,?)').run(i.guildId, Date.now() + ms, 'announcement', JSON.stringify({ channelId: channel.id, message: i.options.getString('message') }));
    return i.reply('✅ Scheduled.');
  }
};
