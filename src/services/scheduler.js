const { getDb } = require('../database');
const { logger } = require('./logger');

let timer;

function startSchedulers(client) {
  if (timer) return;

  timer = setInterval(async () => {
    const db = getDb();
    const now = Date.now();

    try {
      // Process reminders
      for (const reminder of db.prepare('SELECT * FROM reminders WHERE sent = 0 AND remind_at <= ?').all(now)) {
        try {
          const user = await client.users.fetch(reminder.user_id);
          await user.send(`Reminder: ${reminder.message}`);
          db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?').run(reminder.id);
        } catch (error) {
          logger.error(`Failed to send reminder ${reminder.id}`, error);
        }
      }

      // Process scheduled jobs
      for (const job of db.prepare('SELECT * FROM scheduled_jobs WHERE status = ? AND run_at <= ?').all('pending', now)) {
        try {
          const payload = JSON.parse(job.payload);
          logger.info(`Executing scheduled job: ${job.type}`);
          db.prepare('UPDATE scheduled_jobs SET status = ? WHERE id = ?').run('completed', job.id);
        } catch (error) {
          logger.error(`Failed to execute scheduled job ${job.id}`, error);
        }
      }

      // Process giveaways
      for (const giveaway of db.prepare('SELECT * FROM giveaways WHERE status = ? AND ends_at <= ?').all('active', now)) {
        try {
          const channel = await client.channels.fetch(giveaway.channel_id);
          const message = await channel.messages.fetch(giveaway.message_id);
          
          const entries = db.prepare('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?').all(giveaway.id);
          const winners = entries.sort(() => 0.5 - Math.random()).slice(0, giveaway.winners);

          const winnerText = winners.length > 0
            ? `Winners: ${winners.map(w => `<@${w.user_id}>`).join(', ')}`
            : 'No valid entries';

          await message.reply(`🎉 Giveaway ended! Prize: **${giveaway.prize}**\n${winnerText}`);
          db.prepare('UPDATE giveaways SET status = ? WHERE id = ?').run('ended', giveaway.id);
        } catch (error) {
          logger.error(`Failed to process giveaway ${giveaway.id}`, error);
        }
      }
    } catch (error) {
      logger.error('Scheduler error', error);
    }
  }, 10000);
}

function stopSchedulers() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startSchedulers,
  stopSchedulers
};
