// Mock data in the exact backend shapes. Dates are relative to "today",
// ISO strings WITHOUT timezone (treated as UTC by the helpers).

function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toIso(ms) {
  return new Date(ms).toISOString().slice(0, 19);
}

function isoAgo(days, hour, minute) {
  if (days === 0) {
    return toIso(Date.now() - 20 * 60000);
  }
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, minute || 0, 0, 0);
  return toIso(d.getTime());
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

/* ------------------------------------------------------------------ */
/* SPEECH SESSIONS                                                     */
/* ------------------------------------------------------------------ */

// None of these sentences contain the filler words used below
// (um, uh, like, you know, basically, actually, i mean, sort of).
const SENTENCES = [
  "This is something that affects almost every person in our daily lives.",
  "There are several reasons why I believe this matters more than we think.",
  "First, consider how quickly things have changed over the last decade.",
  "Many people ignore the small details but those details shape the outcome.",
  "For example, a student who practices every day improves much faster.",
  "Second, we need to look at the evidence instead of relying on opinions.",
  "Research shows that consistent effort beats occasional bursts of intensity.",
  "Of course, some people disagree and that is a fair point to consider.",
  "However, when we compare both sides the balance clearly favors action.",
  "Third, the long term benefits are far greater than the short term costs.",
  "If we work together we can build habits that truly last.",
  "In my experience, small steps taken regularly lead to real progress.",
  "To sum up, this topic deserves our attention and our honest effort.",
  "Thank you for listening and I hope this gave you something to think about.",
];

function makeTranscript(topic, fillers, idx) {
  const sentences = ["Today I want to talk about " + topic.toLowerCase() + "."];
  for (let i = 0; i < 9; i++) {
    sentences.push(SENTENCES[(idx * 3 + i) % SENTENCES.length]);
  }
  const words = sentences.join(" ").split(" ");

  const list = [];
  Object.keys(fillers).forEach(function (k) {
    for (let i = 0; i < fillers[k]; i++) list.push(k);
  });

  // Fisher-Yates shuffle with a seeded generator
  const r = rng(idx * 31 + 7);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }

  // Insert from the back so earlier positions stay valid
  const n = list.length;
  for (let i = n - 1; i >= 0; i--) {
    const pos = Math.floor(((i + 1) * words.length) / (n + 1));
    words.splice(pos, 0, list[i] + ",");
  }
  return words.join(" ");
}

const SPEECH_PLAN = [
  { id: "sp_001", days: 41, h: 9, topic: "My Favourite Hobby", wpm: 104, pc: 2, fillers: { um: 6, like: 7, uh: 3 }, base: 4.6, old: true },
  { id: "sp_002", days: 38, h: 10, topic: "Importance of Sleep", wpm: 172, pc: 3, fillers: { um: 5, like: 6, "you know": 2 }, base: 4.9 },
  { id: "sp_003", days: 33, h: 14, topic: "Social Media and Students", wpm: 118, pc: 4, fillers: { um: 4, like: 5, basically: 2 }, base: 5.2 },
  { id: "sp_004", days: 30, h: 8, topic: "Should Homework Be Banned", wpm: 128, pc: 3, fillers: { um: 4, like: 4, uh: 2 }, base: 5.4 },
  { id: "sp_005", days: 30, h: 15, topic: "My Dream Career", wpm: 135, pc: 5, fillers: { um: 3, like: 4, "you know": 2 }, base: 5.6 },
  { id: "sp_006", days: 24, h: 11, topic: "Climate Change and Youth", wpm: 148, pc: 4, fillers: { um: 3, like: 3, basically: 1 }, base: 5.9 },
  { id: "sp_007", days: 19, h: 9, topic: "The Power of Reading", wpm: 142, pc: 3, fillers: { um: 2, like: 3 }, base: 6.2 },
  { id: "sp_008", days: 15, h: 10, topic: "Remote Learning", wpm: 165, pc: 2, fillers: { um: 2, uh: 1, like: 2 }, base: 6.4 },
  { id: "sp_009", days: 15, h: 16, topic: "Technology in Healthcare", wpm: 138, pc: 4, fillers: { um: 2, like: 2 }, base: 6.7 },
  { id: "sp_010", days: 9, h: 12, topic: "Why Failure Teaches Us", wpm: 132, pc: 3, fillers: { um: 1, like: 2, basically: 1 }, base: 7.0 },
  { id: "sp_011", days: 5, h: 9, topic: "Public Transport in Cities", wpm: 145, pc: 6, fillers: { um: 1, like: 1 }, base: 7.3 },
  { id: "sp_012", days: 2, h: 10, topic: "Artificial Intelligence in Education", wpm: 152, pc: 3, fillers: { um: 1, uh: 1 }, base: 7.6 },
  { id: "sp_013", days: 1, h: 13, topic: "Teamwork Beats Talent", wpm: 140, pc: 4, fillers: { like: 1, um: 1 }, base: 7.9 },
  { id: "sp_014", days: 0, h: 0, topic: "Why Public Speaking Matters", wpm: 150, pc: 2, fillers: { um: 1 }, base: 8.2 },
];

function buildSpeech(p, idx) {
  const r = rng(idx * 97 + 13);
  const transcript = makeTranscript(p.topic, p.fillers, idx);
  const wordCount = transcript.split(/\s+/).length;
  const duration = Math.round((wordCount / p.wpm) * 60);

  let totalFillers = 0;
  Object.keys(p.fillers).forEach(function (k) {
    totalFillers += p.fillers[k];
  });

  const pauses = [];
  let totalPause = 0;
  let longest = 0;
  for (let i = 0; i < p.pc; i++) {
    const d = round1(1 + r() * 4);
    let start = ((i + 1) * duration) / (p.pc + 1) - d / 2;
    start = Math.max(0.5, round1(start));
    pauses.push({ start: start, end: round1(start + d), duration: d });
    totalPause += d;
    if (d > longest) longest = d;
  }
  totalPause = round1(totalPause);

  const chunks = 8 + (idx % 8);
  const chunkLen = duration / chunks;
  const paceTimeline = [];
  for (let i = 0; i < chunks; i++) {
    paceTimeline.push({
      start: round1(i * chunkLen),
      end: round1((i + 1) * chunkLen),
      wpm: clamp(Math.round(p.wpm + (r() - 0.5) * 40), 70, 200),
    });
  }

  function s(offset) {
    return clamp(round1(p.base + offset + (r() - 0.5) * 0.4), 0, 10);
  }
  const scores = {
    vocabulary: s(-0.2),
    content_relevance: s(0.3),
    organization: s(0.1),
    critical_thinking: s(-0.5),
    confidence: s(0.2),
  };
  scores.overall = round1(
    (scores.vocabulary + scores.content_relevance + scores.organization + scores.critical_thinking + scores.confidence) / 5
  );

  const early = idx < 7;
  const session = {
    _id: p.id,
    topic: p.topic,
    transcript: transcript,
    duration: duration,
    word_count: wordCount,
    created_at: isoAgo(p.days, p.h, (idx * 7) % 50),
    metrics: {
      wpm: p.wpm,
      filler_data: { total_fillers: totalFillers, breakdown: Object.assign({}, p.fillers) },
      filler_per_100_words: round1((totalFillers / wordCount) * 100),
      pause_data: {
        pause_count: p.pc,
        total_pause_time: totalPause,
        longest_pause: longest,
        pauses: pauses,
      },
      silence_ratio: round2(totalPause / duration),
      vocab_diversity: round2(0.48 + idx * 0.02 + r() * 0.03),
      pace_timeline: paceTimeline,
    },
    scores: scores,
    strengths: early
      ? ["Clear opening that introduced the topic", "Good effort to give examples"]
      : ["Clear opening that introduced the topic", "Good use of examples", "Steady, confident delivery"],
    improvements: early
      ? ["Cut down on filler words such as um and like.", "Slow down slightly in the middle of your speech."]
      : ["Support each point with a concrete example.", "Vary your pace to keep listeners engaged."],
    summary:
      "You spoke on " + p.topic + " and scored " + scores.overall + "/10 overall. " +
      (early
        ? "Filler words are still frequent, so try pausing silently instead."
        : "Your delivery is getting smoother; keep building on your structure."),
  };

  if (p.old) {
    // Old-format session: missing fields must not crash the UI
    delete session.word_count;
    delete session.metrics.filler_per_100_words;
    delete session.metrics.pace_timeline;
    delete session.metrics.pause_data.pauses;
  }
  return session;
}

/* ------------------------------------------------------------------ */
/* DEBATE SESSIONS                                                     */
/* ------------------------------------------------------------------ */

const EVIDENCE_MARKERS = ["because", "for example", "for instance", "research", "studies", "according to", "data", "therefore", "evidence"];

function countMarker(text, marker) {
  const re = new RegExp("\\b" + marker + "\\b", "gi");
  const m = text.match(re);
  return m ? m.length : 0;
}

function lengthTrend(counts) {
  if (counts.length < 3) return "not enough turns to determine";
  const mid = Math.floor(counts.length / 2);
  const first = counts.slice(0, mid);
  const second = counts.slice(counts.length - mid);
  const avg = function (a) {
    return a.reduce(function (x, y) { return x + y; }, 0) / a.length;
  };
  const ratio = avg(second) / avg(first);
  if (ratio > 1.15) return "increasing";
  if (ratio < 0.85) return "decreasing";
  return "stable";
}

const DEBATE_PLAN = [
  {
    id: "db_001", days: 36, h: 10, status: "completed", topic: "Social media does more harm than good",
    stance: "support", ai: "oppose", mins: 10, used: [8, 20], base: 5.0,
    rel: [null, 0.34, 0.41, 0.29],
    turns: [
      ["I support this motion because social media is designed to keep people scrolling, and that constant pull damages attention and mental wellbeing for many young users.",
       "Social media also connects people and gives everyone a voice. Why ignore those benefits?"],
      ["Connection exists, but research shows heavy users report more loneliness. Online contact often replaces real conversations instead of adding to them.",
       "Platforms now offer screen time limits and content controls, so users can manage their own habits."],
      ["Those tools are optional and easy to skip. For example, most teenagers never change default settings, so the harm continues.",
       "Then the solution is education, not condemning the whole technology."],
      ["Education helps, but it is slow. Therefore the business model that rewards outrage needs to change first.",
       "That is a fair point about incentives, though it still shows regulation could fix the model."],
    ],
  },
  {
    id: "db_002", days: 27, h: 14, status: "completed", topic: "Homework should be abolished in schools",
    stance: "oppose", ai: "support", mins: 10, used: [9, 5], base: 5.6,
    rel: [null, 0.52, 0.61, 0.47, 0.58],
    turns: [
      ["I oppose abolishing homework because practice outside class helps students remember what they learned and builds responsibility for their own progress.",
       "Many students are overloaded and lose sleep. Shouldn't school end when the bell rings?"],
      ["Overload is a real issue, but the answer is better homework, not none. Studies show short focused tasks improve retention without hurting sleep.",
       "Yet students with less support at home are disadvantaged by homework."],
      ["That is why schools can offer supervised study hours. For example, an after-school library session gives everyone the same resources.",
       "That costs money and staff that many schools do not have."],
      ["True, but the cost of weaker learning is higher. Data from several countries links regular practice to better exam results.",
       "Correlation is not causation, and countries differ in many other ways."],
      ["Fair, so I would say homework works best in moderation, and abolishing it entirely removes a useful tool.",
       "Moderation is reasonable, and I would agree limits are the key."],
    ],
  },
  {
    id: "db_003", days: 17, h: 9, status: "completed", topic: "Remote work should be the default",
    stance: "support", ai: "oppose", mins: 5, used: [4, 40], base: 6.3,
    rel: [null, 0.58, 0.66, 0.5],
    turns: [
      ["I support remote work as the default because it saves commuting time, widens the hiring pool, and lets people organize their day around focused work.",
       "Offices build culture and spontaneous collaboration that video calls cannot replace."],
      ["Culture can be built through regular team meetups. According to several company surveys, remote staff report similar engagement when managers communicate clearly.",
       "Junior employees learn faster by watching colleagues in person."],
      ["Mentoring can be scheduled, and recorded sessions actually let juniors review lessons again. Therefore remote learning can be equally effective.",
       "Scheduled mentoring lacks the small everyday moments that teach the most."],
      ["Those moments matter, yet many workers are more productive at home, so flexibility should be the default with office days as an option.",
       "A hybrid default sounds closer to what most teams want."],
    ],
  },
  {
    id: "db_004", days: 8, h: 13, status: "completed", topic: "Artificial intelligence will create more jobs than it destroys",
    stance: "support", ai: "oppose", mins: 10, used: [9, 45], base: 6.9,
    rel: [null, 0.6, 0.7, 0.66, 0.72],
    turns: [
      ["I support this motion because every major technology has replaced some tasks while creating new industries, and AI is already creating roles nobody imagined ten years ago.",
       "Previous technologies moved slowly. AI could automate many jobs at once."],
      ["Speed is a concern, but reports on the labor market show new roles like data annotators and prompt engineers growing every year because companies need them.",
       "Those new roles are far fewer than the jobs at risk, and they need different skills."],
      ["That is why reskilling matters. For example, governments funding training programs helped workers move during past industrial shifts.",
       "Reskilling has a mixed record, and older workers often get left behind."],
      ["The record is mixed, but better design of programs can help. Evidence from Nordic countries shows targeted support works.",
       "Nordic systems are expensive and hard to copy elsewhere."],
      ["Copying every detail is not needed. Therefore even smaller versions of these programs can reduce harm while the new jobs grow.",
       "You make a hopeful case, though the transition remains a real risk."],
    ],
  },
  {
    id: "db_005", days: 3, h: 11, status: "completed", topic: "Public transport should be free for everyone",
    stance: "oppose", ai: "support", mins: 10, used: [9, 10], base: 7.4,
    rel: [null, 0.62, 0.5, 0.44, 0.7, 0.76],
    turns: [
      ["I oppose free public transport because someone must pay for it, and taxes would fund a service that many people use only occasionally.",
       "Free transport reduces traffic and helps low income families the most."],
      ["Targeted discounts help low income families more efficiently. Data from cities with concession cards shows the money reaches those who need it.",
       "Fare collection itself is costly, so free service could actually save money."],
      ["Collection costs are real but usually smaller than lost revenue. For instance, most systems recover a large share of their budget from fares.",
       "Then higher usage would justify spending more on the network."],
      ["More riders also means crowded buses, so quality could drop without extra funding, and that hurts the people we want to help.",
       "Funding can come from congestion charges on cars."],
      ["That is a good idea because it links payment to the problem. However, it is a separate policy from making all travel free.",
       "Fair enough, but you accept the funding can be found."],
      ["I accept it can be found, so my position is that fares plus targeted support is the most balanced and sustainable answer, because it keeps service quality high.",
       "Balanced, though I still think free access would change habits more."],
    ],
  },
  {
    id: "db_006", days: 1, h: 15, status: "active", topic: "Video games improve problem solving",
    stance: "support", ai: "oppose", mins: 10, used: null, base: 0,
    rel: [null],
    turns: [
      ["I support this motion because many games reward planning, testing ideas, and learning from mistakes.",
       "Games are mostly entertainment. Where is the proof that skills transfer?"],
    ],
  },
];

function buildDebate(p, idx) {
  const r = rng(idx * 53 + 5);
  const startIso = isoAgo(p.days, p.h, 0);
  const startMs = Date.parse(startIso + "Z");

  const conversation = [];
  const perTurn = [];
    const wordCounts = [];
  const breakdown = {};
  let totalEvidence = 0;

  p.turns.forEach(function (t, i) {
    conversation.push({ role: "user", content: t[0], timestamp: toIso(startMs + i * 2 * 60000) });
    conversation.push({ role: "assistant", content: t[1], timestamp: toIso(startMs + (i * 2 + 1) * 60000) });

    const wc = t[0].split(/\s+/).length;
    let ec = 0;
    EVIDENCE_MARKERS.forEach(function (m) {
      const c = countMarker(t[0], m);
      if (c > 0) {
        breakdown[m] = (breakdown[m] || 0) + c;
        ec += c;
      }
    });
    totalEvidence += ec;
    wordCounts.push(wc);
    perTurn.push({ turn: i + 1, word_count: wc, evidence_count: ec, relevance: p.rel[i] });
  });

  if (p.status === "active") {
    return {
      _id: p.id,
      topic: p.topic,
      stance: p.stance,
      ai_stance: p.ai,
      status: "active",
      start_time: startIso,
      ended_at: null,
      duration_minutes: p.mins,
      created_at: startIso,
      conversation: conversation,
      metrics: null,
      per_turn: [],
      scores: null,
      strengths: [],
      improvements: [],
      summary: "",
    };
  }

  const perTurnScores = p.rel.filter(function (v) { return v !== null; });
  const avgRel = perTurnScores.reduce(function (a, b) { return a + b; }, 0) / perTurnScores.length;

  function s(offset) {
    return clamp(round1(p.base + offset + (r() - 0.5) * 0.4), 0, 10);
  }
  const scores = {
    argument_strength: s(0.1),
    logic: s(0.2),
    rebuttal_quality: s(-0.3),
    persuasiveness: s(-0.1),
    critical_thinking: s(-0.2),
  };
  scores.overall = round1(
    (scores.argument_strength + scores.logic + scores.rebuttal_quality + scores.persuasiveness + scores.critical_thinking) / 5
  );

  const endMs = startMs + (p.used[0] * 60 + p.used[1]) * 1000;
  const early = idx < 2;

  return {
    _id: p.id,
    topic: p.topic,
    stance: p.stance,
    ai_stance: p.ai,
    status: "completed",
    start_time: startIso,
    ended_at: toIso(endMs),
    duration_minutes: p.mins,
    created_at: startIso,
    conversation: conversation,
    metrics: {
      rebuttal_data: { average_relevance: round2(avgRel), per_turn_scores: perTurnScores },
      evidence_data: { total_evidence_markers: totalEvidence, breakdown: breakdown },
      vocab_diversity: round2(0.5 + idx * 0.03 + r() * 0.03),
      length_trend: { word_counts_per_turn: wordCounts, trend: lengthTrend(wordCounts) },
    },
    per_turn: perTurn,
    scores: scores,
    strengths: early
      ? ["Clear opening position", "Stayed calm under pressure"]
      : ["Clear opening position", "Good use of examples", "Answered counter-points directly"],
    improvements: early
      ? ["Respond directly to the AI's last point before adding new ideas.", "Back up claims with evidence."]
      : ["Anticipate the strongest counter-argument earlier.", "Keep later answers as detailed as the first."],
    summary:
      "You argued the " + p.stance + " side on this topic and scored " + scores.overall + "/10 overall. " +
      (early
        ? "Relevance to the AI's points was inconsistent."
        : "Your rebuttals are becoming sharper and better supported."),
  };
}

// Exported UNSORTED on purpose, to test the frontend sorting
export const MOCK_SPEECH_SESSIONS = SPEECH_PLAN.map(buildSpeech).reverse();

const builtDebates = DEBATE_PLAN.map(buildDebate);
export const MOCK_DEBATE_SESSIONS = [2, 0, 5, 4, 1, 3].map(function (i) {
  return builtDebates[i];
});