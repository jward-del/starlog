# ⬡ Starlog

**Personal intelligence journaling — powered by Claude AI.**

Starlog is an open-source PWA that transforms your daily thoughts into structured self-awareness. Voice-capture your entries, get AI-powered coaching, and watch patterns emerge across every area of your life.

---

## What It Does

- **Voice capture** — Say "Starlog" to start a new entry, speak freely, and Claude analyzes your words in real time
- **AI coaching** — Claude provides honest, personalized coaching based on your journal patterns
- **Cross-theme connections** — Discover how different life areas influence each other (Work affecting Mood, Decisions affecting Relationships, etc.)
- **Life balance radar** — Visual snapshot of how much attention you're giving each life area
- **Mood tracking** — Daily mood check-ins with trend charts over time
- **Weekly digest** — AI-generated weekly summary of your entries, growth, and intentions
- **Archive & search** — Full-text search across all your entries, organized by theme
- **Daily open streak** — Tracks consecutive days you use the app to build habit
- **News-based prompts** — Reflection questions tied to today's headlines
- **Plain text export** — One-tap export of all your data

---

## Self-Hosting in 5 Minutes

Starlog is designed to be self-hosted. You bring your own Claude API key — your data stays yours.

### Prerequisites
- Node.js 18+
- A [Vercel](https://vercel.com) account (free)
- An [Anthropic API key](https://console.anthropic.com)

### Option A: Deploy via Vercel (No GitHub Required)

1. Download the latest release zip from the [Releases](./releases) page
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Upload**
3. Drag the zip file into the upload area
4. Under **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = your_api_key_here
   ```
5. Click **Deploy** — done

### Option B: Deploy via GitHub

1. Fork this repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → **Import Git Repository**
3. Select your fork
4. Add environment variable: `ANTHROPIC_API_KEY`
5. Deploy

### Local Development

```bash
git clone https://github.com/yourusername/starlog
cd starlog
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com) |

---

## Architecture

```
starlog/
├── api/
│   ├── claude.js       # Secure Anthropic API proxy (Vercel serverless)
│   └── rss.js          # CORS-safe RSS fetching (Vercel serverless)
├── src/
│   ├── App.jsx         # Root component, state management
│   ├── views/
│   │   ├── Capture.jsx     # Voice journaling
│   │   ├── Coach.jsx       # AI coaching + cross-theme connections
│   │   ├── Analytics.jsx   # Life balance radar + mood trends
│   │   ├── Archive.jsx     # Entry history + search
│   │   ├── Digest.jsx      # Weekly AI digest
│   │   ├── NewsFeed.jsx    # Live RSS news feed
│   │   └── Prompts.jsx     # Reflection prompts
│   └── lib/
│       ├── api.js          # All Claude API calls
│       ├── constants.js    # Themes, moods, config
│       ├── styles.js       # Design tokens
│       └── utils.js        # Storage, formatting, streaks
└── public/
    └── icon.svg
```

---

## Data & Privacy

- **All journal entries are stored locally** in your browser's localStorage
- **No data is sent to any server** except your own Vercel deployment and the Anthropic API for analysis
- **Your Anthropic API key is never exposed** to the client — all API calls go through the secure `/api/claude` serverless function
- **One-tap export** gives you all your data as plain text at any time

---

## Contributing

Pull requests welcome. Some areas to explore:

- Native mobile wrapper (Capacitor or React Native)
- Apple Health / HealthKit integration
- Google Calendar OAuth integration
- Additional AI analysis models
- Multi-language support
- Better offline support / service worker

Please open an issue before starting large features.

---

## License

MIT — use it, fork it, make it yours.

---

*Inspired by the Captain's Log. Built for the examined life.*
