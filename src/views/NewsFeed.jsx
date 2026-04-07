import { tokens, cardStyle } from "../lib/styles.js";
import { RSS_FEEDS } from "../lib/constants.js";
import { timeAgo } from "../lib/utils.js";
import { SectionHeader, EmptyState, LoadingCard, GhostButton } from "../components/index.jsx";

export function NewsFeedView({ items, loading, error, activeFeed, onFeedChange, onRefresh, onReflect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <SectionHeader
        title="Live News Feed"
        sub="Real headlines from Google News"
        action={<GhostButton label={loading ? "…" : "↻"} onClick={onRefresh} disabled={loading} />}
      />

      {/* Feed selector */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
        {RSS_FEEDS.map((feed, i) => (
          <button
            key={i}
            onClick={() => onFeedChange(i)}
            style={{
              padding:      "7px 14px",
              borderRadius: tokens.radius.pill,
              border:       `1px solid ${i === activeFeed ? tokens.blue : tokens.border}`,
              background:   i === activeFeed ? tokens.blue : "transparent",
              color:        i === activeFeed ? "#fff" : tokens.sub,
              fontSize:     12,
              fontWeight:   500,
              cursor:       "pointer",
              whiteSpace:   "nowrap",
              flexShrink:   0,
              transition:   "all 0.15s",
            }}
          >
            {feed.label}
          </button>
        ))}
      </div>

      {loading && <LoadingCard message={`Loading ${RSS_FEEDS[activeFeed].label}…`} />}

      {!loading && error && (
        <EmptyState
          emoji="📡"
          title="Feed unavailable"
          sub="The RSS feed couldn't load. This works fully when deployed to Vercel."
          action={
            <button
              onClick={onRefresh}
              style={{ background: tokens.blue, border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
            >
              Retry
            </button>
          }
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...cardStyle({ padding: "12px 16px" }), background: `${tokens.blue}08`, borderColor: `${tokens.blue}20` }}>
            <p style={{ fontSize: 12, color: tokens.blue, fontWeight: 600, margin: "0 0 3px" }}>
              💡 Connect news to your inner life
            </p>
            <p style={{ fontSize: 12, color: tokens.sub, lineHeight: 1.6, margin: 0 }}>
              Tap "Reflect" on any article to journal about how it connects to you personally.
            </p>
          </div>

          {items.map((item, i) => (
            <div key={i} style={cardStyle({ padding: "14px 16px" })}>
              <p style={{ fontSize: 15, fontWeight: 600, color: tokens.text, lineHeight: 1.45, margin: "0 0 6px" }}>
                {item.title}
              </p>
              {item.source && (
                <p style={{ fontSize: 11, color: tokens.ter, margin: "0 0 8px" }}>
                  {item.source} · {timeAgo(item.pubDate)}
                </p>
              )}
              {item.description && (
                <p style={{ fontSize: 13, color: tokens.sub, lineHeight: 1.6, margin: "0 0 10px" }}>
                  {item.description.slice(0, 160)}{item.description.length > 160 ? "…" : ""}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, fontWeight: 500, color: tokens.blue, padding: "7px 14px", border: `1px solid ${tokens.blue}30`, borderRadius: tokens.radius.pill, background: `${tokens.blue}08` }}
                >
                  Read ↗
                </a>
                <button
                  onClick={() => onReflect(item.title)}
                  style={{ fontSize: 12, fontWeight: 500, color: tokens.green, padding: "7px 14px", border: `1px solid ${tokens.green}30`, borderRadius: tokens.radius.pill, background: `${tokens.green}08`, cursor: "pointer" }}
                >
                  Reflect ✍️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
