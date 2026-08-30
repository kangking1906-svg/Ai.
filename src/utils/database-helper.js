const { getDb } = require('../database');
const { logger } = require('./logger');

class DatabaseHelper {
  static getGuildSettings(guildId) {
    try {
      const db = getDb();
      return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
    } catch (error) {
      logger.error(`Error getting guild settings for ${guildId}`, error);
      return null;
    }
  }

  static setGuildSetting(guildId, setting, value) {
    try {
      const db = getDb();
      db.prepare(
        `UPDATE guild_settings SET ${setting} = ? WHERE guild_id = ?`
      ).run(value, guildId);
      logger.database('UPDATE', `Guild ${guildId}: ${setting} = ${value}`);
      return true;
    } catch (error) {
      logger.error(`Error setting guild setting for ${guildId}`, error);
      return false;
    }
  }

  static getUserData(guildId, userId) {
    try {
      const db = getDb();
      return db.prepare(
        'SELECT * FROM users WHERE guild_id = ? AND user_id = ?'
      ).get(guildId, userId);
    } catch (error) {
      logger.error(`Error getting user data for ${userId}`, error);
      return null;
    }
  }

  static updateUserXP(guildId, userId, xpAmount) {
    try {
      const db = getDb();
      const user = this.getUserData(guildId, userId);
      
      if (!user) {
        db.prepare(
          'INSERT INTO users (guild_id, user_id, xp) VALUES (?, ?, ?)'
        ).run(guildId, userId, xpAmount);
      } else {
        const newXP = (user.xp || 0) + xpAmount;
        db.prepare(
          'UPDATE users SET xp = ? WHERE guild_id = ? AND user_id = ?'
        ).run(newXP, guildId, userId);
      }
      return true;
    } catch (error) {
      logger.error(`Error updating user XP for ${userId}`, error);
      return false;
    }
  }

  static getLeaderboard(guildId, limit = 10) {
    try {
      const db = getDb();
      return db.prepare(
        'SELECT * FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?'
      ).all(guildId, limit);
    } catch (error) {
      logger.error(`Error getting leaderboard for ${guildId}`, error);
      return [];
    }
  }

  static addWarning(guildId, userId, moderatorId, reason) {
    try {
      const db = getDb();
      db.prepare(
        'INSERT INTO warnings (guild_id, user_id, moderator_id, reason, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(guildId, userId, moderatorId, reason, Date.now());
      return true;
    } catch (error) {
      logger.error(`Error adding warning for ${userId}`, error);
      return false;
    }
  }

  static getUserWarnings(guildId, userId) {
    try {
      const db = getDb();
      return db.prepare(
        'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ?'
      ).all(guildId, userId);
    } catch (error) {
      logger.error(`Error getting warnings for ${userId}`, error);
      return [];
    }
  }
}

module.exports = { DatabaseHelper };