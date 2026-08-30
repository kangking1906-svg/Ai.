# 🤖 All-in-One Discord AI Bot v2.0

**A powerful, feature-rich Discord bot with AI, music, moderation, economy systems, and much more!**

[![Node.js](https://img.shields.io/badge/Node.js-22.12+-green?logo=node.js)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.27-blue?logo=discord)](https://discord.js.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-xandue077/Ai-black?logo=github)](https://github.com/xandue077/Ai)

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
- **AutoMod System**: Automatic rule enforcement
- **Warning System**: Track and manage user warnings
- **Anti-Spam Protection**: Detect and prevent spam messages
- **Message Logging**: Track deleted/edited messages

### 💰 Economy System
- **User Balances**: Currency management per user
- **Daily Rewards**: Daily bonus distribution
- **Economic Commands**: Buy, sell, trade operations

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
git clone https://github.com/xandue077/Ai.git
cd Ai

# Install dependencies
npm install

# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

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

# AI Configuration (Optional)
AI_PROVIDER=groq  # or gemini, openrouter, none
AI_API_KEY=your_api_key_here
AI_MODEL=llama-3.3-70b-versatile

# TTS Configuration (Optional)
TTS_PROVIDER=edge  # or elevenlabs, none
TTS_API_KEY=your_elevenlabs_key_here
TTS_DEFAULT_VOICE=en-US-AriaNeural
```

### Optional Configuration

```env
# Server Settings
PORT=8080
GUILD_ID=  # For development: set guild ID for faster command registration
COMMAND_PREFIX=!
STATUS_TEXT=✨ /help | All-in-One AI Bot

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Rate Limiting
RATE_LIMIT_COMMANDS=3
RATE_LIMIT_WINDOW=5000
RATE_LIMIT_AI=2
RATE_LIMIT_AI_WINDOW=10000

# Feature Toggles
FEATURE_AI=true
FEATURE_MUSIC=true
FEATURE_TTS=true
FEATURE_MODERATION=true
FEATURE_ECONOMY=true
FEATURE_LEVELS=true
FEATURE_TICKETS=true
FEATURE_GIVEAWAYS=true

# Music (Lavalink)
LAVALINK_HOST=localhost
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
LAVALINK_SECURE=false
```

---

## 📚 Command Groups

### AI Commands
```
/ai question: <question>      - Ask the AI anything
/ai context: <text>           - Set AI context
/ai settings                  - Configure AI behavior
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
/voice pause                  - Pause voice output
/voice resume                 - Resume voice output
/voice stop                   - Stop voice output
```

### Moderation Commands
```
/mod warn <user> <reason>     - Warn a user
/mod warnings <user>          - Check user warnings
/mod kick <user> <reason>     - Kick a user
/mod ban <user> <reason>      - Ban a user
/mod mute <user> <time>       - Mute a user
```

### Economy Commands
```
/economy balance              - Check your balance
/economy daily                - Claim daily reward
/economy transfer <user> <amount> - Send currency
/economy leaderboard          - View top users
```

### Leveling Commands
```
/levels rank                  - Check your rank
/levels leaderboard           - View guild rankings
/levels profile <user>        - View user profile
```

### Other Commands
```
/ticket create <topic>        - Create a support ticket
/giveaway start <prize> <duration> <winners> - Start giveaway
/remind <time> <message>      - Set a reminder
/embed create                 - Create custom embed
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
├── src/
│   ├── config/
│   │   └── index.js          # Configuration management
│   ├── database/
│   │   └── index.js          # SQLite database initialization
│   ├── services/
│   │   ├── scheduler.js      # Background jobs
│   │   ├── ai.js             # AI service
│   │   ├── tts.js            # Text-to-speech service
│   │   ├── music.js          # Music service
│   │   ├── logging.js        # Logging service
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
│   │   └── automation/       # Auto-responder commands
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
│   │   ├── helpers.js        # Helper functions
│   │   ├── utilities.js      # Utility functions
│   │   ├── cache.js          # Caching system
│   │   ├── database-helper.js # Database utilities
│   │   ├── command-handler.js # Command execution
│   │   └── event-handler.js  # Event management
│   ├── data/
│   │   ├── khmer-map.json    # Khmer romanization
│   │   └── bot.sqlite        # Database (created at runtime)
│   └── web/
│       └── dashboard.js      # Web dashboard
├── scripts/
│   └── register-commands.js  # Command registration script
└── render.yaml               # Render deployment config
```

---

## 🔧 Advanced Configuration

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

## 📊 Database Schema

The bot uses SQLite with the following tables:

- **guild_settings**: Server configuration
- **users**: User XP, levels, balance
- **warnings**: Moderation warnings
- **tickets**: Support tickets
- **giveaways**: Active giveaways
- **reminders**: User reminders
- **ai_memory**: AI conversation history
- **autoresponders**: Auto-response triggers
- **custom_commands**: Guild-specific commands
- **moderation_rules**: Server moderation rules

---

## 🌐 Web Dashboard

Access the dashboard at `http://localhost:8080` (when running locally)

Features:
- Server statistics
- User management
- Command statistics
- Configuration panel
- Leaderboards
- Recent activity logs

---

## 🚀 Deployment

### Render
The bot is pre-configured for Render deployment:
```bash
git push  # Deploy automatically
```

### Docker
```bash
docker build -t discord-ai-bot .
docker run -e DISCORD_TOKEN=xxx discord-ai-bot
```

### Self-Hosted
```bash
npm install
npm start
```

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

- **Issues**: [GitHub Issues](https://github.com/xandue077/Ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xandue077/Ai/discussions)
- **Discord**: Join our support server (link coming soon)

---

## 🙏 Acknowledgments

- [discord.js](https://discord.js.org/) - Discord API wrapper
- [Lavalink](https://github.com/lavalink-devs/Lavalink) - Music server
- [Groq](https://www.groq.com/) - AI API
- All contributors and supporters

---

## 📈 Status

- **Version**: 2.0.0
- **Status**: ✅ Active & Maintained
- **Last Updated**: 2026-08-30
- **Node.js Requirement**: 22.12+

---

**Made with ❤️ by xandue077**
