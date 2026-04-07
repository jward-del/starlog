import { tokens, cardStyle, pillStyle } from "../lib/styles.js";
import { THEMES, MOODS } from "../lib/constants.js";
import { formatDateTime, formatTime, formatDay, groupByDay } from "../lib/utils.js";
import { SectionHeader, EmptyState, ThemeBadge, TintedCard } from "../components/index.jsx";

// ─── Entry Card (list item) ───────────────────────────────────────────────────
function EntryCard({ entry, onClick }) {
  const mood = MOODS.find(m => m.value === entry.mood);
  return (
    <div className="hov" onClick={onClick} style={{ ...cardStyle({ marginBottom: 10, cursor: "pointer" }) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: tokens.ter }}>{formatTime(entry.timestamp)}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {entry.tone && (
            <span style={{ fontSize: 11, background: `${tokens.blue}10`, color: tokens.blue, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>
              {entry.tone}
            </span>
          )}
          {mood && <span style={{ fontSize: 16 }}>{mood.emoji}</span>}
        </div>
      </div>
      {entry.observation && (
        <p style={{ fontSize: 14, color: tokens.text, fontWeight: 500, lineHeight: 1.5, margin: "0 0 8px", fontStyle: "italic" }}>
          "{entry.observation}"
        </p>
      )}
      <p style={{ fontSize: 14, color: tokens.sub, lineHeight: 1.6, margin: "0 0 10px" }}>
        {entry.text.slice(0, 100)}{entry.text.length > 100 ? "…" : ""}
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(entry.themes || []).map(t => <ThemeBadge key={t} theme={t} />)}
      </div>
    </div>
  );
}

// ─── Archive List ─────────────────────────────────────────────────────────────
export function ArchiveView({ entries, searchQ, onSearchChange, onSelectEntry }) {
  const filtered = searchQ
    ? entries.filter(e =>
        e.text.toLowerCase().includes(searchQ.toLowerCase()) ||
        (e.observation || "").toLowerCase().includes(searchQ.toLowerCase()) ||
        (e.themes || []).some(t => t.toLowerCase().includes(searchQ.toLowerCase()))
      )
    : entries;

  const grouped = groupByDay(filtered);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SectionHeader title="Archive" sub={`${entries.length} entries`} />

      {/* Search */}
      <div style={{ ...cardStyle({ padding: "10px 14px" }), display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: tokens.ter, fontSize: 16 }}>🔍</span>
        <input
          style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 15, color: tokens.text }}
          placeholder="Search entries, themes, insights…"
          value={searchQ}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQ && (
          <button onClick={() => onSearchChange("")} style={{ border: "none", background: "transparent", color: tokens.ter, cursor: "pointer", fontSize: 16 }}>✕</button>
        )}
      </div>

      {searchQ && (
        <p style={{ fontSize: 13, color: tokens.sub, margin: 0, paddingLeft: 4 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Timeline grouped by day */}
      {Object.entries(grouped).map(([day, dayEntries]) => (
        <div key={day}>
          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 8px", paddingLeft: 4 }}>
            {formatDay(dayEntries[0].timestamp)}
          </p>
          {dayEntries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onClick={() => onSelectEntry(entry)} />
          ))}
        </div>
      ))}

      {filtered.length === 0 && <EmptyState emoji="📭" title="No entries found" />}
    </div>
  );
}

// ─── Entry Detail ─────────────────────────────────────────────────────────────
export function EntryDetail({ entry, relatedEntries, onBack, onDelete, onOpenRelated }) {
  const mood = MOODS.find(m => m.value === entry.mood);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <button
        onClick={onBack}
        style={{ border: "none", background: "transparent", color: tokens.blue, fontSize: 16, cursor: "pointer", textAlign: "left", fontWeight: 500, padding: 0 }}
      >
        ← Archive
      </button>

      {/* Main content */}
      <div style={cardStyle()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: tokens.ter, margin: 0 }}>{formatDateTime(entry.timestamp)}</p>
            <p style={{ fontSize: 11, color: tokens.ter, margin: 0 }}>Stardate {entry.stardate}</p>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {entry.tone && (
              <span style={{ fontSize: 11, background: `${tokens.blue}10`, color: tokens.blue, padding: "3px 10px", borderRadius: 12, fontWeight: 500 }}>
                {entry.tone}
              </span>
            )}
            {mood && <span style={{ fontSize: 22 }}>{mood.emoji}</span>}
          </div>
        </div>

        {entry.observation && (
          <div style={{ fontSize: 16, fontWeight: 500, color: tokens.text, lineHeight: 1.6, marginBottom: 14, padding: "12px 14px", background: `${tokens.blue}08`, borderRadius: 12, borderLeft: `3px solid ${tokens.blue}` }}>
            {entry.observation}
          </div>
        )}

        <p style={{ fontSize: 15, color: tokens.sub, lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0 }}>
          {entry.text}
        </p>
      </div>

      {/* Themes */}
      {(entry.themes || []).length > 0 && (
        <div style={cardStyle()}>
          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 10px" }}>Themes</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(entry.themes || []).map(t => <ThemeBadge key={t} theme={t} active large />)}
          </div>
        </div>
      )}

      {/* Tension */}
      {entry.tension && (
        <TintedCard color={tokens.red} label="Core Tension">
          <p style={{ fontSize: 15, color: tokens.text, lineHeight: 1.6, margin: 0 }}>{entry.tension}</p>
        </TintedCard>
      )}

      {/* Decision questions */}
      {entry.decisions?.length > 0 && (
        <div style={cardStyle()}>
          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 12px" }}>Questions to sit with</p>
          {entry.decisions.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: `${tokens.blue}15`, color: tokens.blue, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6, margin: "2px 0 0" }}>{d}</p>
            </div>
          ))}
        </div>
      )}

      {/* Related entries */}
      {relatedEntries?.length > 0 && (
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: tokens.sub, margin: "0 0 10px", paddingLeft: 4 }}>Related Entries</p>
          {relatedEntries.map(rel => (
            <div key={rel.id} className="hov" onClick={() => onOpenRelated(rel)} style={{ ...cardStyle({ marginBottom: 8, cursor: "pointer" }) }}>
              <p style={{ fontSize: 11, color: tokens.ter, margin: "0 0 4px" }}>{formatDateTime(rel.timestamp)}</p>
              <p style={{ fontSize: 14, color: tokens.sub, lineHeight: 1.5, margin: 0 }}>
                {rel.observation || rel.text.slice(0, 80)}…
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        style={{ background: `${tokens.red}10`, border: `1px solid ${tokens.red}20`, borderRadius: 12, padding: "12px", color: tokens.red, fontSize: 14, fontWeight: 500, cursor: "pointer" }}
      >
        Delete Entry
      </button>
    </div>
  );
}
