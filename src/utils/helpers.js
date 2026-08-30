const config = require('../config');

// Cooldown manager for rate limiting
class CooldownManager {
  constructor() {
    this.cooldowns = new Map();
  }

  hasCooldown(userId, command) {
    const key = `${userId}-${command}`;
    return this.cooldowns.has(key);
  }

  setCooldown(userId, command, duration) {
    const key = `${userId}-${command}`;
    this.cooldowns.set(key, Date.now());
    
    setTimeout(() => {
      this.cooldowns.delete(key);
    }, duration);
  }

  getRemainingCooldown(userId, command) {
    const key = `${userId}-${command}`;
    if (!this.cooldowns.has(key)) return 0;
    
    const timestamp = this.cooldowns.get(key);
    return Math.max(0, config.rateLimits.commandWindow - (Date.now() - timestamp));
  }

  clear() {
    this.cooldowns.clear();
  }
}

// Permission checker
class PermissionManager {
  static checkPermission(member, permission) {
    if (!member) return false;
    return member.permissions.has(permission);
  }

  static checkRole(member, roleId) {
    if (!member) return false;
    return member.roles.cache.has(roleId);
  }

  static isAdmin(member) {
    if (!member) return false;
    return member.permissions.has('Administrator');
  }

  static isModerator(member, guildId) {
    if (!member) return false;
    const isAdmin = this.isAdmin(member);
    const isMod = member.permissions.has('ModerateMembers');
    return isAdmin || isMod;
  }
}

// User validation
class UserValidator {
  static isValid(user) {
    return user && user.id && user.username;
  }

  static isBot(user) {
    return user && user.bot === true;
  }

  static canInteract(user) {
    return this.isValid(user) && !this.isBot(user);
  }
}

// Embed builder helper
class EmbedBuilder {
  static success(title, description) {
    return {
      color: 0x2ecc71,
      title: `✅ ${title}`,
      description,
      timestamp: new Date()
    };
  }

  static error(title, description) {
    return {
      color: 0xe74c3c,
      title: `❌ ${title}`,
      description,
      timestamp: new Date()
    };
  }

  static info(title, description) {
    return {
      color: 0x3498db,
      title: `ℹ️ ${title}`,
      description,
      timestamp: new Date()
    };
  }

  static warning(title, description) {
    return {
      color: 0xf39c12,
      title: `⚠️ ${title}`,
      description,
      timestamp: new Date()
    };
  }
}

module.exports = {
  CooldownManager,
  PermissionManager,
  UserValidator,
  EmbedBuilder
};