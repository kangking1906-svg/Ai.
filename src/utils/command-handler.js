const { logger } = require('./logger');
const { CooldownManager } = require('./helpers');
const config = require('../config');

const cooldownManager = new CooldownManager();

class CommandHandler {
  static validateCommand(command) {
    if (!command.data) {
      throw new Error('Command must have data property');
    }
    if (typeof command.execute !== 'function') {
      throw new Error('Command must have execute function');
    }
    return true;
  }

  static async executeCommand(command, interaction) {
    try {
      // Check if user is on cooldown
      if (cooldownManager.hasCooldown(interaction.user.id, command.data.name)) {
        const remaining = cooldownManager.getRemainingCooldown(
          interaction.user.id,
          command.data.name
        );
        return {
          success: false,
          error: `You're on cooldown for ${Math.ceil(remaining / 1000)}s`,
          cooldown: true
        };
      }

      // Execute the command
      await command.execute(interaction);

      // Set cooldown
      cooldownManager.setCooldown(
        interaction.user.id,
        command.data.name,
        config.rateLimits.commandWindow
      );

      logger.command(command.data.name, interaction.user.tag, interaction.guild?.name || 'DM');

      return { success: true };
    } catch (error) {
      logger.error(`Command execution failed: ${command.data.name}`, error);
      return {
        success: false,
        error: error.message || 'An error occurred while executing the command'
      };
    }
  }

  static getCommandGroup(commandName) {
    const groups = ['ai', 'voice', 'mod', 'moderation', 'music', 'utility', 'economy', 'levels'];
    return groups.find(group => commandName.toLowerCase().includes(group)) || 'general';
  }
}

module.exports = { CommandHandler, cooldownManager };