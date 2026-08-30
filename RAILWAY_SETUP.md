# 🚀 Railway Deployment Guide

## Quick Start

### Prerequisites
- GitHub account with this repository pushed
- Railway account (free at [railway.app](https://railway.app))
- Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- Discord Client ID

### Step 1: Deploy to Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account
5. Select the `xander010509/Ai` repository
6. Click **"Deploy Now"**

Railway will automatically:
- ✅ Detect Node.js project
- ✅ Install dependencies via `npm install`
- ✅ Build the bot
- ✅ Start with `npm start`

### Step 2: Configure Environment Variables

In Railway Dashboard:

1. Go to your project
2. Click on the bot service
3. Go to **"Variables"** tab
4. Add these required variables:

```
DISCORD_TOKEN=<your_bot_token>
CLIENT_ID=<your_client_id>
BOT_OWNER_ID=<your_discord_user_id>
PORT=8080
NODE_ENV=production
```

#### Optional Variables (for features):
```
# AI Features
AI_PROVIDER=groq          # or gemini, openrouter, none
AI_API_KEY=<your_api_key>
AI_MODEL=llama-3.3-70b-versatile

# TTS Features
TTS_PROVIDER=edge         # or elevenlabs
TTS_API_KEY=<elevenlabs_key_if_using_elevenlabs>

# Features Toggle
FEATURE_AI=true
FEATURE_MUSIC=true
FEATURE_TTS=true
FEATURE_MODERATION=true
FEATURE_ECONOMY=true
FEATURE_LEVELS=true
FEATURE_TICKETS=true
FEATURE_GIVEAWAYS=true
```

5. Click **"Save"** - bot will auto-restart with new variables

### Step 3: Verify Deployment

Check if bot is running:
```bash
curl https://your-railway-domain.up.railway.app/health
```

Expected response:
```json
{
  "ok": true,
  "uptime": 123.45,
  "discordReady": true,
  "guilds": 5,
  "users": 100,
  "lavalink": "not-created",
  "timestamp": "2026-08-30T10:00:00.000Z",
  "version": "2.0.0"
}
```

### Step 4: Invite Bot to Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** → **URL Generator**
4. Select scopes: `bot`, `applications.commands`
5. Select permissions:
   - Send Messages
   - Embed Links
   - Manage Messages
   - Moderate Members
   - Read Message History
   - Connect (Voice)
   - Speak (Voice)
6. Copy generated URL and open in browser
7. Select server to invite bot

## Monitoring

### View Logs
```
Railway Dashboard → Your Service → Logs Tab
```

Look for:
- ✅ `🚀 Initializing Discord AI Bot...`
- ✅ `📊 Database initialized successfully`
- ✅ `✅ Lavalink manager initialized successfully`
- ✅ `✅ Slash commands registered successfully`

### Common Issues

#### Bot Won't Start
**Error**: `DISCORD_TOKEN is missing`
- Solution: Add `DISCORD_TOKEN` to Railway Variables (don't leave empty)

**Error**: `CLIENT_ID is missing`
- Solution: Add `CLIENT_ID` to Railway Variables

#### Memory Issues
Railway free tier: 512MB memory
- Solution: Upgrade to Railway Pro ($5/month)

#### Database Errors
- Railway restarts containers, so `/data` directory resets
- Solution: Implement cloud database (coming soon) or upgrade to persistent storage

#### Build Fails
- Check logs for dependency errors
- Run locally: `npm install` to verify

### Performance Optimization

1. **Disable unused features** in .env:
```
FEATURE_MUSIC=false
FEATURE_DASHBOARD=false
```

2. **Set log level** to reduce overhead:
```
LOG_LEVEL=warn
```

3. **Optimize database** with indexes

4. **Use Railway Pro** for more resources

## Advanced Configuration

### Custom Domain
1. Go to Railway Dashboard → Project Settings
2. Add custom domain
3. Configure DNS records

### Database Persistence
Current: SQLite (stores in `/data`, lost on restart)
Options:
- PostgreSQL plugin (paid)
- Cloud storage integration

### GitHub Auto-Deploy
✅ Already enabled! Every push to main branch triggers:
1. Build
2. Test
3. Deploy

## Rollback

If deployment breaks:

1. Railway Dashboard → Deployments tab
2. Find previous working deployment
3. Click "Redeploy"

## Pricing

| Tier | Cost | RAM | Features |
|------|------|-----|----------|
| Free | Free | 512MB | Basic bot |
| Pro | $5/mo | 8GB | Persistent storage |
| Enterprise | Custom | Unlimited | Full support |

## Support

- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Issues: [github.com/xander010509/Ai/issues](https://github.com/xander010509/Ai/issues)

---

**Happy Deploying! 🎉**
