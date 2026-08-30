const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

function loadEvents(client) {
  const eventDir = path.join(__dirname, '..', 'events');
  
  for (const file of fs.readdirSync(eventDir).filter(x => x.endsWith('.js'))) {
    try {
      delete require.cache[require.resolve(path.join(eventDir, file))];
      const event = require(path.join(eventDir, file));

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      logger.info(`Loaded event: ${event.name}`);
    } catch (error) {
      logger.error(`Failed to load event ${file}`, error);
    }
  }
}

module.exports = { loadEvents };
