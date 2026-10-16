import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Users, ChevronRight, Search, Loader2, AlertTriangle } from "lucide-react";
import { getSpeechSessions, getDebateSessions } from "../api/sessionsApi";
import { tagSessions, resultPath, fmtDate, fmt1 } from "../utils/dashboardHelpers";

const FILTERS = ["All", "Speaking", "Debate"];

export default function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [sessions, setSessions] = useState([]);

  function fetchAll() {
    Promise.all([getSpeechSessions(), getDebateSessions()])
      .then(function (results) {
        // tagSessions keeps only finished debates and sorts oldest -> newest
        setSessions(tagSessions(results[0] || [], results[1] || []).reverse());
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

  const filteredSessions = sessions.filter((s) => {
    const type = s._type === "debate" ? "Debate" : "Speaking";
    const matchesFilter = filter === "All" || type === filter;
    const matchesQuery = (s.topic || "").toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#334155]">
          Session History
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Review your past speaking and debate sessions.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-white/80 py-2.5 pl-9 pr-3 text-sm text-[#334155] placeholder:text-[#94A3B8] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                filter === f
                  ? "bg-[#334155] text-white"
                  : "bg-white/70 text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center gap-3 py-16 text-sm text-[#64748B]">
          <Loader2 size={18} className="animate-spin" />
          Loading your sessions...
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle size={24} className="text-[#EF4444]" />
          <p className="text-sm text-[#64748B]">{errorMsg}</p>
          <button
            onClick={load}
            className="rounded-xl bg-[#334155] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <div className="space-y-3">
          {filteredSessions.length === 0 && (
            <p className="text-center text-sm text-[#94A3B8] py-10">
              {sessions.length === 0
                ? "No sessions yet. Start a speaking or debate practice to see it here."
                : "No sessions match your search."}
            </p>
          )}

          {filteredSessions.map((session) => {
            const isDebate = session._type === "debate";
            return (
              <button
                key={session._type + session._id}
                onClick={() => navigate(resultPath(session))}
                className="glass flex w-full items-center justify-between rounded-2xl border border-white/45 bg-white/70 p-4 text-left shadow-sm backdrop-blur-xl transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2E8F0] text-[#334155]">
                    {isDebate ? <Users size={16} /> : <Mic size={16} />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#334155]">{session.topic}</p>
                    <p className="text-xs text-[#94A3B8]">
                      {isDebate ? "Debate" : "Speaking"} · {fmtDate(session.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-sm font-semibold text-[#334155]">
                    {fmt1(session.scores ? session.scores.overall : null, "-")}/10
                  </span>
                  <ChevronRight size={16} className="text-[#94A3B8]" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
