# Starlog Deployment Guide

## Quickest Path: Direct Vercel Upload (No GitHub Required)

1. Go to [vercel.com](https://vercel.com) and sign in (use Google or Apple)
2. Click **Add New Project**
3. Choose **Upload** (not "Import Git Repository")
4. Drag and drop the `starlog-deploy-v1.3.0.zip` file
5. Vercel detects it's a Vite project automatically
6. Before clicking Deploy, click **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from [console.anthropic.com](https://console.anthropic.com)
7. Click **Deploy**
8. In ~2 minutes, your app is live at a `.vercel.app` URL

That's it. Your app is live.

---

## GitHub Deploy (Optional, for ongoing updates)

If you want to push updates easily in the future:

1. Create a GitHub account at [github.com](https://github.com) (use Sign in with Apple or Google)
2. Create a new repository called `starlog` (set to Private if preferred)
3. Upload the zip contents to the repo (GitHub has a web uploader — no command line needed)
4. In Vercel → **Add New Project** → **Import Git Repository** → select your repo
5. Add `ANTHROPIC_API_KEY` environment variable
6. Deploy

Future updates: push to GitHub, Vercel auto-deploys.

---

## Getting Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. Paste it into Vercel as `ANTHROPIC_API_KEY`

---

## Custom Domain (Optional)

In Vercel → your project → **Settings** → **Domains** → add your domain. Free SSL included.

---

## Troubleshooting

**App loads but AI features don't work:**
Check that `ANTHROPIC_API_KEY` is set correctly in Vercel → Settings → Environment Variables. Redeploy after adding it.

**Voice capture not working:**
Requires HTTPS (Vercel provides this automatically). Won't work on `localhost` in some browsers.

**Entries disappearing:**
Entries are stored in your browser's localStorage. Clearing browser data will clear entries. Use the Export button regularly.
