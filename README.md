# 🤖 All-in-One Discord AI Bot v2.0

**A powerful, feature-rich Discord bot with AI, music, moderation, economy systems, and much more!**

[![Node.js](https://img.shields.io/badge/Node.js-22.12+-green?logo=node.js)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.27-blue?logo=discord)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-kangking1906--svg/Ai.-black?logo=github)](https://github.com/kangking1906-svg/Ai.)

---

## 📋 Features

### 🧠 AI & Intelligence
- **Multi-Provider AI Support**: Groq, Google Gemini, OpenRouter
- **Context-Aware Conversations**: Maintains conversation memory
- **Configurable Responses**: Custom system prompts and parameters
- **Rate Limiting**: Prevents abuse with built-in cooldowns

### 🎵 Music & Audio
- **Lavalink Integration**: High-quality music streaming
- **TTS Support**: Text-to-speech with Edge TTS & ElevenLabs
- **Playlist Management**: Queue, skip, pause, resume controls
- **Voice Channel Integration**: Seamless voice chat connectivity

### 🛡️ Moderation & Safety
- **Warning System**: Track and manage user warnings
- **Ban/Kick Management**: Server moderation tools
- **Message Logging**: Track deleted/edited messages
- **Automod System**: Automatic rule enforcement

### 💰 Economy System
- **User Balances**: Currency management per user
- **Daily Rewards**: Daily bonus distribution
- **Economic Commands**: Transfer operations

### 📊 Leveling & Rankings
- **XP System**: Earn experience points
- **Automatic Leveling**: Level up through activity
- **Guild Leaderboards**: View top users
- **Role Rewards**: Unlock roles at milestones

### 🎟️ Ticket System
- **Support Tickets**: Create support channels
- **Ticket Management**: Claim and resolve tickets
- **Transcripts**: Automatic ticket logs

### 🎉 Giveaways
- **Prize Drawings**: Run contests and giveaways
- **Role Requirements**: Restrict entries by role
- **Automatic Winners**: Random winner selection
- **Multiple Prizes**: Support multiple prize draws

### 📡 Automation & Scheduling
- **Background Jobs**: Scheduled task execution
- **Reminders**: User reminder system
- **Auto-Responders**: Trigger-based messages
- **Event Scheduling**: Automated event management

### 🎨 Customization
- **Custom Commands**: Create guild-specific commands
- **Configurable Responses**: Customize bot behavior
- **Welcome Messages**: Custom member greetings
- **Dashboard**: Web interface for management

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 22.12 or higher
- **npm** or **yarn**
- **Discord Bot Token** from [Discord Developer Portal](https://discord.com/developers/applications)
- **Client ID** from your Discord Application

### Installation

```bash
# Clone the repository
git clone https://github.com/kangking1906-svg/Ai.
cd Ai.

# Install dependencies
npm install

# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# On Linux/Mac: nano .env
# On Windows: notepad .env

# Start the bot
npm start
```

### Development Mode

```bash
# Run with auto-reload on file changes
npm run dev
```

---

## ⚙️ Configuration

### Required Environment Variables

```env
# Discord Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
BOT_OWNER_ID=your_user_id_here
```

See `.env.example` for all available configuration options.

### AI Provider Setup

#### Groq (Recommended - Free)
1. Get API key from [Groq](https://console.groq.com)
2. Set `AI_PROVIDER=groq`
3. Set `AI_API_KEY=your_key`

#### Google Gemini
1. Get API key from [Google AI Studio](https://aistudio.google.com)
2. Set `AI_PROVIDER=gemini`
3. Set `AI_API_KEY=your_key`

#### OpenRouter
1. Get API key from [OpenRouter](https://openrouter.ai)
2. Set `AI_PROVIDER=openrouter`
3. Set `AI_API_KEY=your_key`

### TTS Provider Setup

#### Edge TTS (Free - Recommended)
```env
TTS_PROVIDER=edge
```

#### ElevenLabs (Premium)
```env
TTS_PROVIDER=elevenlabs
TTS_API_KEY=your_elevenlabs_key
```

### Music Setup (Lavalink)

The bot uses Lavalink for music playback. You need to:
1. Set up a Lavalink server
2. Configure these environment variables:
   ```env
   LAVALINK_HOST=your_lavalink_host
   LAVALINK_PORT=2333
   LAVALINK_PASSWORD=your_password
   LAVALINK_SECURE=false
   ```

---

## 📚 Command Groups

### AI Commands
```
/ai question: <question>      - Ask the AI anything
```

### Music Commands
```
/music play <song>            - Play a song
/music pause                  - Pause music
/music resume                 - Resume music
/music skip                   - Skip current track
/music queue                  - Show playlist queue
/music volume <0-100>         - Set volume
```

### Voice Commands
```
/voice join                   - Join your voice channel
/voice leave                  - Leave voice channel
/voice speak <text>           - Say text in voice
```

### Moderation Commands
```
/mod warn <user> <reason>     - Warn a user
/mod warnings <user>          - Check user warnings
/mod kick <user> <reason>     - Kick a user
/mod ban <user> <reason>      - Ban a user
```

### Economy Commands
```
/economy balance              - Check your balance
/economy daily                - Claim daily reward
/economy transfer <user> <amount> - Send currency
```

### Leveling Commands
```
/levels rank                  - Check your rank
/levels leaderboard           - View guild rankings
```

### Other Commands
```
/ticket create <topic>        - Create a support ticket
/giveaway start <prize> <duration> <winners> - Start giveaway
/remind <time> <message>      - Set a reminder
/help                         - Show all commands
```

---

## 🏗️ Project Structure

```
.
├── index.js                  # Main entry point
├── package.json              # Dependencies
├── .env.example              # Environment template
├── README.md                 # This file
├── .gitignore                # Git ignore rules
├── src/
│   ├── config/
│   │   └── index.js          # Configuration management
│   ├── database/
│   │   └── index.js          # SQLite database initialization
│   ├── services/
│   │   ├── scheduler.js      # Background jobs & schedulers
│   │   ├── ai/index.js       # AI service (Groq, Gemini, OpenRouter)
│   │   ├── tts/index.js      # Text-to-speech service
│   │   ├── logging.js        # Guild event logging
│   │   ├── voice.js          # Voice channel utilities
│   │   └── lavalink.js       # Music server manager
│   ├── commands/
│   │   ├── ai/               # AI commands
│   │   ├── music/            # Music commands
│   │   ├── voice/            # Voice commands
│   │   ├── moderation/       # Moderation commands
│   │   ├── economy/          # Economy commands
│   │   ├── levels/           # Level commands
│   │   ├── tickets/          # Ticket system
│   │   ├── giveaways/        # Giveaway commands
│   │   ├── utility/          # Utility commands
│   │   ├── admin/            # Admin commands
│   │   ├── automation/       # Auto-responder commands
│   │   └── server/           # Server commands
│   ├── events/
│   │   ├── ready.js          # Bot ready event
│   │   ├── interactionCreate.js # Slash command handler
│   │   ├── messageCreate.js  # Message handler
│   │   ├── guildMemberAdd.js # Member join handler
│   │   ├── guildMemberRemove.js # Member leave handler
│   │   └── voiceStateUpdate.js # Voice state handler
│   ├── utils/
│   │   ├── logger.js         # Enhanced logging
│   │   ├── command-loader.js # Command loading system
│   │   ├── event-loader.js   # Event loading system
│   │   ├── cooldown.js       # Cooldown/rate limiting
│   │   ├── permissions.js    # Permission checking
│   │   ├── time.js           # Time formatting utilities
│   │   └── khmer.js          # Khmer text processing
│   ├── data/
│   │   ├── khmer-map.json    # Khmer romanization mappings
│   │   └── bot.sqlite        # Database (created at runtime)
│   └── web/
│       └── dashboard.js      # Web dashboard
├── scripts/
│   └── register-commands.js  # Command registration script
└── Dockerfile                # Docker container configuration
```

---

## 📊 Database Schema

The bot uses SQLite with the following tables:

- **guild_settings**: Server configuration
- **users**: User XP, levels, balance
- **warnings**: Moderation warnings
- **tickets**: Support tickets
- **giveaways**: Active giveaways
- **giveaway_entries**: Giveaway participant tracking
- **reminders**: User reminders
- **ai_memory**: AI conversation history
- **autoresponders**: Auto-response triggers
- **custom_commands**: Guild-specific commands
- **scheduled_jobs**: Background job scheduling
- **voice_config**: Voice channel settings
- **logs_config**: Event logging configuration
- **moderation_rules**: Server moderation rules

---

## 🌐 Web Dashboard

Access the dashboard at `http://localhost:8080/dashboard` (when running locally)

Features:
- Server statistics
- Bot status and uptime
- System resource usage
- Discord metrics

---

## 🚀 Deployment

### Docker
```bash
docker build -t discord-ai-bot .
docker run -e DISCORD_TOKEN=xxx discord-ai-bot
```

### Render
The bot is pre-configured for Render deployment:
```bash
git push  # Deploy automatically
```

### Self-Hosted
```bash
npm install
npm start
```

---

## 🔧 Troubleshooting

### Bot doesn't start
- Check `DISCORD_TOKEN` is set correctly
- Check `CLIENT_ID` is set correctly
- Verify Node.js version: `node --version` (should be 22.12+)

### Commands not showing up
- Run `npm run register` to manually register slash commands
- Check bot has `applications.commands` scope in Discord Developer Portal

### AI not working
- Set `AI_PROVIDER` to `groq`, `gemini`, or `openrouter`
- Set `AI_API_KEY` to your API key
- Check API key is valid and has quota remaining

### Music not working
- Verify Lavalink server is running and accessible
- Check `LAVALINK_HOST`, `LAVALINK_PORT`, `LAVALINK_PASSWORD`
- Ensure bot has permission to connect to voice channels

### Database errors
- Check `data/` directory is writable
- Verify `better-sqlite3` is properly installed: `npm rebuild`

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/kangking1906-svg/Ai./issues)
- **Discussions**: [GitHub Discussions](https://github.com/kangking1906-svg/Ai./discussions)

---

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) - Discord API wrapper
- [Lavalink](https://github.com/lavalink-devs/Lavalink) - Music server
- [Groq](https://www.groq.com/) - AI API
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite driver
- All contributors and supporters

---

## 📈 Version History

- **v2.0.0** (2026-08-30) - Complete rewrite with improved architecture, fixed critical bugs, enhanced security and error handling
- **v1.0.0** (Previous) - Initial release

---

**Made with ❤️ by kangking1906-svg**
