const config = require('../config');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = levels[config.logLevel] ?? 2;

const colors = {
  error: '\x1b[31m',    // Red
  warn: '\x1b[33m',     // Yellow
  info: '\x1b[36m',     // Cyan
  debug: '\x1b[35m',    // Magenta
  reset: '\x1b[0m'      // Reset
};

function getTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, ...args) {
  const timestamp = getTimestamp();
  const color = colors[level] || '';
  const reset = colors.reset;
  
  return `${color}[${timestamp}] [${level.toUpperCase().padEnd(5)}]${reset} ${args.join(' ')}`;
}

function write(level, ...args) {
  if (levels[level] <= currentLevel) {
    const method = level === 'debug' ? 'log' : level;
    const message = formatMessage(level, ...args);
    console[method](message);
  }
}

const logger = {
  error: (...args) => write('error', ...args),
  warn: (...args) => write('warn', ...args),
  info: (...args) => write('info', ...args),
  debug: (...args) => write('debug', ...args),
  
  // Utility methods
  success: (message) => write('info', `✅ ${message}`),
  failed: (message) => write('error', `❌ ${message}`),
  warning: (message) => write('warn', `⚠️ ${message}`),
  
  // Structured logging
  command: (command, user, guild) => 
    write('info', `📝 Command: ${command} | User: ${user} | Guild: ${guild}`),
  
  event: (eventName, details) =>
    write('info', `📡 Event: ${eventName} | ${details}`),
  
  database: (action, details) =>
    write('info', `📊 Database: ${action} | ${details}`)
};

module.exports = { logger };
