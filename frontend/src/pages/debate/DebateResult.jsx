import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Target,
  Quote,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDebateSessions } from "../../api/sessionsApi";
import { COLORS } from "../../config/dashboardConfig";
import {
  DEBATE_SCORE_KEYS,
  isNum,
  fmt1,
  fmtPct,
  fmtDate,
  parseDate,
  findPrevious,
  compareMetric,
  onlyCompleted,
  relevanceLabel,
  timeUsed,
  topEvidenceKeywords,
  trendBadge,
} from "../../utils/dashboardHelpers";
import { ResultLoading, ResultError, ResultNotFound } from "../../components/dashboard/ResultStates";
import ScoreRing from "../../components/dashboard/ScoreRing";
import MetricCard from "../../components/dashboard/MetricCard";
import ScoreBars from "../../components/dashboard/ScoreBars";
import StrengthsImprovements from "../../components/dashboard/StrengthsImprovements";
import ChartCard from "../../components/dashboard/ChartCard";
import { TOOLTIP_STYLE, AXIS_TICK } from "../../components/dashboard/chartStyles";

const STANCE_PAST = { support: "supported", oppose: "opposed" };

export default function DebateResult() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [list, setList] = useState([]);

  function fetchAll() {
    getDebateSessions()
      .then(function (data) {
        setList(onlyCompleted(data || []));
        setStatus("ready");
      })
      .catch(function (err) {
        setErrorMsg(err && err.message ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }

  function load() {
    setStatus("loading");
    fetchAll();
  }

  useEffect(function () {
    fetchAll();
  }, []);

  function goBack() {
    navigate("/dashboard");
  }

  const session = list.find(function (s) { return s._id === id; });

  let body;

  if (status === "loading") {
    body = <ResultLoading />;
  } else if (status === "error") {
    body = <ResultError message={errorMsg} onRetry={load} />;
  } else if (!session) {
    body = <ResultNotFound text="Debate result not found" onBack={goBack} />;
  } else {
    const prev = findPrevious(list, session);
    const m = session.metrics || {};
    const pm = (prev && prev.metrics) || {};
    const rd = m.rebuttal_data || {};
    const prd = pm.rebuttal_data || {};
    const ev = m.evidence_data || {};
    const pev = pm.evidence_data || {};
    const lt = m.length_trend || {};
    const trend = trendBadge(lt.trend);
    const used = timeUsed(session);
    const keywords = topEvidenceKeywords(ev.breakdown, 3);

    const perTurn = Array.isArray(session.per_turn) ? session.per_turn : [];
    const relevanceData = perTurn.map(function (t) {
      return { turn: t.turn, relevance: isNum(t.relevance) ? Math.round(t.relevance * 100) : null };
    });
    const hasRelevance = relevanceData.some(function (t) { return t.relevance !== null; });
    const wordData = perTurn.map(function (t) {
      return { turn: t.turn, words: t.word_count };
    });

    const conversation = Array.isArray(session.conversation) ? session.conversation : [];
    const aiStance = session.ai_stance || (session.stance === "support" ? "oppose" : "support");

    body = (
      <div className="space-y-6">
        {/* Header */}
        <div className="glass flex flex-col gap-6 rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
              DEBATE RESULT
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-[#334155] md:text-3xl">
              {session.topic}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {fmtDate(session.created_at)}
              </span>
              {used && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {used.minutes}m {used.seconds}s used
                </span>
              )}
              <span>
                You {STANCE_PAST[session.stance] || session.stance} · AI {STANCE_PAST[aiStance] || aiStance}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              {session.summary || "No summary available for this debate."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <ScoreRing value={session.scores ? session.scores.overall : null} />
            <div>
              <p className="font-display text-sm font-semibold text-[#334155]">Overall Score</p>
              <p className="text-2xl font-semibold text-[#334155]">
                {fmt1(session.scores ? session.scores.overall : null, "-")}
                <span className="text-sm font-normal text-[#94A3B8]">/10</span>
              </p>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={Target}
            label="Staying on topic"
            value={fmtPct(rd.average_relevance)}
            note={relevanceLabel(rd.average_relevance) || undefined}
            change={compareMetric(rd.average_relevance, prd.average_relevance, false)}
          />
          <MetricCard
            icon={Quote}
            label="Evidence words"
            value={isNum(ev.total_evidence_markers) ? String(ev.total_evidence_markers) : "Not available"}
            note={keywords.length ? "Most used: " + keywords.join(", ") : undefined}
            change={compareMetric(ev.total_evidence_markers, pev.total_evidence_markers, false)}
          />
          <MetricCard
            icon={BookOpen}
            label="Vocabulary Variety"
            value={fmtPct(m.vocab_diversity)}
            change={compareMetric(m.vocab_diversity, pm.vocab_diversity, false)}
          />
          <MetricCard
            icon={TrendingUp}
            label="Answer length"
            value={trend.label}
            note="How your replies changed in length"
          />
        </div>

        {/* Per turn charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard
            title="Relevance of each turn"
            isEmpty={!hasRelevance}
            emptyText="Not enough turns to compare yet."
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={relevanceData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="turn" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={function (v) { return "Turn " + v; }}
                  formatter={function (v) { return [v + "%", "Relevance"]; }}
                />
                <Line type="monotone" dataKey="relevance" stroke={COLORS.debate} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Words in each turn"
            isEmpty={wordData.length === 0}
            emptyText="Not available for this debate."
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={wordData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="turn" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={function (v) { return "Turn " + v; }}
                  formatter={function (v) { return [v + " words", "Length"]; }}
                />
                <Bar dataKey="words" fill={COLORS.debate} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ScoreBars scores={session.scores} keys={DEBATE_SCORE_KEYS} color={COLORS.debate} />

        <StrengthsImprovements
          strengths={session.strengths}
          improvements={session.improvements}
        />

        {/* Full conversation */}
        <ChartCard
          title="Full debate"
          isEmpty={conversation.length === 0}
          emptyText="No messages saved for this debate."
        >
          <div className="space-y-4">
            {conversation.map(function (turn, i) {
              const isUser = turn.role === "user";
              const when = parseDate(turn.timestamp);
              return (
                <div key={i} className={isUser ? "ml-auto max-w-2xl" : "max-w-2xl"}>
                  <p className={"mb-1 text-xs font-medium text-[#94A3B8] " + (isUser ? "text-right" : "")}>
                    {isUser ? "You" : "AI Opponent"}
                    {when ? " · " + when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                  </p>
                  <div
                    className={
                      "rounded-2xl border border-white/45 px-4 py-3 text-sm leading-relaxed text-[#334155] whitespace-pre-wrap " +
                      (isUser ? "bg-[#CBD5E1]/70" : "bg-white/80")
                    }
                  >
                    {turn.content}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <div className="flex justify-center pt-2">
          <button
            onClick={function () { navigate("/debate/setup"); }}
            className="rounded-xl bg-[#334155] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B]"
          >
            Start another debate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <button
        onClick={goBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#334155]"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </button>
      {body}
    </div>
  );
}
