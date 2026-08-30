# 🚀 Deployment Guide - All-in-One Discord AI Bot v2.0

## Table of Contents
1. [Local Development](#local-development)
2. [Render Deployment](#render-deployment)
3. [Docker Deployment](#docker-deployment)
4. [VPS Deployment](#vps-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Setup

```bash
# Clone the repository
git clone https://github.com/xandue077/Ai.git
cd Ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit with your configuration
nano .env  # or use your preferred editor
```

### Required Environment Variables

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
BOT_OWNER_ID=your_user_id
```

### Running

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev
```

### Health Check

```bash
# Check if bot is running
curl http://localhost:8080/health

# Should return:
# {"ok":true,"uptime":123.45,...}
```

---

## Render Deployment

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `discord-ai-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables (same as .env)
6. Click "Create Web Service"

### Step 3: Set Environment Variables

1. Go to Settings → Environment
2. Add all variables from `.env.example`
3. Click "Save"

### Benefits
- ✅ Free tier available
- ✅ Auto-deploy on git push
- ✅ No credit card for free tier
- ✅ Good uptime

### Limitations
- ❌ Free tier spins down after 15 minutes of inactivity
- ❌ Limited to 750 hours/month
- Solution: Use paid tier or upgrade to Pro ($7/month)

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

### Create docker-compose.yml

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
      AI_PROVIDER: ${AI_PROVIDER}
      AI_API_KEY: ${AI_API_KEY}
      TTS_PROVIDER: ${TTS_PROVIDER}
      PORT: 8080
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    networks:
      - discord-bot

networks:
  discord-bot:
    driver: bridge
```

### Run Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## VPS Deployment

### Recommended: Ubuntu 22.04 LTS

### Step 1: Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install git
sudo apt install -y git

# Verify installation
node --version  # Should be v22.x.x
npm --version   # Should be 10.x.x or higher
```

### Step 2: Deploy Bot

```bash
# Create app directory
sudo mkdir -p /opt/discord-bot
cd /opt/discord-bot

# Clone repository
sudo git clone https://github.com/xandue077/Ai.git .

# Install dependencies
sudo npm ci --only=production

# Create .env file
sudo cp .env.example .env
sudo nano .env  # Edit with your configuration

# Set permissions
sudo chown -R $USER:$USER /opt/discord-bot
```

### Step 3: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start bot with PM2
cd /opt/discord-bot
pm2 start index.js --name "discord-ai-bot"

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup

# View logs
pm2 logs discord-ai-bot

# Monitor
pm2 monit
```

### Step 4: Setup Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/discord-bot
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/discord-bot /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: Setup SSL (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Useful PM2 Commands

```bash
# List running processes
pm2 list

# Restart bot
pm2 restart discord-ai-bot

# Stop bot
pm2 stop discord-ai-bot

# Start bot
pm2 start discord-ai-bot

# View logs (last 100 lines)
pm2 logs discord-ai-bot --lines 100

# Flush logs
pm2 flush
```

---

## Troubleshooting

### Bot Won't Start

**Error: "DISCORD_TOKEN is missing"**
```bash
# Check .env file exists
ls -la .env

# Verify token is set
grep DISCORD_TOKEN .env

# Make sure it's not commented out
```

**Error: "Client ID mismatch"**
```bash
# Get correct values from:
# https://discord.com/developers/applications
# 1. Select your application
# 2. Copy Client ID and update .env
```

### Database Errors

**"Cannot create database file"**
```bash
# Create data directory
mkdir -p ./data
chmod 755 ./data

# Remove existing database and restart
rm ./data/bot.sqlite
```

### Memory Issues

```bash
# Check memory usage
free -h

# Limit Node.js memory
NODE_OPTIONS="--max-old-space-size=512" npm start
```

### High CPU Usage

```bash
# Kill and restart bot
pm2 restart discord-ai-bot

# Check logs for errors
pm2 logs discord-ai-bot

# Reduce scheduler frequency if needed
```

### Commands Not Registering

```bash
# Force re-register commands
AUTO_REGISTER_COMMANDS=true npm start

# Wait 5-10 minutes for Discord to sync

# If still not working:
# 1. Check bot has applications.commands scope
# 2. Check bot has permission in guild
# 3. Restart bot
```

### Connection Issues

```bash
# Test Discord connection
curl -I https://discord.com/api/v10/gateway

# Check network connectivity
ping google.com

# Check firewall isn't blocking
sudo ufw status
```

### AI/TTS Not Working

```bash
# Verify API key is set
grep AI_API_KEY .env
grep TTS_API_KEY .env

# Check API key validity
# Visit provider website to verify key is active

# Check rate limits
# Look at bot logs for 429/quota errors
```

---

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "ok": true,
  "uptime": 3600.5,
  "discordReady": true,
  "guilds": 42,
  "users": 5000,
  "lavalink": "connected",
  "timestamp": "2026-08-30T10:00:00.000Z"
}
```

### Log Monitoring

```bash
# Real-time logs (PM2)
pm2 logs discord-ai-bot --follow

# Filter by log level
pm2 logs discord-ai-bot | grep "ERROR"
```

### Uptime Monitoring

Use services like:
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://pingdom.com) - Paid
- [StatusPage](https://www.statuspage.io/) - Paid

Monitor endpoint: `http://your-domain/health`

---

## Performance Tips

1. **Enable Caching**: Already built-in, reduces database queries
2. **Use Rate Limiting**: Configured in .env
3. **Optimize Database**: Use indexes on frequently queried fields
4. **Monitor Memory**: Set memory limit in PM2 ecosystem.config.js
5. **Use CDN**: For static assets if using web dashboard
6. **Compress Responses**: Already enabled in Express

---

## Security Best Practices

1. ✅ **Never commit .env file**
2. ✅ **Use strong bot token** (rotate if exposed)
3. ✅ **Limit permissions** - Only grant needed permissions
4. ✅ **Use HTTPS** - Enable SSL in production
5. ✅ **Keep dependencies updated** - Run `npm audit` regularly
6. ✅ **Use environment variables** - Never hardcode secrets
7. ✅ **Enable 2FA** - On your Discord account

---

## Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/xandue077/Ai/issues)
- **Discord Community**: Join our support server (coming soon)
- **Documentation**: Check README.md for detailed info

---

**Last Updated**: 2026-08-30
