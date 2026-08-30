const fs = require("fs");
const os = require("os");
const path = require("path");

const { EdgeTTS } = require("node-edge-tts");

const config = require("../../config");
const { normalizeForSpeech } = require("../../utils/khmer");

async function synthesize(text, voice) {
  if (config.tts.provider === "none") {
    throw new Error(
      "TTS is disabled. Set TTS_PROVIDER=edge."
    );
  }

  const cleaned = normalizeForSpeech(String(text))
    .slice(0, config.tts.maxChars);

  if (!cleaned.trim()) {
    throw new Error("There is no text to speak.");
  }

  if (config.tts.provider === "edge") {
    const file = path.join(
      os.tmpdir(),
      `tts-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.mp3`
    );

    const selectedVoice =
      voice || config.tts.defaultVoice;

    const tts = new EdgeTTS({
      voice: selectedVoice,
      outputFormat:
        "audio-24khz-48kbitrate-mono-mp3"
    });

    await tts.ttsPromise(cleaned, file);

    return {
      file,
      cleanup: () => {
        try {
          fs.rmSync(file, { force: true });
        } catch {}
      }
    };
  }

  if (config.tts.provider === "elevenlabs") {
    if (!config.tts.key) {
      throw new Error(
        "TTS_API_KEY is required for ElevenLabs."
      );
    }

    const voiceId =
      voice || config.tts.defaultVoice;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": config.tts.key,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: cleaned,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128"
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `ElevenLabs HTTP ${response.status}`
      );
    }

    const file = path.join(
      os.tmpdir(),
      `tts-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.mp3`
    );

    fs.writeFileSync(
      file,
      Buffer.from(await response.arrayBuffer())
    );

    return {
      file,
      cleanup: () => {
        try {
          fs.rmSync(file, { force: true });
        } catch {}
      }
    };
  }

  throw new Error(
    `Unsupported TTS provider: ${config.tts.provider}`
  );
}

module.exports = {
  synthesize
};
