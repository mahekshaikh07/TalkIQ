import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Gauge, Wind, Pause, VolumeX, BookOpen } from "lucide-react";
import { getSpeechSessions } from "../api/sessionsApi";
import { IDEAL_WPM_MIN, IDEAL_WPM_MAX, COLORS } from "../config/dashboardConfig";
import {
  SPEECH_SCORE_KEYS,
  isNum,
  fmt1,
  fmtPct,
  fmtDate,
  fmtDuration,
  findPrevious,
  compareMetric,
} from "../utils/dashboardHelpers";
import { ResultLoading, ResultError, ResultNotFound } from "../components/dashboard/ResultStates";
import ScoreRing from "../components/dashboard/ScoreRing";
import MetricCard from "../components/dashboard/MetricCard";
import TranscriptCard from "../components/dashboard/TranscriptCard";
import PauseTimeline from "../components/dashboard/PauseTimeline";
import PaceChart from "../components/dashboard/PaceChart";
import FillerBreakdownChart from "../components/dashboard/FillerBreakdownChart";
import ScoreBars from "../components/dashboard/ScoreBars";
import StrengthsImprovements from "../components/dashboard/StrengthsImprovements";

export default function SpeechResult() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;

  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [list, setList] = useState([]);

  function load() {
    setStatus("loading");
    getSpeechSessions()
      .then(function (data) {
        setList(data || []);
        setStatus("ready");
      })
      .catch(function (err) {
        setErrorMsg(err && err.message ? err.message : "Something went wrong.");
        setStatus("error");
      });
  }

  useEffect(function () {
    load();
  }, []);

  function goBack() {
    navigate("/dashboard");
  }

  const session = list.find(function (s) { return s._id === id; });

  let body = null;

  if (status === "loading") {
    body = <ResultLoading />;
  } else if (status === "error") {
    body = <ResultError message={errorMsg} onRetry={load} />;
  } else if (!session) {
    body = <ResultNotFound text="Speech session not found" onBack={goBack} />;
  } else {
    const prev = findPrevious(list, session);
    const m = session.metrics || {};
    const pm = (prev && prev.metrics) || {};
    const fd = m.filler_data;
    const pd = m.pause_data || {};
    const ppd = pm.pause_data || {};

    // Filler card
    const fillerValue = isNum(m.filler_per_100_words) ? fmt1(m.filler_per_100_words) : "Not available";
    const fillerParts = [];
    if (isNum(m.filler_per_100_words)) fillerParts.push("per 100 words");
    if (fd && isNum(fd.total_fillers)) fillerParts.push(fd.total_fillers + " total");

    // Pause card
    const pauseValue = isNum(pd.pause_count) ? String(pd.pause_count) : "Not available";
    const pauseParts = [];
    if (isNum(pd.longest_pause)) pauseParts.push("Longest " + fmt1(pd.longest_pause) + "s");
    if (isNum(pd.pause_count) && pd.pause_count > 0 && isNum(pd.total_pause_time)) {
      pauseParts.push("Avg " + fmt1(pd.total_pause_time / pd.pause_count) + "s");
    }

    const fillerKeys = fd && fd.breakdown ? Object.keys(fd.breakdown) : [];

    body = (
      <div className="space-y-6">
        {/* Header */}
        <div className="glass flex flex-col gap-6 rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
              SPEECH RESULT
            </span>
            <h1 className="mt-3 font-display text-2xl font-semibold text-[#334155] md:text-3xl">
              {session.topic}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {fmtDate(session.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {fmtDuration(session.duration)}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              {session.summary || "No summary available for this session."}
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            icon={Gauge}
            label="Speaking Speed"
            value={isNum(m.wpm) ? fmt1(m.wpm) + " WPM" : "Not available"}
            note={"Ideal: " + IDEAL_WPM_MIN + "-" + IDEAL_WPM_MAX}
            change={compareMetric(m.wpm, pm.wpm, false)}
          />
          <MetricCard
            icon={Wind}
            label="Filler Words"
            value={fillerValue}
            note={fillerParts.join(" - ")}
            change={compareMetric(m.filler_per_100_words, pm.filler_per_100_words, true)}
          />
          <MetricCard
            icon={Pause}
            label="Pauses"
            value={pauseValue}
            note={pauseParts.join(" - ")}
            change={compareMetric(pd.pause_count, ppd.pause_count, false)}
          />
          <MetricCard
            icon={VolumeX}
            label="Silence Time"
            value={fmtPct(m.silence_ratio)}
            change={compareMetric(m.silence_ratio, pm.silence_ratio, true)}
          />
          <MetricCard
            icon={BookOpen}
            label="Vocabulary Variety"
            value={fmtPct(m.vocab_diversity)}
            change={compareMetric(m.vocab_diversity, pm.vocab_diversity, false)}
          />
        </div>

        <TranscriptCard transcript={session.transcript} fillerKeys={fillerKeys} />

        <PauseTimeline duration={session.duration} pauses={pd.pauses} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PaceChart timeline={m.pace_timeline} />
          <FillerBreakdownChart breakdown={fd ? fd.breakdown : undefined} />
        </div>

        <ScoreBars scores={session.scores} keys={SPEECH_SCORE_KEYS} color={COLORS.speech} />

        <StrengthsImprovements
          strengths={session.strengths}
          improvements={session.improvements}
        />
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