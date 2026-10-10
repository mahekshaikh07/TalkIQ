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
  Target,
  Reply,
  Flame,
  Droplet,
  Calendar,
  ChevronDown,
  ChevronUp,
  Share2,
  Download,
  RotateCcw,
} from "lucide-react";

// Fallback metrics if the user lands here directly without session state.
// Swap for the backend's real /debate/end scored response once wired up.
const DEFAULT_METRICS = {
  argumentStrength: 88,
  rebuttalQuality: 76,
  confidence: 92,
  fluency: 85,
};

const METRIC_CONFIG = [
  { key: "argumentStrength", label: "Argument Strength", icon: Target },
  { key: "rebuttalQuality", label: "Rebuttal Quality", icon: Reply },
  { key: "confidence", label: "Confidence", icon: Flame },
  { key: "fluency", label: "Fluency", icon: Droplet },
];

// Mock turn-by-turn breakdown — swap for the real messages array
// passed from DebateSession once /debate/turn history is available
const DEFAULT_TURNS = [
  {
    title: "Opening Statement",
    text: "You framed UBI as economically reckless, citing tax hikes and disincentivized labor participation as key risks — a strong opening rebuttal to the AI's poverty-safety-net argument.",
    feedback: "Good clarity, strong structure",
  },
  {
    title: "Rebuttal to Economic Strain",
    text: "You countered the automation argument by pointing to a shrinking tax base under UBI, though the response could have engaged more directly with the means-testing gap the AI raised.",
    feedback: "Consider addressing counterpoints more directly",
  },
];

export default function DebateReport() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [openTurns, setOpenTurns] = useState({});

  const topic = state?.topic || "Universal Basic Income";
  const stance = state?.stance || "Affirmative";
  const reportDate = state?.date ? new Date(state.date) : new Date();
  const turns = state?.turns?.length ? state.turns : DEFAULT_TURNS;

  const metrics = {
    ...DEFAULT_METRICS,
    ...(state?.metrics
      ? Object.fromEntries(
          Object.entries(state.metrics).map(([k, v]) => [k, Math.round(v)])
        )
      : {}),
  };

  const overallScore = Math.round(
    Object.values(metrics).reduce((a, b) => a + b, 0) / Object.values(metrics).length
  );

  const radarData = METRIC_CONFIG.map(({ key, label }) => ({
    metric: label,
    value: metrics[key],
  }));

  const toggleTurn = (i) => setOpenTurns((prev) => ({ ...prev, [i]: !prev[i] }));

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const ringOffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      {/* Header card */}
      <div className="glass flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="rounded-full bg-[#E2E8F0] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#475569]">
              Debate Report
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Calendar size={13} />
              {reportDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#334155]">
            {topic}
          </h1>
          <p className="mt-1 text-xs text-[#94A3B8]">Stance: {stance}</p>
        </div>

        {/* Overall score ring */}
        <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 self-start sm:self-center">
          <circle cx="38" cy="38" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="7" />
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="none"
            stroke="#334155"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ringOffset}
            transform="rotate(-90 38 38)"
          />
          <text
            x="38"
            y="36"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#334155"
            fontSize="18"
            fontWeight="600"
            fontFamily="Sora, sans-serif"
          >
            {overallScore}
          </text>
          <text
            x="38"
            y="49"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#94A3B8"
            fontSize="9"
            fontFamily="Inter, sans-serif"
          >
            Overall
          </text>
        </svg>
      </div>

      {/* Metrics grid + Debate Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {METRIC_CONFIG.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Icon size={13} />
                  {label}
                </span>
                <span className="font-display text-base font-semibold text-[#334155]">
                  {metrics[key]}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#334155]"
                  style={{ width: `${metrics[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Debate Dimensions radar */}
        <div className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl flex flex-col">
          <h2 className="font-display text-sm font-semibold text-[#334155] mb-2">
            Debate Dimensions
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

      {/* Turn-by-Turn Analysis */}
      <h2 className="font-display text-base font-semibold text-[#334155] mb-4">
        Turn-by-Turn Analysis
      </h2>
      <div className="space-y-3 mb-10">
        {turns.map((turn, i) => (
          <div
            key={turn.title}
            className="glass rounded-2xl border border-white/45 bg-white/70 shadow-sm backdrop-blur-xl overflow-hidden"
          >
            <button
              onClick={() => toggleTurn(i)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-xs font-semibold text-[#334155]">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-[#334155]">
                  {turn.title}
                </span>
              </span>
              {openTurns[i] ? (
                <ChevronUp size={16} className="text-[#94A3B8]" />
              ) : (
                <ChevronDown size={16} className="text-[#94A3B8]" />
              )}
            </button>
            {openTurns[i] && (
              <div className="px-5 pb-4 pl-14">
                <p className="text-xs text-[#64748B] leading-relaxed mb-2">
                  {turn.text}
                </p>
                {turn.feedback && (
                  <p className="text-xs text-emerald-600 font-medium">
                    {turn.feedback}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigator.share?.({ title: "Debate Report", text: `Scored ${overallScore}% on ${topic}` })}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
        >
          <Share2 size={16} />
          Share
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          onClick={() => navigate("/debate/setup")}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
        >
          <RotateCcw size={16} />
          Debate Again
        </button>
      </div>
    </div>
  );
}