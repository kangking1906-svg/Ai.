const { logger } = require('./logger');

// String utilities
class StringUtils {
  static truncate(str, max = 2000) {
    if (str.length <= max) return str;
    return str.substring(0, max - 3) + '...';
  }

  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  static formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  static sanitize(str) {
    return str.replace(/[<>"']/g, '');
  }
}

// Array utilities
class ArrayUtils {
  static chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  static shuffle(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static unique(arr) {
    return [...new Set(arr)];
  }

  static flatten(arr) {
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }
}

// Object utilities
class ObjectUtils {
  static isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  static merge(...objects) {
    return Object.assign({}, ...objects);
  }

  static clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static get(obj, path, defaultValue = undefined) {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) return defaultValue;
    }
    return result;
  }
}

// Error handler
class ErrorHandler {
  static handle(error, context = 'Unknown') {
    logger.error(`Error in ${context}:`, error);
    
    if (error.code) {
      logger.error(`Error Code: ${error.code}`);
    }
    
    if (error.stack) {
      logger.debug(`Stack Trace:`, error.stack);
    }
  }

  static createErrorEmbed(message, error) {
    return {
      color: 0xff0000,
      title: '❌ Error Occurred',
      description: message,
      fields: [
        {
          name: 'Error Type',
          value: error?.constructor?.name || 'Unknown',
          inline: true
        },
        {
          name: 'Message',
          value: error?.message || 'No message provided',
          inline: false
        }
      ],
      timestamp: new Date()
    };
  }
}

// Validation utilities
class Validator {
  static isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isDiscordId(id) {
    return /^\d{17,19}$/.test(id);
  }

  static isHexColor(color) {
    return /^#?[0-9A-Fa-f]{6}$/.test(color);
  }

  static isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
}

module.exports = {
  StringUtils,
  ArrayUtils,
  ObjectUtils,
  ErrorHandler,
  Validator
};