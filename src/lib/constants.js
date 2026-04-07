// ─── App Version ─────────────────────────────────────────────────────────────
export const VERSION = "1.3.0";

export const WHATS_NEW = [
  "Analytics tab with Life Balance Radar chart",
  "Daily open streak — tracks every day you use the app",
  "Cross-Theme Connections in My Coach view",
  "Google Calendar connect (OAuth coming soon)",
];

// ─── Storage Keys ────────────────────────────────────────────────────────────
export const KEYS = {
  entries: "starlog-entries",
  news:    "starlog-news",
  rss:     "starlog-rss",
  digest:  "starlog-digest",
};

// ─── Cache TTLs (ms) ─────────────────────────────────────────────────────────
export const TTL = {
  news:   1000 * 60 * 60 * 6,  // 6 hours
  rss:    1000 * 60 * 30,       // 30 minutes
  digest: 1000 * 60 * 60 * 24 * 7, // 7 days
};

// ─── RSS Feeds ───────────────────────────────────────────────────────────────
export const RSS_FEEDS = [
  { label: "Top Stories", url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en" },
  { label: "Business",    url: "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en" },
  { label: "Technology",  url: "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en" },
  { label: "Health",      url: "https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en" },
  { label: "Science",     url: "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en" },
];

// ─── Moods ───────────────────────────────────────────────────────────────────
export const MOODS = [
  { label: "Struggling", emoji: "😔", value: 1, color: "#FF3B30" },
  { label: "Unsettled",  emoji: "😕", value: 2, color: "#FF9500" },
  { label: "Neutral",    emoji: "😐", value: 3, color: "#FFCC00" },
  { label: "Good",       emoji: "🙂", value: 4, color: "#34C759" },
  { label: "Thriving",   emoji: "😄", value: 5, color: "#007AFF" },
];

// ─── Theme Buckets ───────────────────────────────────────────────────────────
export const THEMES = {
  "Goals":           { icon: "🎯", color: "#007AFF" },
  "Clarity":         { icon: "💡", color: "#5AC8FA" },
  "Decision-Making": { icon: "⚖️",  color: "#FF9500" },
  "Health":          { icon: "❤️",  color: "#FF3B30" },
  "Work":            { icon: "💼", color: "#5856D6" },
  "Mood":            { icon: "🌊", color: "#34C759" },
  "Relationships":   { icon: "🤝", color: "#FF2D55" },
  "Ideas":           { icon: "✨", color: "#AF52DE" },
  "Challenges":      { icon: "⚡", color: "#FF6B00" },
  "Gratitude":       { icon: "🌟", color: "#FFCC00" },
  "Values":          { icon: "🧭", color: "#30B0C7" },
  "Patterns":        { icon: "🔄", color: "#636366" },
};

// ─── Life Balance Areas ───────────────────────────────────────────────────────
export const LIFE_AREAS = [
  { key: "Work",          label: "Work",    icon: "💼", color: "#5856D6" },
  { key: "Health",        label: "Health",  icon: "❤️",  color: "#FF3B30" },
  { key: "Relationships", label: "People",  icon: "🤝", color: "#FF2D55" },
  { key: "Goals",         label: "Goals",   icon: "🎯", color: "#007AFF" },
  { key: "Mood",          label: "Mood",    icon: "🌊", color: "#34C759" },
  { key: "Values",        label: "Values",  icon: "🧭", color: "#30B0C7" },
];

// ─── Reflection Prompts ───────────────────────────────────────────────────────
export const CLASSIC_PROMPTS = [
  { q: "What's been weighing on your mind lately?",           cat: "Mood" },
  { q: "What decision are you avoiding right now?",           cat: "Decision-Making" },
  { q: "What pattern keeps showing up in your life?",         cat: "Patterns" },
  { q: "What do you wish someone would tell you today?",      cat: "Clarity" },
  { q: "What are you not saying out loud?",                   cat: "Relationships" },
  { q: "Where are you feeling stuck, and why?",               cat: "Challenges" },
  { q: "What would the best version of you do differently?",  cat: "Goals" },
  { q: "What are you most grateful for right now?",           cat: "Gratitude" },
  { q: "What belief is holding you back?",                    cat: "Values" },
  { q: "What energizes vs. drains you lately?",               cat: "Health" },
  { q: "What would you do if you knew you couldn't fail?",    cat: "Goals" },
  { q: "Where are you being too hard on yourself?",           cat: "Mood" },
];

// ─── Nav Tabs ─────────────────────────────────────────────────────────────────
export const NAV_TABS = [
  { key: "capture",   label: "Capture",   icon: "✍️" },
  { key: "feed",      label: "News",      icon: "📡" },
  { key: "prompts",   label: "Prompts",   icon: "💭" },
  { key: "archive",   label: "Archive",   icon: "📚" },
  { key: "coach",     label: "My Coach",  icon: "🔮" },
  { key: "analytics", label: "Analytics", icon: "📊" },
];

// ─── Seed Entry ───────────────────────────────────────────────────────────────
export const SEED_ENTRY = {
  id: 1,
  stardate: "2026.082.6",
  timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  text: "The main purpose of this app is to take my thoughts and combine them into themes so I can make more informed decisions about what's going on in my head day to day. I want an archive of each entry, an analysis of key themes, and the ability to categorize everything into buckets that help me make better decisions.",
  themes: ["Goals", "Clarity", "Decision-Making"],
  mood: 4,
  observation: "Seeking a system to transform scattered thoughts into structured self-awareness.",
  tension: "Raw thinking vs. structured, actionable insight",
  decisions: [
    "What does 'making better decisions' actually look like for me?",
    "How do I build a consistent daily reflection habit?",
  ],
  tone: "Intentional",
};
