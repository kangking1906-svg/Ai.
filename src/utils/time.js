function formatDuration(ms) {
  if (ms < 0) return '0s';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function parseDuration(str) {
  const parts = String(str).toLowerCase().match(/\d+[dhms]/g);
  if (!parts) return 0;
  let ms = 0;
  for (const part of parts) {
    const num = parseInt(part);
    const unit = part.slice(-1);
    switch (unit) {
      case 'd':
        ms += num * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        ms += num * 60 * 60 * 1000;
        break;
      case 'm':
        ms += num * 60 * 1000;
        break;
      case 's':
        ms += num * 1000;
        break;
    }
  }
  return ms;
}

module.exports = {
  formatDuration,
  formatTimestamp,
  parseDuration
};
