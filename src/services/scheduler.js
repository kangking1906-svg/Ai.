const { getDb } = require('../database');
const { logger } = require('../utils/logger');

let schedulers = [];

function startSchedulers(client) {
  logger.info('⏱️ Starting background schedulers...');
  
  // Reminder scheduler
  const reminderScheduler = setInterval(async () => {
    try {
      const db = getDb();
      const now = Date.now();
      const reminders = db.prepare(
        'SELECT * FROM reminders WHERE sent = 0 AND remind_at <= ? LIMIT 10'
      ).all(now);

      for (const reminder of reminders) {
        try {
          const user = await client.users.fetch(reminder.user_id);
          const guild = client.guilds.cache.get(reminder.guild_id);
          
          await user.send({
            embeds: [{
              color: 0x3498db,
              title: '⏰ Reminder',
              description: reminder.message,
              footer: { text: guild?.name || 'Discord Bot' },
              timestamp: new Date()
            }]
          });
          
          db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?').run(reminder.id);
          logger.info(`✅ Reminder sent to ${user.tag}`);
        } catch (error) {
          logger.error(`Failed to send reminder ${reminder.id}`, error);
        }
      }
    } catch (error) {
      logger.error('Reminder scheduler error', error);
    }
  }, 30000);
  schedulers.push(reminderScheduler);

  // Giveaway scheduler
  const giveawayScheduler = setInterval(async () => {
    try {
      const db = getDb();
      const now = Date.now();
      const giveaways = db.prepare(
        'SELECT * FROM giveaways WHERE status = ? AND ends_at <= ? LIMIT 5'
      ).all('active', now);

      for (const giveaway of giveaways) {
        try {
          const channel = await client.channels.fetch(giveaway.channel_id);
          const message = await channel.messages.fetch(giveaway.message_id);
          
          const entries = db.prepare(
            'SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?'
          ).all(giveaway.id);
          
          if (entries.length === 0) {
            await message.reply('🎉 **Giveaway Ended** - No valid entries!');
          } else {
            const winners = [];
            const winnerCount = Math.min(giveaway.winners, entries.length);
            const entriesCopy = [...entries];
            
            for (let i = 0; i < winnerCount; i++) {
              const randomIndex = Math.floor(Math.random() * entriesCopy.length);
              winners.push(entriesCopy[randomIndex].user_id);
              entriesCopy.splice(randomIndex, 1);
            }
            
            const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
            await message.reply({
              embeds: [{
                color: 0xffd700,
                title: '🎉 Giveaway Ended!',
                description: `Prize: **${giveaway.prize}**\n\nWinners: ${winnerMentions}`,
                timestamp: new Date()
              }]
            });
          }
          
          db.prepare('UPDATE giveaways SET status = ? WHERE id = ?').run('ended', giveaway.id);
          logger.success(`Giveaway ended: ${giveaway.prize}`);
        } catch (error) {
          logger.error(`Failed to process giveaway ${giveaway.id}`, error);
        }
      }
    } catch (error) {
      logger.error('Giveaway scheduler error', error);
    }
  }, 60000);
  schedulers.push(giveawayScheduler);

  // Ticket scheduler
  const ticketScheduler = setInterval(async () => {
    try {
      const db = getDb();
      const staleTickets = db.prepare(
        'SELECT * FROM tickets WHERE status = ? AND closed_at IS NULL AND created_at < ? LIMIT 5'
      ).all('open', Date.now() - (7 * 24 * 60 * 60 * 1000));

      for (const ticket of staleTickets) {
        try {
          const channel = await client.channels.fetch(ticket.channel_id);
          await channel.send({
            embeds: [{
              color: 0xff9800,
              title: '⚠️ Ticket Timeout',
              description: 'This ticket has been open for 7 days. It will be closed automatically in 24 hours if no activity.',
              timestamp: new Date()
            }]
          });
          logger.warning(`Ticket ${ticket.id} flagged as stale`);
        } catch (error) {
          logger.error(`Failed to handle stale ticket ${ticket.id}`, error);
        }
      }
    } catch (error) {
      logger.error('Ticket scheduler error', error);
    }
  }, 3600000);
  schedulers.push(ticketScheduler);

  return { reminderScheduler, giveawayScheduler, ticketScheduler };
}

function stopSchedulers() {
  logger.warn('⏱️ Stopping all schedulers...');
  for (const scheduler of schedulers) {
    try {
      clearInterval(scheduler);
    } catch (e) {
      logger.error('Error clearing scheduler', e);
    }
  }
  schedulers = [];
  logger.info('✅ All schedulers stopped');
}

module.exports = {
  startSchedulers,
  stopSchedulers
};
