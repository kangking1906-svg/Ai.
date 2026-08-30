const config = require('../config');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const current = levels[config.logLevel] ?? 2;

function write(level, ...args) {
  if (levels[level] <= current) {
    const method = level === 'debug' ? 'log' : level;
    console[method](`[${new Date().toISOString()}] [${level.toUpperCase()}]`, ...args);
  }
}

const logger = {
  error: (...args) => write('error', ...args),
  warn: (...args) => write('warn', ...args),
  info: (...args) => write('info', ...args),
  debug: (...args) => write('debug', ...args)
};

module.exports = { logger };
