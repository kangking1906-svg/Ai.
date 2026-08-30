const { logger } = require('../utils/logger');
const { CacheManager } = require('../utils/cache');

class MusicService {
  constructor(client, lavalinkClient) {
    this.client = client;
    this.lavalink = lavalinkClient;
    this.cache = new CacheManager(600000); // 10 minute cache
    this.queue = new Map();
    logger.success('Music Service initialized');
  }

  async play(guildId, query) {
    try {
      const player = this.lavalink.players.get(guildId);
      if (!player) {
        throw new Error('No active music player in this guild');
      }

      // Search for the track
      const result = await player.search(query);
      if (!result.tracks.length) {
        throw new Error('No tracks found');
      }

      const track = result.tracks[0];
      await player.queue.add(track);
      
      if (!player.isPlaying) {
        await player.play();
      }

      logger.info(`▶️ Playing: ${track.info.title}`);
      return track;
    } catch (error) {
      logger.error('Music play error', error);
      throw error;
    }
  }

  async pause(guildId) {
    try {
      const player = this.lavalink.players.get(guildId);
      if (!player) throw new Error('No active player');
      
      await player.pause();
      logger.info('⏸️ Music paused');
    } catch (error) {
      logger.error('Music pause error', error);
      throw error;
    }
  }

  async resume(guildId) {
    try {
      const player = this.lavalink.players.get(guildId);
      if (!player) throw new Error('No active player');
      
      await player.resume();
      logger.info('▶️ Music resumed');
    } catch (error) {
      logger.error('Music resume error', error);
      throw error;
    }
  }

  async skip(guildId) {
    try {
      const player = this.lavalink.players.get(guildId);
      if (!player) throw new Error('No active player');
      
      await player.skip();
      logger.info('⏭️ Skipped track');
    } catch (error) {
      logger.error('Music skip error', error);
      throw error;
    }
  }

  async stop(guildId) {
    try {
      const player = this.lavalink.players.get(guildId);
      if (!player) throw new Error('No active player');
      
      player.queue.clear();
      await player.stop();
      logger.info('⏹️ Music stopped');
    } catch (error) {
      logger.error('Music stop error', error);
      throw error;
    }
  }

  getQueue(guildId) {
    const player = this.lavalink.players.get(guildId);
    if (!player) return [];
    return player.queue.tracks;
  }
}

module.exports = { MusicService };