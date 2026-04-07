import { tokens, cardStyle } from "../lib/styles.js";
import { THEMES } from "../lib/constants.js";
import { SectionHeader, EmptyState, LoadingCard, TintedCard, GhostButton } from "../components/index.jsx";

function FocusAreaCard({ area }) {
  const color = THEMES[area.theme]?.color || tokens.blue;
  const icon  = THEMES[area.theme]?.icon  || "◆";
  return (
    <div style={{ ...cardStyle(), borderColor: `${color}30`, background: `${color}06` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: tokens.text, margin: 0 }}>{area.theme}</p>
          <p style={{ fontSize: 11, color, fontWeight: 500, margin: 0 }}>Recommended Focus</p>
        </div>
      </div>
      <p style={{ fontSize: 14, color: tokens.sub, lineHeight: 1.65, margin: "0 0 10px" }}>{area.why}</p>
      <div style={{ background: `${color}12`, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>→</span>
        <p style={{ fontSize: 14, color: tokens.text, fontWeight: 500, lineHeight: 1.55, margin: 0 }}>{area.action}</p>
      </div>
    </div>
  );
}

function ConnectionCard({ connection }) {
  const colors = connection.themes.map(t => THEMES[t]?.color || tokens.blue);
  const icons  = connection.themes.map(t => THEMES[t]?.icon  || "◆");
  return (
    <div style={{ ...cardStyle(), borderLeft: `3px solid ${colors[0]}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        {connection.themes.map((theme, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span style={{ fontSize: 11, color: tokens.ter }}>↔</span>}
            <span style={{ fontSize: 13 }}>{icons[i]}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: colors[i] }}>{theme}</span>
          </span>
        ))}
      </div>
      <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.65, margin: "0 0 10px" }}>{connection.insight}</p>
      <div style={{ background: `${tokens.blue}08`, borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ fontSize: 13, color: tokens.blue, fontWeight: 500, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
          "{connection.question}"
        </p>
      </div>
    </div>
  );
}

export function CoachView({ data, connections, loading, entryCount, onRefresh }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHeader
        title="My Coach"
        sub="Claude's honest perspective on your patterns"
        action={data && !loading && <GhostButton label="↻ Refresh" onClick={onRefresh} />}
      />

      {loading && <LoadingCard message="Reading your entries…" sub="Generating your personalized coaching perspective" />}

      {!loading && !data && (
        <EmptyState
          emoji="🔮"
          title="Write to unlock coaching"
          sub="Claude needs your journal entries to generate a personalized perspective. The more you write, the more accurate the insights."
        />
      )}

      {!loading && data && (
        <>
          {/* Headline */}
          <div style={{ background: `linear-gradient(135deg, ${tokens.blue}, #5856D6)`, borderRadius: 16, padding: "20px" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>
              Where You Are Right Now
            </p>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#fff", lineHeight: 1.5, margin: 0 }}>
              {data.headline}
            </p>
          </div>

          {/* Honest take */}
          <div style={cardStyle()}>
            <p style={{ fontSize: 12, fontWeight: 700, color: tokens.purple, textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 10px" }}>
              Claude's Honest Take
            </p>
            <p style={{ fontSize: 15, color: tokens.text, lineHeight: 1.85, margin: 0 }}>{data.honest}</p>
          </div>

          {/* Focus areas */}
          {data.focusAreas?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: tokens.sub, margin: 0, paddingLeft: 4 }}>
                Focus Areas This Week
              </p>
              {data.focusAreas.map((area, i) => <FocusAreaCard key={i} area={area} />)}
            </div>
          )}

          {/* Cross-theme connections */}
          {connections?.connections?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: tokens.sub, margin: 0, paddingLeft: 4 }}>
                🔗 Connections Across Your Life
              </p>
              {connections.connections.map((c, i) => <ConnectionCard key={i} connection={c} />)}
              {connections.coreThread && (
                <div style={{ background: `#5856D612`, borderRadius: 12, padding: "12px 14px", borderLeft: `3px solid #5856D6` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#5856D6", textTransform: "uppercase", letterSpacing: 0.6, margin: "0 0 6px" }}>
                    Core Thread
                  </p>
                  <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6, margin: 0 }}>{connections.coreThread}</p>
                </div>
              )}
            </div>
          )}

          {/* Strength */}
          {data.strengthToLean && (
            <TintedCard color={tokens.green} label="💪 Strength to Lean Into">
              <p style={{ fontSize: 15, color: tokens.text, lineHeight: 1.65, margin: 0 }}>{data.strengthToLean}</p>
            </TintedCard>
          )}

          {/* Watch out */}
          {data.watchOut && (
            <TintedCard color={tokens.orange} label="⚠️ Watch Out For">
              <p style={{ fontSize: 15, color: tokens.text, lineHeight: 1.65, margin: 0 }}>{data.watchOut}</p>
            </TintedCard>
          )}

          <p style={{ fontSize: 12, color: tokens.ter, textAlign: "center", lineHeight: 1.6, margin: 0, padding: "0 8px" }}>
            Based on your {entryCount} journal entr{entryCount === 1 ? "y" : "ies"}.
            More entries = more accurate insights.
          </p>
        </>
      )}
    </div>
  );
}
