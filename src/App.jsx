import { useState, useEffect, useRef, useCallback } from "react";

import { KEYS, TTL, NAV_TABS, SEED_ENTRY, VERSION, WHATS_NEW } from "./lib/constants.js";
import { storage, stardate, exportEntries, getStreak, trackOpenAndGetStreak } from "./lib/utils.js";
import { tokens, globalCSS }                          from "./lib/styles.js";
import { fetchRSS, fetchNewsPrompts, analyzeEntry,
         generateCoachView, generateWeeklyDigest,
         generateThemeConnections }                   from "./lib/api.js";

import { CaptureView }  from "./views/Capture.jsx";
import { NewsFeedView } from "./views/NewsFeed.jsx";
import { PromptsView }  from "./views/Prompts.jsx";
import { ArchiveView, EntryDetail } from "./views/Archive.jsx";
import { CoachView }    from "./views/Coach.jsx";
import { DigestModal }  from "./views/Digest.jsx";
import { AnalyticsView } from "./views/Analytics.jsx";

export default function App() {
  // ─── Core state ─────────────────────────────────────────────────────────────
  const [entries, setEntries]     = useState([]);
  const [view, setView]           = useState("capture");
  const [selectedEntry, setSelected] = useState(null);
  const [relatedEntries, setRelated] = useState([]);
  const [openStreak, setOpenStreak]  = useState(0);

  // ─── Capture state ───────────────────────────────────────────────────────────
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim]       = useState("");
  const [isListening, setListening] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedMood, setMood]     = useState(3);
  const [statusMsg, setStatusMsg]   = useState("");

  // ─── Wake word ───────────────────────────────────────────────────────────────
  const [wakeOn, setWakeOn] = useState(false);

  // ─── News feed state ─────────────────────────────────────────────────────────
  const [activeFeed, setActiveFeed]       = useState(0);
  const [rssItems, setRssItems]           = useState([]);
  const [rssLoading, setRssLoading]       = useState(false);
  const [rssError, setRssError]           = useState(false);

  // ─── Prompts state ───────────────────────────────────────────────────────────
  const [newsPrompts, setNewsPrompts]     = useState([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError]   = useState(false);
  const [promptsCached, setPromptsCached] = useState(false);

  // ─── Coach state ─────────────────────────────────────────────────────────────
  const [coachData, setCoachData]               = useState(null);
  const [coachLoading, setCoachLoading]         = useState(false);
  const [connections, setConnections]           = useState(null);

  // ─── Digest state ────────────────────────────────────────────────────────────
  const [digest, setDigest]               = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [showDigest, setShowDigest]       = useState(false);

  // ─── Search ──────────────────────────────────────────────────────────────────
  const [searchQ, setSearchQ] = useState("");

  const recRef  = useRef(null);
  const wakeRef = useRef(null);

  const [showWhatsNew, setShowWhatsNew] = useState(false);

  // Check if user has seen this version
  useEffect(() => {
    const seen = storage.get("starlog-version-seen");
    if (seen !== VERSION) setShowWhatsNew(true);
  }, []);

  const dismissWhatsNew = () => {
    storage.set("starlog-version-seen", VERSION);
    setShowWhatsNew(false);
  };

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = storage.get(KEYS.entries);
    setEntries(saved?.length ? saved : [SEED_ENTRY]);
    setOpenStreak(trackOpenAndGetStreak());

    // Load cached digest
    const cachedDigest = storage.get(KEYS.digest);
    if (cachedDigest?.ts && Date.now() - cachedDigest.ts < TTL.digest) {
      setDigest(cachedDigest.digest);
    }

    // Pre-fetch news in background
    loadRSS(0);
    loadNewsPrompts();
  }, []);

  // ─── Persistence ─────────────────────────────────────────────────────────────
  const persist = useCallback(updated => {
    storage.set(KEYS.entries, updated);
    setEntries(updated);
    setCoachData(null);
    setConnections(null); // invalidate connections on new data
  }, []);

  // ─── RSS ─────────────────────────────────────────────────────────────────────
  const loadRSS = useCallback(async (idx = 0) => {
    setRssLoading(true); setRssError(false);
    try   { setRssItems(await fetchRSS(idx)); }
    catch { setRssError(true); }
    setRssLoading(false);
  }, []);

  // ─── News prompts ────────────────────────────────────────────────────────────
  const loadNewsPrompts = useCallback(async () => {
    setPromptsLoading(true); setPromptsError(false);
    try {
      const { prompts, fromCache } = await fetchNewsPrompts();
      setNewsPrompts(prompts);
      setPromptsCached(fromCache);
    } catch { setPromptsError(true); }
    setPromptsLoading(false);
  }, []);

  // ─── Wake word ───────────────────────────────────────────────────────────────
  const toggleWake = useCallback(() => {
    if (wakeOn) { wakeRef.current?.stop(); setWakeOn(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const wr = new SR();
    wr.continuous = true; wr.lang = "en-US";
    wr.onresult = e => {
      const said = Array.from(e.results).map(r => r[0].transcript).join(" ").toLowerCase();
      if (said.includes("starlog")) {
        setView("capture"); setTranscript(""); setInterim("");
        wr.stop(); setWakeOn(false);
      }
    };
    wr.onerror = () => setWakeOn(false);
    wr.onend   = () => setWakeOn(false);
    wakeRef.current = wr; wr.start(); setWakeOn(true);
  }, [wakeOn]);

  // ─── Voice recording ─────────────────────────────────────────────────────────
  const toggleRecord = useCallback(() => {
    if (isListening) { recRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatusMsg("Speech recognition not available"); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = "en-US";
    r.onresult = e => {
      let fin = "", intr = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += e.results[i][0].transcript + " ";
        else intr += e.results[i][0].transcript;
      }
      setTranscript(fin); setInterim(intr);
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    recRef.current = r; r.start(); setListening(true);
  }, [isListening]);

  // ─── Save entry ──────────────────────────────────────────────────────────────
  const saveEntry = useCallback(async () => {
    const text = (transcript + interim).trim();
    if (!text || saving) return;
    setSaving(true); setStatusMsg("Analyzing…");
    try {
      const analysis = await analyzeEntry(text, selectedMood);
      const entry = {
        id:          Date.now(),
        stardate:    stardate(),
        timestamp:   new Date().toISOString(),
        text,
        mood:        selectedMood,
        themes:      analysis.themes      || ["Clarity"],
        observation: analysis.observation || "",
        tension:     analysis.tension     || null,
        decisions:   analysis.decisions   || [],
        tone:        analysis.tone        || "Reflective",
      };
      persist([entry, ...entries]);
      setTranscript(""); setInterim(""); setSaveSuccess(true); setStatusMsg("");
      setTimeout(() => { setSaveSuccess(false); setView("archive"); }, 900);
    } catch {
      setStatusMsg("Error — check your API key in Vercel settings");
    }
    setSaving(false);
  }, [transcript, interim, entries, saving, persist, selectedMood]);

  // ─── Coach view ──────────────────────────────────────────────────────────────
  const loadCoach = useCallback(async () => {
    setCoachLoading(true);
    try {
      const [coach, conns] = await Promise.all([
        generateCoachView(entries),
        generateThemeConnections(entries),
      ]);
      setCoachData(coach);
      setConnections(conns);
    } catch { /* fail silently, UI handles null */ }
    setCoachLoading(false);
  }, [entries]);

  useEffect(() => {
    if (view === "coach" && !coachData && !coachLoading) loadCoach();
  }, [view]);

  // ─── Weekly digest ───────────────────────────────────────────────────────────
  const buildDigest = useCallback(async () => {
    setDigestLoading(true);
    try {
      const result = await generateWeeklyDigest(entries);
      if (result) {
        setDigest(result);
        storage.set(KEYS.digest, { ts: Date.now(), digest: result });
        setShowDigest(true);
      }
    } catch { /* fail silently */ }
    setDigestLoading(false);
  }, [entries]);

  // ─── Derived values ──────────────────────────────────────────────────────────
  const streak = getStreak(entries);

  // ─── Shared nav handler ──────────────────────────────────────────────────────
  const navigate = useCallback(key => {
    setView(key); setSelected(null); setSearchQ("");
  }, []);

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const topBar = {
    background:           tokens.nav,
    backdropFilter:       "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom:         `1px solid ${tokens.sep}`,
    padding:              "14px 18px 12px",
    position:             "sticky",
    top:                  0,
    zIndex:               100,
  };

  const tabBar = {
    position:             "fixed",
    bottom:               0,
    left:                 "50%",
    transform:            "translateX(-50%)",
    width:                "100%",
    maxWidth:             430,
    background:           tokens.nav,
    backdropFilter:       "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop:            `1px solid ${tokens.sep}`,
    display:              "flex",
    paddingBottom:        8,
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: tokens.bg, fontFamily: tokens.font, display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      <style>{globalCSS}</style>

      {/* ── Top bar ── */}
      <div style={topBar}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: tokens.text, letterSpacing: -0.5, margin: 0 }}>
              Starlog
            </h1>
            <p style={{ fontSize: 11, color: tokens.ter, margin: "1px 0 0" }}>Stardate {stardate()}</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {streak > 0 && (
              <div style={{ background: `${tokens.orange}14`, border: `1px solid ${tokens.orange}30`, borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: tokens.orange }}>{streak}d</span>
              </div>
            )}
            <button
              onClick={() => exportEntries(entries)}
              style={{ background: tokens.card, border: `1px solid ${tokens.border}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, color: tokens.sub, cursor: "pointer", fontWeight: 500 }}
            >
              Export
            </button>
            <button
              onClick={() => setShowWhatsNew(true)}
              style={{ background: `${tokens.blue}12`, border: `1px solid ${tokens.blue}25`, borderRadius: 20, padding: "4px 10px", fontSize: 11, color: tokens.blue, cursor: "pointer", fontWeight: 600 }}
            >
              v{VERSION}
            </button>
          </div>
        </div>
        {statusMsg && (
          <p style={{ marginTop: 8, fontSize: 12, color: statusMsg.startsWith("Error") ? tokens.red : tokens.blue, fontWeight: 500, margin: "8px 0 0" }}>
            {statusMsg}
          </p>
        )}
      </div>

      {/* ── Weekly digest banner ── */}
      {digest && !showDigest && view === "capture" && (
        <div
          className="hov"
          onClick={() => setShowDigest(true)}
          style={{ margin: "12px 16px 0", background: `linear-gradient(135deg, #5856D6, ${tokens.blue})`, borderRadius: 14, padding: "14px 16px", cursor: "pointer" }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 4px" }}>
            📋 Weekly Digest Ready
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.4, margin: "0 0 4px" }}>{digest.title}</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: 0 }}>
            {digest.entryCount} entries · Avg mood {digest.avgMood}/5 · Tap to read →
          </p>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="fade-in" style={{ flex: 1, padding: "16px 16px 96px", overflow: "auto" }}>
        {view === "capture" && (
          <CaptureView
            entries={entries}
            transcript={transcript}
            interim={interim}
            isListening={isListening}
            saving={saving}
            saveSuccess={saveSuccess}
            selectedMood={selectedMood}
            digestLoading={digestLoading}
            digest={digest}
            onMoodSelect={setMood}
            onTranscriptChange={setTranscript}
            onToggleRecord={toggleRecord}
            onSave={saveEntry}
            onGenerateDigest={buildDigest}
            onViewDigest={() => setShowDigest(true)}
          />
        )}

        {view === "feed" && (
          <NewsFeedView
            items={rssItems}
            loading={rssLoading}
            error={rssError}
            activeFeed={activeFeed}
            onFeedChange={idx => { setActiveFeed(idx); loadRSS(idx); }}
            onRefresh={() => loadRSS(activeFeed)}
            onReflect={title => { setTranscript(`Thinking about: "${title}" — `); setView("capture"); }}
          />
        )}

        {view === "prompts" && (
          <PromptsView
            newsPrompts={newsPrompts}
            loading={promptsLoading}
            error={promptsError}
            cached={promptsCached}
            onSelect={q => { setTranscript(q + " "); setView("capture"); }}
            onRefresh={loadNewsPrompts}
          />
        )}

        {view === "archive" && !selectedEntry && (
          <ArchiveView
            entries={entries}
            searchQ={searchQ}
            onSearchChange={setSearchQ}
            onSelectEntry={entry => { setSelected(entry); setRelated([]); }}
          />
        )}

        {view === "archive" && selectedEntry && (
          <EntryDetail
            entry={selectedEntry}
            relatedEntries={relatedEntries}
            onBack={() => setSelected(null)}
            onDelete={() => { persist(entries.filter(e => e.id !== selectedEntry.id)); setSelected(null); }}
            onOpenRelated={entry => { setSelected(entry); setRelated([]); }}
          />
        )}

        {view === "coach" && (
          <CoachView
            data={coachData}
            connections={connections}
            loading={coachLoading}
            entryCount={entries.length}
            onRefresh={() => { setCoachData(null); setConnections(null); loadCoach(); }}
          />
        )}

        {view === "analytics" && (
          <AnalyticsView
            entries={entries}
            openStreak={openStreak}
          />
        )}
      </div>

      {/* ── Digest modal ── */}
      {showDigest && (
        <DigestModal
          digest={digest}
          onClose={() => setShowDigest(false)}
          onRegenerate={() => { setDigest(null); setShowDigest(false); buildDigest(); }}
        />
      )}

      {/* ── Bottom tab bar ── */}
      <div style={tabBar}>
        {NAV_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key)}
            style={{
              flex:           1,
              border:         "none",
              background:     "transparent",
              cursor:         "pointer",
              padding:        "8px 2px 4px",
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              gap:            2,
              color:          view === tab.key ? tokens.blue : tokens.ter,
              fontFamily:     tokens.font,
              transition:     "color 0.15s",
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, fontWeight: view === tab.key ? 600 : 400 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── What's New modal ── */}
      {showWhatsNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 430, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: tokens.text, margin: 0 }}>What's New in v{VERSION}</h2>
                <p style={{ fontSize: 12, color: tokens.ter, margin: "2px 0 0" }}>Starlog update</p>
              </div>
              <span style={{ fontSize: 32 }}>✨</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {WHATS_NEW.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.blue, flexShrink: 0, marginTop: 6 }} />
                  <p style={{ fontSize: 14, color: tokens.text, lineHeight: 1.5, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
            <button
              onClick={dismissWhatsNew}
              style={{ width: "100%", padding: "14px", background: tokens.blue, border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
