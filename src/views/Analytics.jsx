import { useState, useEffect } from "react";
import { tokens, cardStyle } from "../lib/styles.js";
import { THEMES, LIFE_AREAS, KEYS } from "../lib/constants.js";
import { SectionHeader, EmptyState, TintedCard } from "../components/index.jsx";
import { storage } from "../lib/utils.js";

// ─── Life Balance Radar ───────────────────────────────────────────────────────
function RadarChart({ scores }) {
  const size   = 200;
  const cx     = size / 2;
  const cy     = size / 2;
  const r      = 80;
  const areas  = LIFE_AREAS;
  const n      = areas.length;

  const angleFor = i => (Math.PI * 2 * i) / n - Math.PI / 2;

  const pointFor = (i, pct) => {
    const a = angleFor(i);
    return { x: cx + r * pct * Math.cos(a), y: cy + r * pct * Math.sin(a) };
  };

  const gridPts = pct =>
    areas.map((_, i) => pointFor(i, pct)).map(p => `${p.x},${p.y}`).join(" ");

  const dataPts = areas
    .map((area, i) => pointFor(i, (scores[area.key] || 0) / 100))
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(pct => (
        <polygon key={pct} points={gridPts(pct)}
          fill="none" stroke={`${tokens.blue}18`} strokeWidth={1} />
      ))}
      {/* Axes */}
      {areas.map((_, i) => {
        const p = pointFor(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke={`${tokens.blue}20`} strokeWidth={1} />;
      })}
      {/* Data area */}
      <polygon points={dataPts}
        fill={`${tokens.blue}20`} stroke={tokens.blue} strokeWidth={2} strokeLinejoin="round" />
      {/* Dots */}
      {areas.map((area, i) => {
        const p = pointFor(i, (scores[area.key] || 0) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill={area.color} />;
      })}
      {/* Labels */}
      {areas.map((area, i) => {
        const p = pointFor(i, 1.22);
        return (
          <text key={i} x={p.x} y={p.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill={tokens.sub}
            fontFamily="'SF Pro Text', sans-serif"
            fontWeight={600}
          >
            {area.icon} {area.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Mood trend sparkline ─────────────────────────────────────────────────────
function MoodSparkline({ entries }) {
  const last7 = entries.slice(0, 7).reverse();
  if (last7.length < 2) return null;

  const W = 300, H = 60;
  const step = W / (last7.length - 1);
  const pts = last7.map((e, i) => ({
    x: i * step,
    y: H - ((e.mood || 3) / 5) * H,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fill = `${d} L${pts[pts.length - 1].x},${H} L0,${H} Z`;

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${tokens.blue}60`} />
            <stop offset="100%" stopColor={`${tokens.blue}00`} />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#mg)" />
        <path d={d} fill="none" stroke={tokens.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={tokens.blue} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {last7.map((e, i) => (
          <span key={i} style={{ fontSize: 9, color: tokens.ter, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {days[new Date(e.timestamp).getDay()]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Analytics view ───────────────────────────────────────────────────────────
export function AnalyticsView({ entries, openStreak }) {
  const [calendarConnected, setCalendarConnected] = useState(false);

  // Compute life balance scores from theme frequency
  const scores = {};
  LIFE_AREAS.forEach(area => { scores[area.key] = 0; });

  const themed = entries.slice(0, 30);
  const total  = themed.length || 1;

  themed.forEach(e => {
    (e.themes || []).forEach(theme => {
      const area = LIFE_AREAS.find(a => a.key === theme);
      if (area) scores[area.key] += 1;
    });
  });

  // Normalize to 0–100
  const max = Math.max(...Object.values(scores), 1);
  Object.keys(scores).forEach(k => {
    scores[k] = Math.round((scores[k] / max) * 100);
  });

  const topArea  = LIFE_AREAS.find(a => scores[a.key] === Math.max(...LIFE_AREAS.map(x => scores[x.key])));
  const lowArea  = LIFE_AREAS.find(a => scores[a.key] === Math.min(...LIFE_AREAS.map(x => scores[x.key])));

  const avgMoodVal = entries.length
    ? (entries.slice(0, 7).reduce((s, e) => s + (e.mood || 3), 0) / Math.min(entries.length, 7)).toFixed(1)
    : "—";

  const themeCounts = {};
  entries.forEach(e => (e.themes || []).forEach(t => { themeCounts[t] = (themeCounts[t] || 0) + 1; }));
  const topThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (!entries.length) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <SectionHeader title="Analytics" sub="Life balance · trends · patterns" />
        <EmptyState emoji="📊" title="No data yet" sub="Write a few entries to see your analytics." />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader title="Analytics" sub="Life balance · trends · patterns" />

      {/* Google Calendar connect */}
      {!calendarConnected ? (
        <div
          onClick={() => setCalendarConnected(true)}
          style={{
            background: `linear-gradient(135deg, ${tokens.blue}10, #5856D610)`,
            border: `1px solid ${tokens.blue}25`,
            borderRadius: 16,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 28 }}>📅</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: tokens.text, margin: "0 0 2px" }}>Google Calendar</p>
            <p style={{ fontSize: 12, color: tokens.sub, margin: 0 }}>Connect to enrich coach analysis</p>
          </div>
          <div style={{
            background: tokens.blue,
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
          }}>Connect</div>
        </div>
      ) : (
        <TintedCard color={tokens.green} label="📅 Google Calendar Connected">
          <p style={{ fontSize: 13, color: tokens.text, margin: 0 }}>Calendar events are now enriching your coach analysis.</p>
        </TintedCard>
      )}

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { val: entries.length, label: "Entries" },
          { val: openStreak,     label: "Day Streak" },
          { val: avgMoodVal,     label: "Avg Mood" },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle(), flex: 1, textAlign: "center", padding: "12px 8px" }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: tokens.blue, margin: "0 0 2px" }}>{s.val}</p>
            <p style={{ fontSize: 10, color: tokens.ter, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Life Balance Radar */}
      <div style={cardStyle()}>
        <p style={{ fontSize: 12, fontWeight: 700, color: tokens.blue, textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 16px" }}>
          Life Balance Radar
        </p>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 20px" }}>
          <RadarChart scores={scores} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {LIFE_AREAS.map(area => (
            <div key={area.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: tokens.sub }}>{area.icon} {area.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: area.color }}>{scores[area.key]}%</span>
            </div>
          ))}
        </div>
        {topArea && lowArea && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${tokens.sep}` }}>
            <p style={{ fontSize: 12, color: tokens.sub, lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: tokens.green }}>↑ {topArea.icon} {topArea.label}</span> is dominating your entries.{" "}
              <span style={{ color: tokens.red }}>↓ {lowArea.icon} {lowArea.label}</span> may need more attention.
            </p>
          </div>
        )}
      </div>

      {/* Mood trend */}
      {entries.length >= 2 && (
        <div style={cardStyle()}>
          <p style={{ fontSize: 12, fontWeight: 700, color: tokens.blue, textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 14px" }}>
            Mood Trend — Last 7 Days
          </p>
          <MoodSparkline entries={entries} />
        </div>
      )}

      {/* Top themes */}
      {topThemes.length > 0 && (
        <div style={cardStyle()}>
          <p style={{ fontSize: 12, fontWeight: 700, color: tokens.blue, textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 12px" }}>
            Top Themes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topThemes.map(([theme, count]) => {
              const themeData = THEMES[theme] || {};
              const pct = Math.round((count / total) * 100);
              return (
                <div key={theme}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: tokens.text }}>{themeData.icon || "◆"} {theme}</span>
                    <span style={{ fontSize: 12, color: tokens.sub }}>{count} entries</span>
                  </div>
                  <div style={{ height: 4, background: tokens.sep, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: themeData.color || tokens.blue, borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
