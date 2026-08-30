function formatError(error) {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  return String(error);
}

function log(level, ...args) {
  const time = new Date().toISOString();

  console.log(`[${time}] [${level.toUpperCase()}]`, ...args);
}

module.exports = {
  info: (...args) => log("info", ...args),
  warn: (...args) => log("warn", ...args),
  error: (...args) => log("error", ...args),
  debug: (...args) => log("debug", ...args),
  formatError
};
