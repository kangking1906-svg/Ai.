# Changelog

## [2.0.0] - 2026-08-30

### Major Changes
- ✅ Complete project audit and restructuring
- ✅ Fixed critical scheduler memory leak (intervals now properly cleared on shutdown)
- ✅ Restored all corrupted/minified files with proper formatting
- ✅ Fixed package.json configuration issues (removed duplicates, corrected dependencies)
- ✅ Added comprehensive .gitignore to prevent secret/database leaks
- ✅ Improved error handling throughout entire codebase
- ✅ Added graceful shutdown with proper resource cleanup

### Breaking Changes
- Removed incompatible React/TypeScript frontend (was mixed into backend)
- Changed repository URL from xandue077/Ai to kangking1906-svg/Ai.
- Scheduler interval tracking changed from optional to required (fixed memory leak)

### New Features
- 🆕 `src/utils/permissions.js` - Reusable permission checking utilities
- 🆕 `src/utils/time.js` - Time formatting and parsing utilities (formatDuration, parseDuration, etc.)
- 🆕 `src/services/logging.js` - Guild event logging service with embed formatting
- 🆕 `src/services/voice.js` - Voice channel connection utilities
- 🆕 `.gitignore` - Comprehensive git ignore rules for Node.js/Discord bot
- 🆕 `DEPLOYMENT.md` - Complete deployment guide for Docker, Render, Railway, self-hosted
- 🆕 `CHANGELOG.md` - This file

### Fixed Bugs
- 🐛 **CRITICAL**: Scheduler memory leak - intervals not being cleared on process exit
- 🐛 Corrupted `src/commands/ai/chat.js` (minified single line)
- 🐛 Corrupted `src/commands/utility/help.js` (minified single line)
- 🐛 Corrupted `src/commands/moderation/mod.js` (minified single line)
- 🐛 Corrupted `src/utils/cooldown.js` (minified single line)
- 🐛 Corrupted `src/utils/khmer.js` (minified single line)
- 🐛 Corrupted `src/web/dashboard.js` (minified single line)
- 🐛 Package.json had duplicate `engines` field
- 🐛 Package.json repository URL pointed to wrong repository
- 🐛 Lavalink fallback to `console.log` instead of `logger`
- 🐛 Dashboard endpoint was not properly formatted

### Improvements
- 📈 Enhanced AI command error handling with better user feedback
- 📈 Improved moderation command with proper logging
- 📈 Better cooldown management with dedicated utility functions
- 📈 More robust database access patterns throughout
- 📈 Consistent error handling in all async functions
- 📈 Better logging throughout the application
- 📈 Improved shutdown sequence for graceful termination

### Security Improvements
- 🔒 Added `.gitignore` to prevent committing `.env` and database files
- 🔒 Improved validation of configuration values
- 🔒 Better error messages that don't expose sensitive info
- 🔒 Proper permission checking in admin/mod commands

### Documentation
- 📖 Completely rewrote README.md with correct repository URL
- 📖 Added comprehensive DEPLOYMENT.md with multiple platform guides
- 📖 Added inline code comments for better maintainability
- 📖 Improved environment variable documentation
- 📖 Added troubleshooting section

### Dependencies
- No version changes (all dependencies remain compatible)
- Verified compatibility with Node.js 22.12.0 - 24.x

### Performance
- ⚡ Reduced unnecessary callback allocations in event listeners
- ⚡ Improved database query efficiency in schedulers
- ⚡ Fixed memory leaks that would cause long-running instances to consume increasing RAM

### Testing
- ✅ Verified bot starts without errors
- ✅ Verified Discord login and command registration
- ✅ Verified database initialization
- ✅ Verified scheduler startup and graceful shutdown
- ✅ Verified lavalink initialization (with and without config)
- ✅ Verified HTTP server startup on port 8080
- ✅ Verified health check endpoint

### Migration Guide from v1.0.0

No data migration needed - database schema is compatible. Simply:
1. Update to v2.0.0
2. Copy `.env.example` to `.env` and fill in your values
3. Run `npm install` to ensure dependencies are current
4. Run `npm start` to begin

---

## [1.0.0] - Previous

Initial release with core features:
- Discord.js bot framework
- AI integration (Groq, Gemini, OpenRouter)
- Music playback with Lavalink
- TTS with Edge TTS and ElevenLabs
- Moderation system
- Economy and leveling
- Ticket system
- Giveaways
- And more...
