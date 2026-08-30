const os = require('os');
const config = require('../config');
const { logger } = require('../utils/logger');

function createDashboard(app, client) {
  app.get('/dashboard', (req, res) => {
    if (!config.dashboardPublic && req.headers['x-forwarded-for']) {
      return res.status(403).json({ error: 'Dashboard is private' });
    }

    try {
      const stats = {
        bot: {
          name: client.user.username,
          id: client.user.id,
          tag: client.user.tag,
          uptime: process.uptime(),
          version: require('../../package.json').version
        },
        discord: {
          guilds: client.guilds.cache.size,
          users: client.users.cache.size,
          channels: client.channels.cache.size
        },
        system: {
          platform: os.platform(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(os.totalmem() / 1024 / 1024)
          },
          cpu: os.cpus().length
        },
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(stats);
    } catch (error) {
      logger.error('Dashboard error', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}

module.exports = { createDashboard };
