# All-in-One Discord AI Bot

A modular Discord.js bot designed for Render with a free-first architecture. Core Discord features work without an AI API. AI and TTS are optional integrations.

## What is included

AI chat with provider switching, optional prefix `!ai`, per-guild memory limits, voice join/leave/speak/stop/pause/resume, Khmer romanization normalization, moderation, AutoMod, logging, welcome/goodbye, tickets, giveaways, leveling, virtual economy, custom commands, autoresponders, reminders, scheduling, embeds, utility commands, direct-media music playback, SQLite persistence, and a lightweight web dashboard.

The bot does not bypass Discord permissions/rate limits and does not ship copyrighted media.

## Project structure

```text
.
├── index.js
├── package.json
├── render.yaml
├── .env.example
├── README.md
├── scripts/
│   └── register-commands.js
├── src/
│   ├── config/
│   ├── database/
│   ├── data/
│   ├── events/
│   ├── services/
│   │   ├── ai/
│   │   └── tts/
│   ├── utils/
│   ├── web/
│   └── commands/
│       ├── admin/
│       ├── ai/
│       ├── automation/
│       ├── economy/
│       ├── giveaways/
│       ├── levels/
│       ├── moderation/
│       ├── music/
│       ├── server/
│       ├── tickets/
│       ├── utility/
│       └── voice/
└── data/
    └── bot.sqlite  (created automatically)
```

## 1. Discord Developer Portal

1. Open the Discord Developer Portal and create an Application.
2. Open **Bot** and create/reset the bot token.
3. Enable **Server Members Intent** and **Message Content Intent**. Voice and moderation features also require the corresponding gateway permissions/intents used by Discord.
4. Copy the Application ID into `CLIENT_ID`.
5. Copy the bot token into `DISCORD_TOKEN`.
6. Copy your Discord user ID into `BOT_OWNER_ID`.

### Recommended bot permissions

For the full feature set, invite the bot with the permissions it actually needs: View Channels, Send Messages, Read Message History, Embed Links, Add Reactions, Manage Messages, Manage Channels, Manage Roles, Moderate Members, Kick Members, Ban Members, Connect, and Speak. Do not grant Administrator unless you understand the trade-off.

## 2. Local setup

Node.js 22.12+ is recommended because the current `@discordjs/voice` release requires it.

```bash
npm install
cp .env.example .env
npm start
```

The bot starts an HTTP server on `PORT` and exposes:

- `GET /health`
- `/` dashboard when enabled

## 3. Environment variables

### Required

- `DISCORD_TOKEN`
- `CLIENT_ID`

### AI optional

Set `AI_PROVIDER` to `groq`, `gemini`, `openrouter`, or `none`.
Set `AI_API_KEY` to the provider key.
Set `AI_MODEL` to a supported model.

Groq is implemented through its OpenAI-compatible chat-completions endpoint. Gemini uses `models.generateContent`. OpenRouter uses the OpenAI-compatible endpoint configured by `AI_BASE_URL` or the built-in default.

### TTS optional

`TTS_PROVIDER=edge` uses the `node-edge-tts` package. This is a free online TTS integration. `TTS_PROVIDER=elevenlabs` uses ElevenLabs when `TTS_API_KEY` is configured. `TTS_PROVIDER=none` disables TTS.

For multilingual usage, configure a voice available from the provider. Romanized Khmer is normalized using `src/data/khmer-map.json`; expand that file with your own mappings.

### Database

`DATABASE_PATH=./data/bot.sqlite` is used by default. On Render Free, ephemeral filesystem behavior means local SQLite data can be lost when the service is restarted/redeployed. Use a persistent disk/paid storage or an external database when durable production persistence is required.

## 4. Slash command registration

At startup the bot registers commands automatically. With `GUILD_ID`, registration is scoped to one guild for faster development. Without `GUILD_ID`, commands are registered globally.

You can also run:

```bash
npm run register
```

## 5. First tests

1. Start the bot.
2. Run `/ping` through the `/utility ping` command group if you prefer grouped commands, or use `/help` to navigate.
3. Run `/voice join` while you are in voice.
4. Run `/voice speak text:hello` or `/speak text:hello`.
5. Run `/ai question: explain JavaScript promises` after AI is configured.

## Main command groups

- `/ai`
- `/voice`
- `/join`, `/leave`, `/speak`, `/stop`, `/pause`, `/resume`
- `/mod`
- `/automod`
- `/server`
- `/config`
- `/welcome`
- `/ticket`
- `/giveaway`
- `/levels`
- `/economy`
- `/automation`
- `/remind`
- `/embed`
- `/utility`
- `/music`
- `/help`
- `/owner`

## 6. Render deployment

1. Push this project to GitHub.
2. In Render, create a **Web Service** from the GitHub repository.
3. Use Node runtime.
4. Build Command: `npm ci`
5. Start Command: `npm start`
6. Set the environment variables from `.env.example` in Render.
7. Set the health check path to `/health` or use the supplied `render.yaml` Blueprint.
8. Deploy.

The app binds to `0.0.0.0:$PORT`, which is required for a Render web service. Render HTTP health checks expect a 2xx/3xx response; this app returns 200 from `/health` when the HTTP process is alive.

## 7. Important Render persistence note

SQLite is intentionally used for lightweight local persistence, but a free/ephemeral filesystem is not a guarantee of durable data. For durable tickets, giveaways, levels, economy, reminders, and settings across redeploys, attach persistent storage or move the database layer to a managed database.

## 8. Troubleshooting

**Bot online but slash commands missing:** check `CLIENT_ID`, `DISCORD_TOKEN`, and whether `AUTO_REGISTER_COMMANDS=true`. For development, set `GUILD_ID`.

**AI says not configured:** set `AI_PROVIDER` and `AI_API_KEY`. Keep `AI_PROVIDER=none` if you want the bot to run without AI.

**Voice does not join:** verify the bot has Connect/Speak permissions in that voice channel and that your hosting environment allows outbound connections.

**TTS fails:** set `TTS_PROVIDER=edge` and verify the voice name. The provider is online, so provider-side changes can affect availability.

**Render health check fails:** confirm the process is listening on `0.0.0.0:$PORT` and that the Render health check path is `/health`.

**SQLite resets:** this is expected on ephemeral storage after some restarts/redeploys. Use persistent storage for durable data.

## Safety and API limits

This project deliberately does not attempt to bypass Discord rate limits, permission boundaries, content restrictions, or platform restrictions. Music playback is limited to direct HTTP(S) media URLs supplied by you; no copyrighted media is bundled and no downloader/bypass logic is included.
