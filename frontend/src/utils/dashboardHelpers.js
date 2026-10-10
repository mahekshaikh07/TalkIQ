import {
  RELEVANCE_GREEN,
  RELEVANCE_YELLOW,
  COLORS,
} from "../config/dashboardConfig";

export const SPEECH_SCORE_KEYS = ["vocabulary", "content_relevance", "organization", "critical_thinking", "confidence"];
export const DEBATE_SCORE_KEYS = ["argument_strength", "logic", "rebuttal_quality", "persuasiveness", "critical_thinking"];

const SIMPLE_NAMES = {
  vocabulary: "Vocabulary",
  content_relevance: "Staying on topic",
  organization: "Structuring your speech",
  critical_thinking: "Critical thinking",
  confidence: "Confidence",
  argument_strength: "Argument strength",
  logic: "Logical reasoning",
  rebuttal_quality: "Answering counter-points",
  persuasiveness: "Persuasiveness",
};

/* ---------- basic utils ---------- */

export function isNum(v) {
  return typeof v === "number" && !isNaN(v);
}

export function parseDate(iso) {
  if (!iso) return null;
  const s = String(iso);
  const hasZone = /(Z|[+-]\d{2}:\d{2})$/.test(s);
  const d = new Date(hasZone ? s : s + "Z");
  return isNaN(d.getTime()) ? null : d;
}

export function sortByCreated(list) {
  return (list || []).slice().sort(function (a, b) {
    const da = parseDate(a && a.created_at);
    const db = parseDate(b && b.created_at);
    return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
  });
}

export function onlyCompleted(debates) {
  return (debates || []).filter(function (d) {
    return d && d.status === "completed";
  });
}

// Add a _type field so speech and debate can be mixed in one list
export function tagSessions(speech, debates) {
  const s = (speech || []).map(function (x) {
    return Object.assign({}, x, { _type: "speech" });
  });
  const d = onlyCompleted(debates).map(function (x) {
    return Object.assign({}, x, { _type: "debate" });
  });
  return sortByCreated(s.concat(d));
}

/* ---------- formatting ---------- */

export function fmt1(v, fallback) {
  return isNum(v) ? v.toFixed(1) : fallback === undefined ? "Not available" : fallback;
}

export function fmtPct(v, fallback) {
  return isNum(v) ? Math.round(v * 100) + "%" : fallback === undefined ? "Not available" : fallback;
}

export function fmtDate(iso) {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Not available";
}

export function fmtShortDate(iso) {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "";
}

export function fmtDuration(seconds) {
  if (!isNum(seconds)) return "Not available";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? m + "m " + s + "s" : s + "s";
}

export function fmtClock(seconds) {
  if (!isNum(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + (s < 10 ? "0" + s : s);
}

export function readableKey(key) {
  return String(key || "")
    .split("_")
    .map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

export function simpleName(key) {
  return SIMPLE_NAMES[key] || readableKey(key);
}

export function resultPath(session) {
  return (session._type === "debate" ? "/debate-result/" : "/speech-result/") + session._id;
}

/* ---------- home dashboard calculations ---------- */

export function localDateKey(d) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return d.getFullYear() + "-" + (m < 10 ? "0" + m : m) + "-" + (day < 10 ? "0" + day : day);
}

export function calculateStreak(sessions) {
  const keys = {};
  (sessions || []).forEach(function (s) {
    const d = parseDate(s.created_at);
    if (d) keys[localDateKey(d)] = true;
  });
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!keys[localDateKey(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
    if (!keys[localDateKey(cursor)]) return 0;
  }
  let streak = 0;
  while (keys[localDateKey(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function averageOverall(sessions) {
  const vals = (sessions || [])
    .map(function (s) { return s.scores && s.scores.overall; })
    .filter(isNum);
  if (!vals.length) return null;
  return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
}

export function bestSession(sessions) {
  let best = null;
  (sessions || []).forEach(function (s) {
    const v = s.scores && s.scores.overall;
    if (isNum(v) && (best === null || v > best.scores.overall)) best = s;
  });
  return best;
}

export function scoreSeries(sessions) {
  return sortByCreated(sessions)
    .filter(function (s) { return s.scores && isNum(s.scores.overall); })
    .map(function (s) {
      return { id: s._id, date: fmtShortDate(s.created_at), score: s.scores.overall };
    });
}

export function averageScores(sessions, keys) {
  const out = {};
  keys.forEach(function (k) {
    const vals = sessions
      .map(function (s) { return s.scores && s.scores[k]; })
      .filter(isNum);
    out[k] = vals.length ? vals.reduce(function (a, b) { return a + b; }, 0) / vals.length : 0;
  });
  return out;
}

// Returns { data: [{axis, first, latest}], showFirst }
export function skillProfileData(sessions, keys) {
  const sorted = sortByCreated(sessions);
  if (!sorted.length) return { data: [], showFirst: false };
  const latest = averageScores(sorted.slice(-3), keys);
  const showFirst = sorted.length >= 4;
  const first = showFirst ? averageScores(sorted.slice(0, 3), keys) : null;
  const data = keys.map(function (k) {
    return {
      axis: readableKey(k),
      latest: Math.round(latest[k] * 10) / 10,
      first: first ? Math.round(first[k] * 10) / 10 : null,
    };
  });
  return { data: data, showFirst: showFirst };
}

export function fillerSeries(speech) {
  return sortByCreated(speech)
    .filter(function (s) { return s.metrics && isNum(s.metrics.filler_per_100_words); })
    .map(function (s) {
      return { id: s._id, date: fmtShortDate(s.created_at), value: s.metrics.filler_per_100_words };
    });
}

export function wpmSeries(speech) {
  return sortByCreated(speech)
    .filter(function (s) { return s.metrics && isNum(s.metrics.wpm); })
    .map(function (s) {
      return { id: s._id, date: fmtShortDate(s.created_at), value: s.metrics.wpm };
    });
}

export function relevanceSeries(debates) {
  return sortByCreated(onlyCompleted(debates))
    .filter(function (d) {
      return d.metrics && d.metrics.rebuttal_data && isNum(d.metrics.rebuttal_data.average_relevance);
    })
    .map(function (d) {
      return { id: d._id, date: fmtShortDate(d.created_at), value: Math.round(d.metrics.rebuttal_data.average_relevance * 100) };
    });
}

// Focus This Week: lowest average key over the last 5 sessions of each type
export function focusThisWeek(speech, debates) {
  const sp = sortByCreated(speech).slice(-5);
  const db = sortByCreated(onlyCompleted(debates)).slice(-5);
  const candidates = [];

  function consider(list, keys, type) {
    if (!list.length) return;
    const avg = averageScores(list, keys);
    keys.forEach(function (k) {
      candidates.push({ key: k, avg: avg[k], type: type });
    });
  }
  consider(sp, SPEECH_SCORE_KEYS, "speech");
  consider(db, DEBATE_SCORE_KEYS, "debate");
  if (!candidates.length) return null;

  candidates.sort(function (a, b) { return a.avg - b.avg; });
  const lowest = candidates[0];
  const source = lowest.type === "speech" ? sp : db;
  const latest = source[source.length - 1];
  const tip = latest && latest.improvements && latest.improvements[0] ? latest.improvements[0] : null;

  return {
    key: lowest.key,
    name: simpleName(lowest.key),
    average: lowest.avg,
    type: lowest.type,
    tip: tip,
  };
}

export function recentSessions(tagged, n) {
  return (tagged || []).slice().reverse().slice(0, n || 8);
}

/* ---------- calendar heatmap ---------- */

export function buildHeatmap(sessions, weeks) {
  const n = weeks || 12;
  const counts = {};
  (sessions || []).forEach(function (s) {
    const d = parseDate(s.created_at);
    if (!d) return;
    const k = localDateKey(d);
    counts[k] = (counts[k] || 0) + 1;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (n - 1) * 7);

  const cols = [];
  for (let w = 0; w < n; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      const key = localDateKey(day);
      col.push({ key: key, date: day, count: counts[key] || 0, future: day > today });
    }
    cols.push(col);
  }
  return cols;
}

export function heatColor(count) {
  const level = count <= 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;
  return COLORS.heat[level];
}

/* ---------- result pages ---------- */

export function findPrevious(list, session) {
  const sorted = sortByCreated(list);
  const i = sorted.findIndex(function (s) { return s._id === session._id; });
  return i > 0 ? sorted[i - 1] : null;
}

// Returns null when no arrow should be shown
export function compareMetric(current, previous, lowerIsBetter) {
  if (!isNum(current) || !isNum(previous)) return null;
  if (current === previous) return { direction: "same", good: null, diff: 0 };
  const up = current > previous;
  return {
    direction: up ? "up" : "down",
    good: lowerIsBetter ? !up : up,
    diff: Math.abs(current - previous),
  };
}

export function relevanceColor(v) {
  if (!isNum(v)) return COLORS.muted;
  if (v > RELEVANCE_GREEN) return COLORS.good;
  if (v >= RELEVANCE_YELLOW) return COLORS.warn;
  return COLORS.bad;
}

export function relevanceLabel(v) {
  if (!isNum(v)) return null;
  if (v > RELEVANCE_GREEN) return "Relevant";
  if (v >= RELEVANCE_YELLOW) return "Okay";
  return "Off-topic";
}

// Splits a transcript into [{ text, isFiller }] for highlighting
export function splitTranscript(transcript, fillerKeys) {
  const text = transcript || "";
  const keys = (fillerKeys || []).filter(Boolean);
  if (!keys.length) return [{ text: text, isFiller: false }];

  const escaped = keys
    .slice()
    .sort(function (a, b) { return b.length - a.length; })
    .map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
  const re = new RegExp("\\b(" + escaped.join("|") + ")\\b", "gi");

  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index), isFiller: false });
    parts.push({ text: m[0], isFiller: true });
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (last < text.length) parts.push({ text: text.slice(last), isFiller: false });
  return parts;
}

export function timeUsed(debate) {
  const a = parseDate(debate.start_time);
  const b = parseDate(debate.ended_at);
  if (!a || !b) return null;
  const secs = Math.max(0, Math.round((b.getTime() - a.getTime()) / 1000));
  return { minutes: Math.floor(secs / 60), seconds: secs % 60 };
}

export function userMessages(debate) {
  return ((debate && debate.conversation) || []).filter(function (m) {
    return m.role === "user";
  });
}

export function topEvidenceKeywords(breakdown, n) {
  return Object.keys(breakdown || {})
    .sort(function (a, b) { return breakdown[b] - breakdown[a]; })
    .slice(0, n || 3);
}

export function trendBadge(trend) {
  if (trend === "increasing") return { label: "Growing", tone: "green" };
  if (trend === "decreasing") return { label: "Shrinking", tone: "orange" };
  if (trend === "stable") return { label: "Steady", tone: "blue" };
  return { label: "Not enough turns", tone: "gray" };
}