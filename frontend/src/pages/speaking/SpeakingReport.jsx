import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  Mic,
  Wind,
  BookOpen,
  Gauge,
  Calendar,
  Tag,
  ThumbsUp,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  RotateCcw,
} from "lucide-react";

// Fallback metrics if the user lands here directly without session state.
// SpeakingSession sends confidence / fluency / pace live; vocabulary is
// mocked until the backend analysis pipeline covers it.
const DEFAULT_METRICS = {
  confidence: 85,
  fluency: 78,
  vocabulary: 88,
  pace: 70,
};

const METRIC_CONFIG = [
  { key: "confidence", label: "Confidence", icon: Mic },
  { key: "fluency", label: "Fluency", icon: Wind },
  { key: "vocabulary", label: "Vocabulary", icon: BookOpen },
  { key: "pace", label: "Pace", icon: Gauge },
];

const STRENGTHS = [
  "Clear articulation and steady vocal tone throughout",
  "Strong eye contact maintained with the audience",
  "Confident opening and closing statements",
];

const IMPROVEMENT_FEEDBACK =
  "Pacing was slightly rushed in the middle section. Try incorporating deliberate pauses between major points to let the audience digest the information.";

// Mock trend across past sessions - swap for real history once
// GET /api/speaking/history is wired up
const TREND_LABELS = ["Session 1", "Session 2", "Session 3", "Session 4", "Current"];

export default function SpeakingReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const [strengthsOpen, setStrengthsOpen] = useState(false);
  const [improvementOpen, setImprovementOpen] = useState(true);

  const topic = state && state.topic ? state.topic : "Persuasive Pitch";
  const sessionDate = state && state.date ? new Date(state.date) : new Date();

  const incoming = state && state.metrics ? state.metrics : {};
  const metrics = {};
  METRIC_CONFIG.forEach(function (m) {
    const v = incoming[m.key];
    metrics[m.key] = typeof v === "number" ? Math.round(v) : DEFAULT_METRICS[m.key];
  });

  let total = 0;
  METRIC_CONFIG.forEach(function (m) {
    total += metrics[m.key];
  });
  const overallScore = Math.round(total / METRIC_CONFIG.length);

  const radarData = METRIC_CONFIG.map(function (m) {
    return { metric: m.label, value: metrics[m.key] };
  });

  // Mock upward trend leading into the current score
  const trendScores = [
    Math.max(40, overallScore - 17),
    Math.max(40, overallScore - 11),
    Math.max(40, overallScore - 6),
    Math.max(40, overallScore - 3),
    overallScore,
  ];

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const ringOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#334155]">
            Session Report
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {sessionDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={14} />
              {topic}
            </span>
          </div>
        </div>

        {/* Overall score ring */}
        <div className="glass flex items-center gap-4 rounded-2xl border border-white/45 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <svg width="72" height="72" viewBox="0 0 96 96" className="shrink-0">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="#334155"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 48 48)"
            />
            <text
              x="48"
              y="48"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#334155"
              fontSize="22"
              fontWeight="600"
              fontFamily="Sora, sans-serif"
            >
              {overallScore}
            </text>
          </svg>
          <div>
            <p className="font-display text-sm font-semibold text-[#334155]">
              Overall Score
            </p>
            <p className="text-xs text-[#94A3B8] max-w-[160px]">
              Excellent clarity, minor pacing issues.
            </p>
          </div>
        </div>
      </div>

      {/* 4 metric cards + Skill Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {METRIC_CONFIG.map(function (m) {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Icon size={13} />
                    {m.label}
                  </p>
                  <p className="font-display text-lg font-semibold text-[#334155]">
                    {metrics[m.key]}%
                  </p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#334155]"
                    style={{ width: metrics[m.key] + "%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill Profile radar */}
        <div className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl flex flex-col">
          <h2 className="font-display text-sm font-semibold text-[#334155] mb-2">
            Skill Profile
          </h2>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "#64748B", fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#334155"
                  fill="#94A3B8"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feedback + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Actionable Feedback */}
        <div className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
          <h2 className="font-display text-sm font-semibold text-[#334155] mb-4">
            Actionable Feedback
          </h2>

          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden mb-3">
            <button
              onClick={function () { setStrengthsOpen(function (o) { return !o; }); }}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[#334155]">
                <ThumbsUp size={15} />
                Strengths
              </span>
              {strengthsOpen ? (
                <ChevronUp size={16} className="text-[#94A3B8]" />
              ) : (
                <ChevronDown size={16} className="text-[#94A3B8]" />
              )}
            </button>
            {strengthsOpen && (
              <ul className="px-4 pb-4 space-y-1.5">
                {STRENGTHS.map(function (point) {
                  return (
                    <li key={point} className="text-xs text-[#64748B] leading-relaxed">
                      • {point}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <button
              onClick={function () { setImprovementOpen(function (o) { return !o; }); }}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-rose-500">
                <TrendingUp size={15} />
                Areas for Improvement
              </span>
              {improvementOpen ? (
                <ChevronUp size={16} className="text-[#94A3B8]" />
              ) : (
                <ChevronDown size={16} className="text-[#94A3B8]" />
              )}
            </button>
            {improvementOpen && (
              <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed">
                {IMPROVEMENT_FEEDBACK}
              </p>
            )}
          </div>
        </div>

        {/* Performance Trend */}
        <div className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
          <h2 className="font-display text-sm font-semibold text-[#334155] mb-6">
            Performance Trend
          </h2>
          <div className="flex items-end justify-between gap-3 h-40">
            {trendScores.map(function (score, i) {
              const isLast = i === trendScores.length - 1;
              return (
                <div key={TREND_LABELS[i]} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                  {isLast && (
                    <span className="rounded-md bg-[#334155] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {score}
                    </span>
                  )}
                  <div
                    className={"w-full rounded-t-lg " + (isLast ? "bg-[#334155]" : "bg-[#CBD5E1]")}
                    style={{ height: score + "%" }}
                  />
                  <span className="text-[10px] text-[#94A3B8] whitespace-nowrap">
                    {TREND_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={function () { window.print(); }}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          onClick={function () {
            if (navigator.share) {
              navigator.share({ title: "Session Report", text: "Scored " + overallScore + "/100 on " + topic });
            }
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
        >
          <Share2 size={16} />
          Share
        </button>
        <button
          onClick={function () { navigate("/speaking/setup"); }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
        >
          <RotateCcw size={16} />
          Practice Again
        </button>
      </div>
    </div>
  );
}