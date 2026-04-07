import { tokens, cardStyle } from "../lib/styles.js";
import { CLASSIC_PROMPTS } from "../lib/constants.js";
import { SectionHeader, PromptRow, LoadingCard } from "../components/index.jsx";

export function PromptsView({ newsPrompts, loading, error, cached, onSelect, onRefresh }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader title="Prompts" sub="Tap any prompt to begin reflecting" />

      {/* News-based prompts */}
      <p style={{ fontSize: 14, fontWeight: 600, color: tokens.sub, margin: 0, paddingLeft: 2 }}>
        News-Based Reflections
      </p>

      <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
        {loading && <LoadingCard message="Generating from today's news…" />}

        {!loading && error && (
          <div style={{ padding: "16px 18px" }}>
            <p style={{ fontSize: 13, color: tokens.red, margin: "0 0 8px" }}>Couldn't load news prompts</p>
            <button
              onClick={onRefresh}
              style={{ background: tokens.blue, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 500 }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && newsPrompts.length === 0 && (
          <div style={{ padding: "20px 18px", textAlign: "center" }}>
            <button
              onClick={onRefresh}
              style={{ background: tokens.blue, border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 500 }}
            >
              Load News Prompts
            </button>
          </div>
        )}

        {!loading && newsPrompts.map((p, i) => (
          <PromptRow
            key={i}
            headline={p.headline}
            question={p.question}
            category={p.category}
            last={i === newsPrompts.length - 1}
            onSelect={() => onSelect(p.question)}
          />
        ))}

        {!loading && newsPrompts.length > 0 && (
          <div style={{ padding: "10px 18px", borderTop: `1px solid ${tokens.sep}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: tokens.ter }}>{cached ? "Cached" : "Live"} · refreshes every 6h</span>
            <button
              onClick={onRefresh}
              style={{ background: "transparent", border: "none", color: tokens.blue, fontSize: 12, cursor: "pointer", fontWeight: 500 }}
            >
              ↻ Refresh
            </button>
          </div>
        )}
      </div>

      {/* Classic prompts */}
      <p style={{ fontSize: 14, fontWeight: 600, color: tokens.sub, margin: "4px 0 0", paddingLeft: 2 }}>
        Classic Reflections
      </p>

      <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
        {CLASSIC_PROMPTS.map((p, i) => (
          <PromptRow
            key={i}
            question={p.q}
            category={p.cat}
            last={i === CLASSIC_PROMPTS.length - 1}
            onSelect={() => onSelect(p.q)}
          />
        ))}
      </div>
    </div>
  );
}
