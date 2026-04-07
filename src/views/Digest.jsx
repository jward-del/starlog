import { tokens, cardStyle, pillStyle } from "../lib/styles.js";
import { THEMES } from "../lib/constants.js";
import { formatWeek } from "../lib/utils.js";
import { ThemeBadge, TintedCard } from "../components/index.jsx";

export function DigestModal({ digest, onClose, onRegenerate }) {
  if (!digest) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 48px", width: "100%", maxWidth: 430, margin: "0 auto", maxHeight: "85vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: tokens.text, margin: 0 }}>{digest.title}</h2>
            <p style={{ fontSize: 12, color: tokens.ter, margin: "2px 0 0" }}>
              {formatWeek(digest.generatedAt)} · {digest.entryCount} entries
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "#F2F2F7", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16, color: tokens.sub }}
          >
            ✕
          </button>
        </div>

        {/* Theme badges */}
        {digest.topThemes?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {digest.topThemes.map(t => <ThemeBadge key={t} theme={t} active />)}
          </div>
        )}

        {/* Opening */}
        <p style={{ fontSize: 15, color: tokens.text, lineHeight: 1.85, marginBottom: 18 }}>{digest.opening}</p>

        {/* Quote */}
        {digest.quote && (
          <div style={{ ...cardStyle({ padding: "14px 16px", marginBottom: 18 }), background: `${tokens.blue}08`, borderColor: `${tokens.blue}20` }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: tokens.blue, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Your words this week
            </p>
            <p style={{ fontSize: 15, color: tokens.text, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
              "{digest.quote}"
            </p>
          </div>
        )}

        {/* Highlights */}
        {digest.highlights?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Highlights
            </p>
            {digest.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.blue, flexShrink: 0, marginTop: 6 }} />
                <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6, margin: 0 }}>{h}</p>
              </div>
            ))}
          </div>
        )}

        {/* Growth & Challenge */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {digest.growth && (
            <TintedCard color={tokens.green} label="💚 Growth this week">
              <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6, margin: 0 }}>{digest.growth}</p>
            </TintedCard>
          )}
          {digest.challenge && (
            <TintedCard color={tokens.orange} label="⚡ Challenge carried">
              <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6, margin: 0 }}>{digest.challenge}</p>
            </TintedCard>
          )}
        </div>

        {/* Next week intention */}
        {digest.nextWeek && (
          <div style={{ background: `linear-gradient(135deg, ${tokens.blue}10, #5856D610)`, border: `1px solid ${tokens.blue}25`, borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: tokens.blue, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>
              🎯 Intention for next week
            </p>
            <p style={{ fontSize: 15, fontWeight: 500, color: tokens.text, lineHeight: 1.6, margin: 0 }}>{digest.nextWeek}</p>
          </div>
        )}

        <button
          onClick={onRegenerate}
          style={{ width: "100%", padding: "14px", background: tokens.blue, border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Regenerate Digest
        </button>
      </div>
    </div>
  );
}
