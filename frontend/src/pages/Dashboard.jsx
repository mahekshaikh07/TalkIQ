import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Users, ArrowRight, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getSpeechSessions, getDebateSessions } from "../api/sessionsApi";
import {
  tagSessions,
  onlyCompleted,
  averageOverall,
  bestSession,
  calculateStreak,
} from "../utils/dashboardHelpers";
import StatCards from "../components/dashboard/StatCards";
import ScoreOverTimeChart from "../components/dashboard/ScoreOverTimeChart";
import SkillProfileRadar from "../components/dashboard/SkillProfileRadar";
import FillerTrendChart from "../components/dashboard/FillerTrendChart";
import WpmTrendChart from "../components/dashboard/WpmTrendChart";
import PracticeCalendar from "../components/dashboard/PracticeCalendar";
import RelevanceTrendChart from "../components/dashboard/RelevanceTrendChart";
import FocusThisWeek from "../components/dashboard/FocusThisWeek";
import RecentSessionsTable from "../components/dashboard/RecentSessionsTable";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [speech, setSpeech] = useState([]);
  const [debates, setDebates] = useState([]);

  function load() {
    setStatus("loading");
    Promise.all([getSpeechSessions(), getDebateSessions()])
      .then(function (results) {
        setSpeech(results[0] || []);
        setDebates(onlyCompleted(results[1] || []));
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

  const name = user && user.name ? user.name.trim().split(/\s+/)[0] : "there";
  const all = tagSessions(speech, debates);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-[#334155] md:text-3xl">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Here is how your practice is going.
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={function () { navigate("/speaking/setup"); }}
          className="glass flex items-center justify-between rounded-2xl border border-white/45 bg-white/70 p-5 text-left shadow-sm backdrop-blur-xl transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2E8F0] text-[#334155]">
              <Mic size={18} />
            </span>
            <div>
              <p className="font-medium text-[#334155]">Start Speaking Practice</p>
              <p className="text-xs text-[#94A3B8]">Solo rehearsal with AI feedback</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#94A3B8]" />
        </button>

        <button
          onClick={function () { navigate("/debate/setup"); }}
          className="glass flex items-center justify-between rounded-2xl border border-white/45 bg-white/70 p-5 text-left shadow-sm backdrop-blur-xl transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2E8F0] text-[#334155]">
              <Users size={18} />
            </span>
            <div>
              <p className="font-medium text-[#334155]">Start Debate Practice</p>
              <p className="text-xs text-[#94A3B8]">Argue against an adaptive AI</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[#94A3B8]" />
        </button>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="glass flex items-center justify-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-12 text-sm text-[#64748B] shadow-sm">
          <Loader2 size={18} className="animate-spin" />
          Loading your progress...
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-12 text-center shadow-sm">
          <AlertTriangle size={24} className="text-[#EF4444]" />
          <p className="font-medium text-[#334155]">Could not load your sessions</p>
          <p className="text-sm text-[#94A3B8]">{errorMsg}</p>
          <button
            onClick={load}
            className="mt-2 rounded-xl bg-[#334155] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty (new user) */}
      {status === "ready" && all.length === 0 && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-12 text-center shadow-sm">
          <Sparkles size={28} className="text-[#94A3B8]" />
          <p className="font-display text-lg font-semibold text-[#334155]">
            Do your first practice session
          </p>
          <p className="max-w-sm text-sm text-[#94A3B8]">
            Your scores, trends and streak will show up here after your first speech or debate.
          </p>
          <button
            onClick={function () { navigate("/speaking/setup"); }}
            className="mt-2 rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
          >
            Start practicing
          </button>
        </div>
      )}

      {/* Ready with data */}
      {status === "ready" && all.length > 0 && (
        <div className="space-y-6">
          <StatCards
            speechCount={speech.length}
            debateCount={debates.length}
            average={averageOverall(all)}
            best={bestSession(all)}
            streak={calculateStreak(all)}
          />

          <FocusThisWeek speech={speech} debates={debates} />

          {all.length >= 2 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ScoreOverTimeChart speech={speech} debates={debates} />
              <SkillProfileRadar speech={speech} debates={debates} />
              <FillerTrendChart speech={speech} />
              <WpmTrendChart speech={speech} />
              <PracticeCalendar sessions={all} />
              <RelevanceTrendChart debates={debates} />
            </div>
          ) : (
            <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-10 text-center shadow-sm">
              <p className="font-display text-base font-semibold text-[#334155]">
                Your trend charts appear after your second session
              </p>
              <p className="max-w-sm text-sm text-[#94A3B8]">
                One more session and you can see how your scores, pace and filler words change.
              </p>
              <button
                onClick={function () { navigate("/speaking/setup"); }}
                className="mt-1 rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
              >
                Practice again
              </button>
            </div>
          )}

          <RecentSessionsTable sessions={all} />
        </div>
      )}
    </div>
  );
}