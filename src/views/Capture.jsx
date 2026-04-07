import { tokens, cardStyle } from "../lib/styles.js";
import { MOODS } from "../lib/constants.js";
import { Spinner, MoodChart, BalanceWheel } from "../components/index.jsx";

export function CaptureView({
  entries, transcript, interim, isListening, saving, saveSuccess,
  selectedMood, digestLoading, digest,
  onMoodSelect, onTranscriptChange, onToggleRecord, onSave,
  onGenerateDigest, onViewDigest,
}) {
  const todayCount = entries.filter(
    e => new Date(e.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const avgMoodVal = entries.length
    ? (entries.reduce((s, e) => s + (e.mood || 3), 0) / entries.length).toFixed(1)
    : "—";

  const saveLabel = saveSuccess ? "✓  Saved!" : saving ? "Analyzing…" : "Save & Analyze";
  const saveBg    = saveSuccess ? tokens.green
                  : saving || (!transcript && !interim) ? "#C7C7CC"
                  : tokens.blue;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Weekly digest CTA */}
      <button
        onClick={digest ? onViewDigest : onGenerateDigest}
        disabled={digestLoading}
        style={{
          ...cardStyle({ padding: "11px 14px" }),
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          gap:             6,
          color:           digest ? tokens.blue : tokens.sub,
          fontSize:        13,
          fontWeight:      500,
          border:          `1px solid ${tokens.border}`,
          cursor:          digestLoading ? "default" : "pointer",
          width:           "100%",
        }}
      >
        {digestLoading
          ? <><Spinner size={14} /> Generating…</>
          : digest
            ? "📋 View Weekly Digest"
            : "📋 Generate Weekly Digest"
        }
      </button>

      {/* Mood selector */}
      <div style={cardStyle()}>
        <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 12px" }}>
          How are you feeling?
        </p>
        <div style={{ display: "flex", gap: 4 }}>
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => onMoodSelect(m.value)}
              style={{
                flex:        1,
                display:     "flex",
                flexDirection: "column",
                alignItems:  "center",
                gap:         4,
                padding:     "8px 2px",
                borderRadius: 12,
                border:      "none",
                background:  selectedMood === m.value ? `${m.color}18` : "transparent",
                outline:     selectedMood === m.value ? `2px solid ${m.color}` : "none",
                cursor:      "pointer",
                transition:  "all 0.15s",
              }}
            >
              <span style={{ fontSize: 22 }}>{m.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: selectedMood === m.value ? m.color : tokens.ter }}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div style={cardStyle({ padding: 0, overflow: "hidden" })}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${tokens.sep}` }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.sub }}>Your thoughts</span>
          <button
            onClick={onToggleRecord}
            style={{
              width:       36,
              height:      36,
              borderRadius: "50%",
              border:      "none",
              background:  isListening ? tokens.red : tokens.blue,
              color:       "#fff",
              fontSize:    15,
              cursor:      "pointer",
              display:     "flex",
              alignItems:  "center",
              justifyContent: "center",
              animation:   isListening ? "recpulse 1.2s infinite" : "none",
              transition:  "background 0.2s",
            }}
          >
            {isListening ? "⏹" : "🎙"}
          </button>
        </div>
        <textarea
          style={{
            width:       "100%",
            minHeight:   150,
            background:  "transparent",
            border:      "none",
            padding:     "14px 16px",
            color:       tokens.text,
            fontSize:    15,
            lineHeight:  1.75,
            resize:      "none",
            outline:     "none",
          }}
          placeholder="Speak freely — what's weighing on you? What decision are you wrestling with?"
          value={transcript + (isListening ? interim : "")}
          onChange={e => onTranscriptChange(e.target.value)}
        />
        {isListening && interim && (
          <p style={{ padding: "0 16px 12px", fontSize: 14, color: tokens.ter, fontStyle: "italic", margin: 0 }}>
            {interim}…
          </p>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving || (!transcript && !interim)}
        style={{
          width:        "100%",
          padding:      "16px",
          borderRadius: 14,
          border:       "none",
          background:   saveBg,
          color:        "#fff",
          fontSize:     16,
          fontWeight:   600,
          cursor:       "pointer",
          transition:   "background 0.25s",
        }}
      >
        {saveLabel}
      </button>

      {/* Stats row */}
      {entries.length > 0 && (
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Today",    value: `${todayCount} entr${todayCount === 1 ? "y" : "ies"}` },
            { label: "Avg Mood", value: `${avgMoodVal}/5` },
            { label: "Total",    value: `${entries.length}` },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle({ padding: "12px 8px", textAlign: "center" }), flex: 1 }}>
              <p style={{ fontSize: 11, color: tokens.ter, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: tokens.text, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {entries.length >= 2 && (
        <div style={cardStyle()}>
          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 14px" }}>Mood Trend</p>
          <MoodChart entries={entries} />
        </div>
      )}

      {entries.length >= 2 && (
        <div style={cardStyle()}>
          <p style={{ fontSize: 13, fontWeight: 600, color: tokens.sub, margin: "0 0 4px" }}>Life Balance</p>
          <p style={{ fontSize: 11, color: tokens.ter, margin: "0 0 14px" }}>Based on your journal themes</p>
          <BalanceWheel entries={entries} />
        </div>
      )}
    </div>
  );
}
