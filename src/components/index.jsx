import { THEMES, LIFE_AREAS, MOODS } from "../lib/constants.js";
import { tokens, cardStyle, pillStyle } from "../lib/styles.js";
import { formatDay, avgMood } from "../lib/utils.js";

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 24, color = tokens.blue }) {
  return (
    <div style={{
      width:          size,
      height:         size,
      border:         `2.5px solid ${color}`,
      borderTopColor: "transparent",
      borderRadius:   "50%",
      animation:      "spin 0.7s linear infinite",
      flexShrink:     0,
    }} />
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: tokens.text, letterSpacing: -0.3, margin: 0 }}>
          {title}
        </h2>
        {sub && (
          <p style={{ fontSize: 13, color: tokens.sub, margin: "2px 0 0" }}>{sub}</p>
        )}
      </div>
      {action && <div style={{ marginTop: 4 }}>{action}</div>}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ emoji, title, sub, action }) {
  return (
    <div style={{ ...cardStyle({ padding: 52 }), textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: tokens.text, margin: 0 }}>{title}</p>
      {sub && (
        <p style={{ fontSize: 13, color: tokens.ter, margin: "6px 0 0", lineHeight: 1.5 }}>{sub}</p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ─── Theme Badge ──────────────────────────────────────────────────────────────
export function ThemeBadge({ theme, active = false, large = false }) {
  const meta  = THEMES[theme] || { icon: "◆", color: tokens.blue };
  const style = large
    ? { ...pillStyle(theme, active), fontSize: 13, padding: "6px 14px" }
    : pillStyle(theme, active);
  return <span style={style}>{meta.icon} {theme}</span>;
}

// ─── Prompt Row ───────────────────────────────────────────────────────────────
export function PromptRow({ headline, question, category, last, onSelect }) {
  const color = THEMES[category]?.color || tokens.blue;
  return (
    <div
      className="hov"
      onClick={onSelect}
      style={{ padding: "12px 18px", cursor: "pointer", borderBottom: last ? "none" : `1px solid ${tokens.sep}` }}
    >
      {headline && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
          <span style={{ fontSize: 10, color, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {category}
          </span>
          <span style={{ fontSize: 10, color: tokens.ter }}>·</span>
          <span style={{ fontSize: 10, color: tokens.ter, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
            {headline}
          </span>
        </div>
      )}
      <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.55, fontWeight: 500, margin: 0 }}>{question}</p>
      <p style={{ fontSize: 11, color: tokens.blue, margin: "4px 0 0", fontWeight: 500 }}>Tap to reflect →</p>
    </div>
  );
}

// ─── Loading Card ─────────────────────────────────────────────────────────────
export function LoadingCard({ message, sub }) {
  return (
    <div style={{ ...cardStyle({ display: "flex", alignItems: "center", gap: 14, padding: "20px 18px" }) }}>
      <Spinner />
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: tokens.text, margin: 0 }}>{message}</p>
        {sub && <p style={{ fontSize: 12, color: tokens.ter, margin: "3px 0 0" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Tinted Section Card ──────────────────────────────────────────────────────
export function TintedCard({ color, label, children }) {
  return (
    <div style={{ ...cardStyle(), background: `${color}08`, borderColor: `${color}25` }}>
      <p style={{ fontSize: 12, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Small Action Button ──────────────────────────────────────────────────────
export function GhostButton({ label, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background:   "transparent",
        border:       `1px solid ${tokens.blue}`,
        borderRadius: tokens.radius.pill,
        padding:      "5px 12px",
        fontSize:     12,
        color:        disabled ? tokens.ter : tokens.blue,
        cursor:       disabled ? "default" : "pointer",
        fontWeight:   500,
        marginTop:    4,
        flexShrink:   0,
      }}
    >
      {label}
    </button>
  );
}

// ─── Mood Chart ───────────────────────────────────────────────────────────────
export function MoodChart({ entries }) {
  const recent = entries.slice(0, 14).reverse();
  if (recent.length < 2) {
    return (
      <p style={{ textAlign: "center", padding: "24px 0", color: tokens.ter, fontSize: 13, margin: 0 }}>
        Add more entries to see your mood trend
      </p>
    );
  }

  const H    = 80;
  const pts  = recent.map((e, i) => ({
    x: (i / (recent.length - 1)) * 100,
    y: H - (((e.mood || 3) - 1) / 4) * H,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1].x},${H} L${pts[0].x},${H} Z`;
  const avg  = avgMood(recent);
  const moodEmoji = MOODS.find(m => m.value === Math.round(parseFloat(avg)))?.emoji || "😐";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: tokens.sub, fontWeight: 500 }}>Last {recent.length} entries</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 18 }}>{moodEmoji}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.text }}>Avg {avg}/5</span>
        </div>
      </div>
      <svg viewBox={`0 0 100 ${H}`} style={{ width: "100%", height: H, overflow: "visible" }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={tokens.blue} stopOpacity="0.25" />
            <stop offset="100%" stopColor={tokens.blue} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#moodGrad)" />
        <path d={path} fill="none" stroke={tokens.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={tokens.blue} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: tokens.ter }}>{formatDay(recent[0].timestamp)}</span>
        <span style={{ fontSize: 10, color: tokens.ter }}>{formatDay(recent[recent.length - 1].timestamp)}</span>
      </div>
    </div>
  );
}

// ─── Life Balance Wheel ───────────────────────────────────────────────────────
export function BalanceWheel({ entries }) {
  const n  = LIFE_AREAS.length;
  const cx = 100, cy = 100, r = 72;

  const scores = LIFE_AREAS.map(area => {
    const areaEntries = entries.filter(e => (e.themes || []).includes(area.key));
    if (!areaEntries.length) return { ...area, score: 0, count: 0 };
    const moodAvg  = areaEntries.reduce((s, e) => s + (e.mood || 3), 0) / areaEntries.length;
    const recency  = Math.min(areaEntries.length / 3, 1);
    const score    = Math.min((moodAvg / 5) * 8 * recency + areaEntries.length * 0.3, 8);
    return { ...area, score, count: areaEntries.length };
  });

  const maxScore = Math.max(...scores.map(s => s.score), 1);

  const points = scores.map((s, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const ratio = Math.min(s.score / maxScore, 1);
    const pr    = r * 0.12 + r * 0.88 * ratio;
    return {
      x:  cx + Math.cos(angle) * pr,
      y:  cy + Math.sin(angle) * pr,
      ox: cx + Math.cos(angle) * r,
      oy: cy + Math.sin(angle) * r,
      lx: cx + Math.cos(angle) * (r + 20),
      ly: cy + Math.sin(angle) * (r + 20),
      ...s,
    };
  });

  const poly = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 260, margin: "0 auto", display: "block" }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon
          key={f}
          points={scores.map((_, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            return `${cx + Math.cos(a) * r * f},${cy + Math.sin(a) * r * f}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="0.5"
        />
      ))}
      {/* Spokes */}
      {points.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.ox} y2={p.oy} stroke="rgba(0,0,0,0.07)" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon points={poly} fill={`${tokens.blue}15`} stroke={tokens.blue} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Labels */}
      {points.map((p, i) => (
        <g key={i}>
          <text x={p.lx} y={p.ly}      textAnchor="middle" dominantBaseline="middle" fontSize="9"   fontFamily={tokens.font}>{p.icon}</text>
          <text x={p.lx} y={p.ly + 10} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill={tokens.ter} fontFamily={tokens.font}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
