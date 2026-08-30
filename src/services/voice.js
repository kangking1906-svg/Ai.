const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { logger } = require('../utils/logger');

function canJoinVoiceChannel(channel) {
  if (!channel) return false;
  const botMember = channel.guild?.members?.me;
  if (!botMember) return false;
  return botMember.permissionsIn(channel).has('Connect');
}

function canSpeakInVoiceChannel(channel) {
  if (!channel) return false;
  const botMember = channel.guild?.members?.me;
  if (!botMember) return false;
  return botMember.permissionsIn(channel).has('Speak');
}

async function waitForVoiceConnection(connection, timeout = 5000) {
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, timeout);
    return true;
  } catch (error) {
    logger.error('Voice connection timeout', error);
    return false;
  }
}

module.exports = {
  canJoinVoiceChannel,
  canSpeakInVoiceChannel,
  waitForVoiceConnection
};
