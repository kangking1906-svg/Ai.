# Development Guide

## Getting Started

### Prerequisites
- Node.js 22.12+
- npm or yarn
- Git
- A Discord bot token

### Local Setup

```bash
# Clone the repo
git clone https://github.com/kangking1906-svg/Ai.
cd Ai.

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your favorite editor

# Start development server with auto-reload
npm run dev
```

---

## Project Structure

```
Ai.
├── index.js                    # Application entry point
├── package.json                # Dependencies and scripts
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── DEPLOYMENT.md               # Deployment guide
├── CHANGELOG.md                # Version history
├── Dockerfile                  # Docker configuration
├── src/
│   ├── config/                 # Configuration management
│   ├── database/               # Database initialization
│   ├── services/               # Business logic services
│   ├── commands/               # Discord slash commands
│   ├── events/                 # Discord event handlers
│   ├── utils/                  # Utility functions
│   ├── data/                   # Data files (maps, etc.)
│   └── web/                    # Web dashboard/API
└── scripts/                    # Utility scripts
```

---

## Creating Commands

Commands are Discord slash commands. Create a new file in `src/commands/<category>/`:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Does something cool')
    .addStringOption(option =>
      option
        .setName('input')
        .setDescription('User input')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.reply('Hello!');
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Error!', ephemeral: true });
    }
  }
};
```

Commands are automatically loaded by `src/utils/command-loader.js`.

---

## Creating Events

Create a new file in `src/events/`:

```javascript
const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) return;
    console.log(`Message from ${message.author}: ${message.content}`);
  }
};
```

---

## Database Access

Use the database helper:

```javascript
const { getDb, ensureGuild } = require('./database');

// Get database instance
const db = getDb();

// Ensure guild exists in settings
ensureGuild(guildId);

// Query data
const user = db.prepare(
  'SELECT * FROM users WHERE guild_id = ? AND user_id = ?'
).get(guildId, userId);

// Insert/update data
db.prepare(
  'INSERT OR REPLACE INTO users (guild_id, user_id, balance) VALUES (?, ?, ?)'
).run(guildId, userId, 1000);
```

---

## Logging

Use the logger throughout your code:

```javascript
const { logger } = require('./utils/logger');

logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.debug('Debug message');

// Structured logging
logger.command('commandName', 'user#1234', 'Server Name');
logger.event('eventName', 'Event details');
logger.database('action', 'Details');
```

---

## Configuration

Access config in your code:

```javascript
const config = require('./config');

console.log(config.discordToken);
console.log(config.ai.provider);
console.log(config.features.aiEnabled);
```

Configuration is loaded from `.env` and falls back to sensible defaults.

---

## Error Handling

Always wrap async operations:

```javascript
async execute(interaction) {
  try {
    // Your code here
    await interaction.reply('Success!');
  } catch (error) {
    logger.error('Command error', error);
    
    // Send safe error message to user
    const message = error.message || 'An error occurred';
    try {
      if (interaction.deferred) {
        await interaction.editReply(`❌ ${message}`);
      } else {
        await interaction.reply({
          content: `❌ ${message}`,
          ephemeral: true
        });
      }
    } catch (e) {
      logger.error('Failed to send error reply', e);
    }
  }
}
```

---

## Testing

### Manual Testing

1. Start bot: `npm run dev`
2. Invite bot to test server
3. Test commands in Discord
4. Check logs for errors
5. Verify database changes

### Syntax Checking

```bash
# Check for syntax errors
npm run lint
```

---

## Common Tasks

### Register Commands
```bash
npm run register
```

### View Bot Logs
```bash
# When running with npm start
# Check console output

# With docker
docker logs -f container_name
```

### Reset Database
```bash
rm data/bot.sqlite
npm start
```

### Check Bot Status
```bash
curl http://localhost:8080/health
```

---

## Environment Variables Quick Reference

**Required:**
- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your Discord application client ID
- `BOT_OWNER_ID` - Your Discord user ID

**Optional but Recommended:**
- `AI_PROVIDER` - `groq`, `gemini`, or `openrouter`
- `AI_API_KEY` - Your AI provider API key
- `LOG_LEVEL` - `debug`, `info`, `warn`, `error`
- `TTS_PROVIDER` - `edge` or `elevenlabs`

See `.env.example` for all options.

---

## Code Style

- Use 2-space indentation
- Use meaningful variable names
- Add comments for complex logic
- Handle errors gracefully
- Log important events
- Don't commit secrets

---

## Performance Tips

1. **Cache frequently accessed data** - Use the cache utilities
2. **Batch database queries** - Multiple reads in one transaction
3. **Avoid blocking operations** - Keep everything async
4. **Monitor memory usage** - Check logs for leaks
5. **Limit API requests** - Use rate limiting and cooldowns

---

## Debugging

### Enable Debug Logging
```env
LOG_LEVEL=debug
```

### Check Database
```bash
# Install sqlite3 CLI
sudo apt-get install sqlite3

# Open database
sqlite3 data/bot.sqlite

# Run queries
.tables
SELECT * FROM users LIMIT 5;
```

### Node Inspector
```bash
node --inspect index.js
# Then open chrome://inspect in Chrome
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages: `git commit -m "feat: add new feature"`
5. Push to your fork
6. Create a pull request

---

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database locked
- Only one process can access database at a time
- Kill any background processes
- Restart bot

### Commands not showing
- Wait 5+ minutes
- Run `npm run register`
- Restart bot

### Memory leak
- Check scheduler intervals are cleared properly
- Look for unbounded Map/Set growth
- Monitor `process.memoryUsage()`

---

For more help, check logs and open an issue on GitHub.
