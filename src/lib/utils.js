import { MOODS } from "./constants.js";

// ─── Date & Time ─────────────────────────────────────────────────────────────
export function stardate() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day   = Math.floor((now - start) / 86400000);
  const frac  = ((now.getHours() * 60 + now.getMinutes()) / 1440).toFixed(1).slice(1);
  return `${now.getFullYear()}.${day}${frac}`;
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

export function formatDay(iso) {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export function formatWeek(iso) {
  return `Week of ${new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  })}`;
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Streak ───────────────────────────────────────────────────────────────────
/** Track consecutive days the app was opened (stored in localStorage) */
export function trackOpenAndGetStreak() {
  const key   = "starlog-open-days";
  const today = new Date().toDateString();
  const raw   = storage.get(key) || { days: [], last: null };

  if (raw.last !== today) {
    raw.days = [...new Set([today, ...(raw.days || [])])].slice(0, 365);
    raw.last = today;
    storage.set(key, raw);
  }

  const days = new Set(raw.days);
  let streak  = 0;
  let day     = new Date();
  while (days.has(day.toDateString())) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

export function getStreak(entries) {
  if (!entries.length) return 0;
  const days = new Set(entries.map(e => new Date(e.timestamp).toDateString()));
  let streak = 0;
  let day    = new Date();
  while (days.has(day.toDateString())) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}

// ─── String ───────────────────────────────────────────────────────────────────
export function stripHtml(str = "") {
  return str
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g,  "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .trim();
}

// ─── Mood Helpers ─────────────────────────────────────────────────────────────
export function getMood(value) {
  return MOODS.find(m => m.value === value);
}

export function avgMood(entries) {
  if (!entries.length) return null;
  return (entries.reduce((sum, e) => sum + (e.mood || 3), 0) / entries.length).toFixed(1);
}

// ─── Entry Grouping ───────────────────────────────────────────────────────────
export function groupByDay(entries) {
  return entries.reduce((acc, entry) => {
    const key = new Date(entry.timestamp).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});
}

// ─── localStorage Wrapper ─────────────────────────────────────────────────────
export const storage = {
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  },
};

// ─── Export Entries ───────────────────────────────────────────────────────────
export function exportEntries(entries) {
  const lines = entries.map(e => [
    `${formatDateTime(e.timestamp)} — Stardate ${e.stardate}`,
    `Mood: ${getMood(e.mood)?.label || "—"} | Tone: ${e.tone || "—"}`,
    `Themes: ${(e.themes || []).join(", ")}`,
    `Insight: ${e.observation}`,
    e.tension    ? `Tension: ${e.tension}` : null,
    e.decisions?.length
      ? `Questions:\n${e.decisions.map(d => `  • ${d}`).join("\n")}`
      : null,
    "",
    e.text,
    "\n" + "─".repeat(52),
  ].filter(Boolean).join("\n")).join("\n\n");

  const header = `Personal Starlog\nExported: ${new Date().toLocaleString()}\n${"═".repeat(52)}\n\n`;
  const blob   = new Blob([header + lines], { type: "text/plain" });
  const a      = document.createElement("a");
  a.href       = URL.createObjectURL(blob);
  a.download   = `starlog-${Date.now()}.txt`;
  a.click();
}
