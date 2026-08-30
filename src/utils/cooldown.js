const cooldowns = new Map();

function checkCooldown(key, ms) {
  if (!ms || ms < 1) return 0;
  const now = Date.now();
  const expiresAt = cooldowns.get(key) || 0;
  if (expiresAt > now) return expiresAt - now;
  cooldowns.set(key, now + ms);
  return 0;
}

function resetCooldown(key) {
  cooldowns.delete(key);
}

function clearAllCooldowns() {
  cooldowns.clear();
}

module.exports = {
  checkCooldown,
  resetCooldown,
  clearAllCooldowns
};
