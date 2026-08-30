const khmerMap = require('../data/khmer-map.json');

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function normalizeRomanizedKhmer(text) {
  let output = String(text);
  const sortedKeys = Object.keys(khmerMap).sort((a, b) => b.length - a.length);
  for (const romanized of sortedKeys) {
    const khmer = khmerMap[romanized];
    const regex = new RegExp(escapeRegex(romanized), 'gi');
    output = output.replace(regex, khmer);
  }
  return output;
}

function normalizeForSpeech(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s.,!?;:()\-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = {
  normalizeRomanizedKhmer,
  normalizeForSpeech,
  escapeRegex
};
