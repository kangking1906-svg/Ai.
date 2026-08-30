const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior
} = require("@discordjs/voice");

const {
  ChannelType
} = require("discord.js");

const {
  synthesize
} = require("./tts");

const {
  checkCooldown
} = require("../utils/cooldown");

const config = require("../config");

const sessions = new Map();

function getSession(guildId) {
  return sessions.get(guildId);
}

async function join(channel) {
  if (
    !channel ||
    ![
      ChannelType.GuildVoice,
      ChannelType.GuildStageVoice
    ].includes(channel.type)
  ) {
    throw new Error(
      "You must be in a voice channel."
    );
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  const player = createAudioPlayer({
    behavior: NoSubscriberBehavior.Pause
  });

  connection.subscribe(player);

  connection.on(
    VoiceConnectionStatus.Disconnected,
    () => {
      const current = sessions.get(channel.guild.id);

      if (current?.connection === connection) {
        sessions.delete(channel.guild.id);
      }
    }
  );

  sessions.set(channel.guild.id, {
    connection,
    player,
    channelId: channel.id,
    busy: false
  });

  return sessions.get(channel.guild.id);
}

function leave(guildId) {
  const session = sessions.get(guildId);

  if (!session) {
    return false;
  }

  try {
    session.player.stop(true);
  } catch {}

  try {
    session.connection.destroy();
  } catch {}

  sessions.delete(guildId);

  return true;
}

function stop(guildId) {
  const session = sessions.get(guildId);

  if (!session) {
    return false;
  }

  session.player.stop(true);
  session.busy = false;

  return true;
}

async function speak(guildId, text, voice) {
  const session = sessions.get(guildId);

  if (!session) {
    throw new Error(
      "Bot is not in voice. Use /join first."
    );
  }

  if (session.busy) {
    throw new Error(
      "Bot is already speaking."
    );
  }

  const cooldown = checkCooldown(
    `tts:${guildId}`,
    config.tts.userCooldownMs
  );

  if (cooldown) {
    throw new Error(
      `TTS cooldown: ${Math.ceil(cooldown / 1000)}s.`
    );
  }

  session.busy = true;

  let audio;

  try {
    audio = await synthesize(text, voice);

    const resource = createAudioResource(
      audio.file
    );

    session.player.play(resource);

    await new Promise((resolve, reject) => {
      const cleanup = () => {
        session.player.off(
          AudioPlayerStatus.Idle,
          onIdle
        );

        session.player.off(
          "error",
          onError
        );
      };

      const onIdle = () => {
        cleanup();
        resolve();
      };

      const onError = (error) => {
        cleanup();
        reject(error);
      };

      session.player.once(
        AudioPlayerStatus.Idle,
        onIdle
      );

      session.player.once(
        "error",
        onError
      );
    });
  } finally {
    session.busy = false;
    audio?.cleanup?.();
  }
}

module.exports = {
  sessions,
  getSession,
  join,
  leave,
  stop,
  speak
};
