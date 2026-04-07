import { THEMES } from "./constants.js";

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const tokens = {
  // Colors
  bg:     "#F2F2F7",
  card:   "rgba(255,255,255,0.92)",
  border: "rgba(0,0,0,0.07)",
  sep:    "rgba(60,60,67,0.12)",
  nav:    "rgba(249,249,249,0.96)",

  // Text
  text:   "#1C1C1E",
  sub:    "#636366",
  ter:    "#AEAEB2",

  // Brand
  blue:   "#007AFF",
  green:  "#34C759",
  red:    "#FF3B30",
  orange: "#FF9500",
  purple: "#AF52DE",
  teal:   "#30B0C7",

  // Typography
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",

  // Radii
  radius: {
    sm:  8,
    md:  12,
    lg:  16,
    xl:  20,
    pill: 999,
  },

  // Shadows
  shadow: {
    card: "0 1px 6px rgba(0,0,0,0.04)",
    nav:  "0 -1px 0 rgba(60,60,67,0.12)",
  },
};

// ─── Style Factories ──────────────────────────────────────────────────────────

/** Base card style with optional overrides */
export function cardStyle(overrides = {}) {
  return {
    background:   tokens.card,
    border:       `1px solid ${tokens.border}`,
    borderRadius: tokens.radius.lg,
    padding:      "16px 18px",
    boxShadow:    tokens.shadow.card,
    ...overrides,
  };
}

/** Theme pill / badge */
export function pillStyle(theme, active = false) {
  const meta  = THEMES[theme] || { color: tokens.blue };
  const color = meta.color;
  return {
    display:      "inline-flex",
    alignItems:   "center",
    gap:          4,
    padding:      "4px 10px",
    borderRadius: tokens.radius.pill,
    background:   active ? `${color}22` : `${color}12`,
    color,
    fontSize:     12,
    fontWeight:   500,
    border:       `1px solid ${color}25`,
    whiteSpace:   "nowrap",
    cursor:       "pointer",
  };
}

/** Highlighted pill (larger, for detail view) */
export function pillStyleLg(theme) {
  return { ...pillStyle(theme, true), fontSize: 13, padding: "6px 14px" };
}

/** Tinted card for alerts / callouts */
export function tintedCard(color, strength = "08", borderStrength = "20") {
  return cardStyle({
    background:   `${color}${strength}`,
    borderColor:  `${color}${borderStrength}`,
  });
}

/** Gradient card (e.g. coach header) */
export const gradientCard = cardStyle({
  background:   `linear-gradient(135deg, ${tokens.blue}, #5856D6)`,
  border:       "none",
  padding:      "20px",
});

// ─── Global CSS String ────────────────────────────────────────────────────────
export const globalCSS = `
  @keyframes fadeup {
    from { opacity: 0; transform: translateY(7px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes recpulse {
    0%, 100% { box-shadow: 0 0 0 0   rgba(255, 59, 48, 0.4); }
    60%       { box-shadow: 0 0 0 14px rgba(255, 59, 48, 0);   }
  }

  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 0; }
  button, input, textarea { font-family: inherit; }
  textarea::placeholder, input::placeholder { color: #C7C7CC; }
  a { color: #007AFF; text-decoration: none; }

  .hov:active  { opacity: 0.7; transform: scale(0.985); }
  .hov:hover   { background: rgba(0, 0, 0, 0.02); }
  .fade-in     { animation: fadeup 0.25s ease; }
`;
