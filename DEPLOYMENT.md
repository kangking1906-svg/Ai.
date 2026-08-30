# Deployment Guide

## Table of Contents
1. [Docker Deployment](#docker-deployment)
2. [Render.com](#rendercom)
3. [Railway](#railway)
4. [Self-Hosted](#self-hosted)
5. [Environment Configuration](#environment-configuration)

---

## Docker Deployment

### Build the Docker Image

```bash
docker build -t discord-ai-bot:latest .
```

### Run the Container

```bash
docker run \
  -e DISCORD_TOKEN=your_token \
  -e CLIENT_ID=your_client_id \
  -e BOT_OWNER_ID=your_user_id \
  -e AI_PROVIDER=groq \
  -e AI_API_KEY=your_api_key \
  -v discord-bot-data:/app/data \
  --name discord-bot \
  discord-ai-bot:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  bot:
    build: .
    container_name: discord-ai-bot
    environment:
      DISCORD_TOKEN: ${DISCORD_TOKEN}
      CLIENT_ID: ${CLIENT_ID}
      BOT_OWNER_ID: ${BOT_OWNER_ID}
      AI_PROVIDER: groq
      AI_API_KEY: ${AI_API_KEY}
      PORT: 8080
    volumes:
      - bot-data:/app/data
    ports:
      - "8080:8080"
    restart: unless-stopped

volumes:
  bot-data:
```

Start with:
```bash
docker-compose up -d
```

---

## Render.com

The bot includes `render.yaml` for automated deployment.

### Setup Instructions

1. Push your code to GitHub
2. Sign up at [render.com](https://render.com)
3. Create new "Web Service" from GitHub repo
4. Select this repository
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Node Version**: 22.12.0

6. Add environment variables in dashboard:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `BOT_OWNER_ID`
   - `AI_PROVIDER`
   - `AI_API_KEY`

7. Deploy!

### Auto-Deploy on Push

Enable "Auto-Deploy" in Render dashboard to automatically deploy when you push to main branch.

---

## Railway

The bot includes `railway.json` for Railway.app deployment.

### Setup Instructions

1. Push to GitHub
2. Sign up at [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Railway auto-detects Node.js setup
5. Add environment variables
6. Deploy!

---

## Self-Hosted

### Linux/Ubuntu

```bash
# Install Node.js 22 (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/kangking1906-svg/Ai.
cd Ai.

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your settings
nano .env

# Start bot
npm start
```

### Windows

1. Install [Node.js 22.12+](https://nodejs.org/)
2. Clone repository:
   ```cmd
   git clone https://github.com/kangking1906-svg/Ai.
   cd Ai.
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Copy and edit `.env`:
   ```cmd
   copy .env.example .env
   notepad .env
   ```
5. Start bot:
   ```cmd
   npm start
   ```

### macOS

```bash
# Install Node.js with Homebrew
brew install node@22

# Clone and setup
git clone https://github.com/kangking1906-svg/Ai.
cd Ai.
npm install
cp .env.example .env

# Edit .env
nano .env

# Start
npm start
```

### Running as a Service (Linux)

Create `/etc/systemd/system/discord-bot.service`:

```ini
[Unit]
Description=Discord AI Bot
After=network.target

[Service]
Type=simple
User=bot
WorkingDirectory=/home/bot/Ai.
ExecStart=/usr/bin/node /home/bot/Ai./index.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable discord-bot
sudo systemctl start discord-bot
sudo systemctl status discord-bot
```

---

## Environment Configuration

### Minimal Setup (Required)

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
BOT_OWNER_ID=your_user_id
```

### Recommended Setup

```env
# Discord
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
BOT_OWNER_ID=your_user_id

# Server
PORT=8080
LOG_LEVEL=info

# AI (Groq recommended for free tier)
AI_PROVIDER=groq
AI_API_KEY=your_groq_key
AI_MODEL=llama-3.3-70b-versatile

# TTS
TTS_PROVIDER=edge

# Music (optional - leave empty to disable)
LAVALINK_HOST=
LAVALINK_PORT=2333
LAVALINK_PASSWORD=

# Features
FEATURE_AI=true
FEATURE_MUSIC=true
FEATURE_TTS=true
FEATURE_MODERATION=true
FEATURE_ECONOMY=true
FEATURE_LEVELS=true
```

### Full Production Setup

See `.env.example` for all 200+ configuration options.

---

## Monitoring and Logs

### Docker Logs
```bash
docker logs -f discord-bot
```

### Render Logs
View in Render dashboard under "Logs" tab

### Railway Logs
View in Railway dashboard under "Deploy" tab

### System Service Logs
```bash
journalctl -u discord-bot -f
```

---

## Health Checks

Bot exposes health endpoint:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "ok": true,
  "uptime": 3600,
  "discordReady": true,
  "guilds": 5,
  "users": 1500,
  "lavalink": "connected"
}
```

---

## Troubleshooting Deployment

### Bot crashes on startup
1. Check logs for error message
2. Verify all required environment variables are set
3. Ensure DISCORD_TOKEN is valid
4. Check Node.js version: `node --version` (need 22.12+)

### Commands not registering
1. Wait 5 minutes after first startup
2. Run `npm run register` to force re-registration
3. Check CLIENT_ID is correct
4. Verify bot has `applications.commands` scope

### High memory usage
1. Reduce `AI_CONTEXT_MESSAGES` (default: 10)
2. Ensure database maintenance runs (automatic)
3. Check for memory leaks in logs

### Database locked errors
1. Only one bot instance should run at a time
2. Ensure previous instance fully stopped before restart

---

## Best Practices

1. **Always use HTTPS** in production
2. **Enable 2FA** on Discord account
3. **Rotate tokens** periodically
4. **Monitor uptime** and set alerts
5. **Regular backups** of database
6. **Keep Node.js updated** for security patches
7. **Use staging environment** before production changes
8. **Log all changes** for audit trail

---

## Cost Estimation

- **Render**: ~$7-12/month (free tier with limitations)
- **Railway**: Pay-as-you-go, typically $5-15/month
- **Docker VPS**: $5-10/month (DigitalOcean, Linode, etc.)
- **AWS Lambda**: Extremely cheap for light usage

Choose based on your bot's activity level and persistence requirements.
