const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

let db;

function initDatabase() {
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  db = new Database(config.databasePath);
  db.pragma('journal_mode=WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings(
      guild_id TEXT PRIMARY KEY,
      ai_enabled INTEGER DEFAULT 1,
      ai_context INTEGER DEFAULT 8,
      log_channel_id TEXT,
      welcome_channel_id TEXT,
      welcome_message TEXT,
      goodbye_message TEXT,
      automod_enabled INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users(
      guild_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      balance INTEGER DEFAULT 0,
      last_daily INTEGER DEFAULT 0,
      PRIMARY KEY(guild_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS warnings(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      moderator_id TEXT,
      reason TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS custom_commands(
      guild_id TEXT,
      name TEXT,
      response TEXT,
      created_by TEXT,
      created_at INTEGER,
      PRIMARY KEY(guild_id, name)
    );

    CREATE TABLE IF NOT EXISTS autoresponders(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      trigger TEXT,
      response TEXT,
      mode TEXT DEFAULT 'contains',
      case_sensitive INTEGER DEFAULT 0,
      channel_id TEXT
    );

    CREATE TABLE IF NOT EXISTS reminders(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      remind_at INTEGER,
      message TEXT,
      sent INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS scheduled_jobs(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      run_at INTEGER,
      type TEXT,
      payload TEXT,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS tickets(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      channel_id TEXT UNIQUE,
      opener_id TEXT,
      claimed_by TEXT,
      status TEXT DEFAULT 'open',
      created_at INTEGER,
      closed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS giveaways(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      channel_id TEXT,
      message_id TEXT UNIQUE,
      prize TEXT,
      winners INTEGER,
      ends_at INTEGER,
      required_role_id TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS giveaway_entries(
      giveaway_id INTEGER,
      user_id TEXT,
      PRIMARY KEY(giveaway_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS ai_memory(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT,
      user_id TEXT,
      role TEXT,
      content TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS voice_config(
      guild_id TEXT PRIMARY KEY,
      voice_id TEXT,
      text_channel_id TEXT,
      auto_speak INTEGER DEFAULT 0,
      voice_name TEXT
    );

    CREATE TABLE IF NOT EXISTS logs_config(
      guild_id TEXT PRIMARY KEY,
      channel_id TEXT
    );

    CREATE TABLE IF NOT EXISTS moderation_rules(
      guild_id TEXT PRIMARY KEY,
      anti_spam INTEGER DEFAULT 1,
      anti_flood INTEGER DEFAULT 1,
      anti_mention INTEGER DEFAULT 0
    );
  `);

  return db;
}

function getDb() {
  if (!db) {
    initDatabase();
  }
  return db;
}

function ensureGuild(id) {
  getDb().prepare('INSERT INTO guild_settings(guild_id) VALUES(?) ON CONFLICT(guild_id) DO NOTHING').run(id);
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initDatabase,
  getDb,
  ensureGuild,
  closeDatabase
};
