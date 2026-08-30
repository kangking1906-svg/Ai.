const { logger } = require('./logger');

class EventHandler {
  constructor() {
    this.events = new Map();
  }

  register(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(callback);
    logger.debug(`Event handler registered: ${eventName}`);
  }

  async emit(eventName, ...args) {
    if (!this.events.has(eventName)) {
      return false;
    }

    const callbacks = this.events.get(eventName);
    for (const callback of callbacks) {
      try {
        await Promise.resolve(callback(...args));
      } catch (error) {
        logger.error(`Error in event handler for ${eventName}:`, error);
      }
    }
    return true;
  }

  clear(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }

  listEvents() {
    return Array.from(this.events.keys());
  }
}

class EventBus {
  static instance = null;

  static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventHandler();
    }
    return EventBus.instance;
  }

  static on(eventName, callback) {
    return EventBus.getInstance().register(eventName, callback);
  }

  static emit(eventName, ...args) {
    return EventBus.getInstance().emit(eventName, ...args);
  }

  static clear(eventName) {
    return EventBus.getInstance().clear(eventName);
  }
}

module.exports = { EventHandler, EventBus };