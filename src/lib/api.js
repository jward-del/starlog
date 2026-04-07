import { KEYS, TTL } from "./constants.js";
import { storage, stripHtml, formatDay, avgMood } from "./utils.js";

// ─── Core Claude API call (via secure Vercel proxy) ───────────────────────────
async function callClaude(body) {
  const res  = await fetch("/api/claude", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/** Extract JSON from Claude response content blocks */
function parseJSON(data) {
  const text = data.content
    ?.filter(b => b.type === "text")
    .map(b => b.text)
    .join("") || "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── RSS Feed ─────────────────────────────────────────────────────────────────
export async function fetchRSS(feedUrl) {
  const cacheKey = `${KEYS.rss}-${feedUrl.slice(-20)}`;
  const cached   = storage.get(cacheKey);

  if (cached?.ts && Date.now() - cached.ts < TTL.rss && cached.items?.length) {
    return cached.items;
  }

  const res  = await fetch(`/api/rss?url=${encodeURIComponent(feedUrl)}`);
  const data = await res.json();
  if (data.status !== "ok") throw new Error("RSS fetch failed");

  const items = (data.items || []).map(item => ({
    title:       stripHtml(item.title),
    link:        item.link,
    pubDate:     item.pubDate,
    description: stripHtml(item.description || "").slice(0, 200),
    source:      stripHtml(item.author || item.source || ""),
  }));

  storage.set(cacheKey, { ts: Date.now(), items });
  return items;
}

// ─── News Reflection Prompts ──────────────────────────────────────────────────
export async function fetchNewsPrompts() {
  const cached = storage.get(KEYS.news);
  if (cached?.ts && Date.now() - cached.ts < TTL.news && cached.prompts?.length) {
    return { prompts: cached.prompts, fromCache: true };
  }

  const data = await callClaude({
    model:     "claude-sonnet-4-20250514",
    max_tokens: 800,
    tools:     [{ type: "web_search_20250305", name: "web_search" }],
    messages:  [{
      role:    "user",
      content: `Search Google News for today's top 5 headlines.
Generate exactly 5 personal reflection questions — one per headline — that connect world events to someone's inner life and personal decisions.
Each question should be introspective, not political, and relevant to anyone.

Return ONLY valid JSON:
{
  "prompts": [
    {
      "headline": "short headline",
      "question": "personal reflection question?",
      "category": "Work|Values|Relationships|Mood|Goals|Challenges|Gratitude|Ideas|Clarity|Decision-Making"
    }
  ]
}`,
    }],
  });

  const { prompts = [] } = parseJSON(data);
  storage.set(KEYS.news, { ts: Date.now(), prompts });
  return { prompts, fromCache: false };
}

// ─── Entry Analysis ───────────────────────────────────────────────────────────
export async function analyzeEntry(text, mood) {
  const data = await callClaude({
    model:     "claude-sonnet-4-20250514",
    max_tokens: 350,
    messages:  [{
      role:    "user",
      content: `Analyze this journal entry. Return ONLY valid JSON with no extra text:
{
  "themes":      ["1–3 tags from: Goals|Clarity|Decision-Making|Health|Work|Mood|Relationships|Ideas|Challenges|Gratitude|Values|Patterns"],
  "observation": "The single most important insight. Max 16 words.",
  "tension":     "Core conflict in one short phrase. Max 9 words. Null if none.",
  "decisions":   ["1–2 reflection questions this entry implies. Max 11 words each."],
  "tone":        "One word: Avoidant|Decisive|Anxious|Curious|Reflective|Hopeful|Frustrated|Overwhelmed|Optimistic|Stuck"
}

Mood: ${mood}/5
Entry: "${text.replace(/"/g, "'")}"`,
    }],
  });

  return parseJSON(data);
}

// ─── Pattern Insights (across all entries) ────────────────────────────────────
export async function generateInsights(entries) {
  if (entries.length < 2) return null;

  const summaries = entries
    .slice(0, 12)
    .map(e => `[${formatDay(e.timestamp)}] Mood:${e.mood || 3}/5 Tone:${e.tone || "?"} | ${e.observation || e.text.slice(0, 70)}`)
    .join("\n");

  const data = await callClaude({
    model:     "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages:  [{
      role:    "user",
      content: `You are an insightful personal coach. Analyze these journal observations and return ONLY valid JSON:
{
  "summary":   "2–3 sentences on what's genuinely happening for this person right now. Address them as 'you'.",
  "patterns":  ["2–3 recurring theme phrases. Max 8 words each."],
  "blindspot": "One honest sentence on what seems missing or avoided in their thinking.",
  "questions": ["2–3 powerful questions to help them move forward."],
  "moodTrend": "One phrase describing their emotional arc across entries."
}

Entries:
${summaries}`,
    }],
  });

  return parseJSON(data);
}

// ─── Claude's Coaching View ───────────────────────────────────────────────────
export async function generateCoachView(entries) {
  if (!entries.length) return null;

  const context = entries
    .slice(0, 12)
    .map(e => `${formatDay(e.timestamp)} | Mood:${e.mood || 3}/5 | Tone:${e.tone || "?"} | Themes:${(e.themes || []).join(",")} | ${e.observation || e.text.slice(0, 80)}`)
    .join("\n");

  const data = await callClaude({
    model:     "claude-sonnet-4-20250514",
    max_tokens: 700,
    messages:  [{
      role:    "user",
      content: `You are a direct, warm, and insightful personal coach. Based on these journal entries, return ONLY valid JSON:
{
  "headline":       "Your single most important observation. Max 14 words.",
  "honest":         "3–4 sentences of honest, warm coaching addressed directly to 'you'. Be specific, not generic.",
  "focusAreas": [
    {
      "theme":  "theme name from their entries",
      "why":    "1–2 sentences on why this deserves attention right now.",
      "action": "One specific, concrete action they could take this week."
    }
  ],
  "strengthToLean": "One sentence on a strength you see that they may be underutilizing.",
  "watchOut":       "One sentence on a risk or pattern to watch out for."
}

Include 2–3 focus areas. Be specific, not generic.

Journal entries:
${context}`,
    }],
  });

  return parseJSON(data);
}

// ─── Cross-Theme Connections ──────────────────────────────────────────────────
export async function generateThemeConnections(entries) {
  if (entries.length < 3) return null;

  // Group entries by theme and build a compact context
  const byTheme = {};
  entries.slice(0, 20).forEach(e => {
    (e.themes || []).forEach(theme => {
      if (!byTheme[theme]) byTheme[theme] = [];
      byTheme[theme].push(e.observation || e.text.slice(0, 60));
    });
  });

  // Only include themes with at least 2 entries
  const richThemes = Object.entries(byTheme)
    .filter(([, obs]) => obs.length >= 2)
    .map(([theme, obs]) => `${theme}: ${obs.slice(0, 3).join(" | ")}`)
    .join("\n");

  if (!richThemes) return null;

  const data = await callClaude({
    model:      "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages:   [{
      role:    "user",
      content: `You are an insightful coach analyzing how themes in someone's life connect and influence each other. Based on these journal observations grouped by life theme, identify the most meaningful cross-theme patterns. Return ONLY valid JSON:
{
  "connections": [
    {
      "themes":   ["Theme A", "Theme B"],
      "insight":  "One clear sentence on how these two areas are influencing each other right now.",
      "question": "A powerful question that helps them see this connection more clearly."
    }
  ],
  "coreThread": "One sentence on the single underlying thread running through everything."
}

Include 2–3 connections. Focus on meaningful links, not obvious ones.

Theme observations:
${richThemes}`,
    }],
  });

  return parseJSON(data);
}

// ─── Weekly Digest ────────────────────────────────────────────────────────────
export async function generateWeeklyDigest(entries) {
  const weekAgo     = Date.now() - TTL.digest;
  const weekEntries = entries.filter(e => new Date(e.timestamp) > weekAgo);
  if (!weekEntries.length) return null;

  const mood = avgMood(weekEntries);
  const context = weekEntries
    .map(e => `${formatDay(e.timestamp)} | Mood:${e.mood || 3}/5 | Tone:${e.tone || "?"} | Themes:${(e.themes || []).join(",")} | ${e.observation || e.text.slice(0, 80)}`)
    .join("\n");

  const data = await callClaude({
    model:     "claude-sonnet-4-20250514",
    max_tokens: 700,
    messages:  [{
      role:    "user",
      content: `You are a warm, insightful coach writing a weekly summary. Based on this week's journal entries, return ONLY valid JSON:
{
  "title":     "A compelling, personal title for this week. Max 8 words.",
  "opening":   "A warm 2-sentence overview of this person's week, addressed as 'you'.",
  "highlights": ["2–3 most significant moments or realizations from their entries."],
  "growth":    "One sentence on growth or progress you notice this week.",
  "challenge": "One sentence on the biggest challenge or tension they carried.",
  "nextWeek":  "One specific, actionable intention to carry into next week.",
  "quote":     "A short, powerful quote from their own entries this week — their exact words."
}

Week entries (${weekEntries.length} total, avg mood ${mood}/5):
${context}`,
    }],
  });

  const digest   = parseJSON(data);
  const topThemes = [...new Set(weekEntries.flatMap(e => e.themes || []))].slice(0, 4);

  return {
    ...digest,
    generatedAt: new Date().toISOString(),
    entryCount:  weekEntries.length,
    avgMood:     mood,
    topThemes,
  };
}
