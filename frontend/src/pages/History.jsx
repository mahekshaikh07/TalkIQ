import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Users, ChevronRight, Search } from "lucide-react";

const MOCK_SESSIONS = [
  { id: 1, type: "Speaking", topic: "Pitching a new product feature", score: 84, date: "Aug 10, 2026" },
  { id: 2, type: "Debate", topic: "Should remote work be the default?", score: 76, date: "Aug 9, 2026" },
  { id: 3, type: "Speaking", topic: "Quarterly Review", score: 71, date: "Aug 8, 2026" },
  { id: 4, type: "Debate", topic: "Is AI a net positive for education?", score: 88, date: "Aug 6, 2026" },
  { id: 5, type: "Speaking", topic: "Elevator Pitch", score: 79, date: "Aug 4, 2026" },
];

const FILTERS = ["All", "Speaking", "Debate"];

export default function History() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const filteredSessions = MOCK_SESSIONS.filter((s) => {
    const matchesFilter = filter === "All" || s.type === filter;
    const matchesQuery = s.topic.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const handleOpenReport = (session) => {
    const path = session.type === "Speaking" ? "/speaking/report" : "/debate/report";
    navigate(path, { state: { topic: session.topic } });
  };

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

      <div className="space-y-3">
        {filteredSessions.length === 0 && (
          <p className="text-center text-sm text-[#94A3B8] py-10">
            No sessions match your search.
          </p>
        )}

        {filteredSessions.map((session) => (
          <button
            key={session.id}
            onClick={() => handleOpenReport(session)}
            className="glass flex w-full items-center justify-between rounded-2xl border border-white/45 bg-white/70 p-4 text-left shadow-sm backdrop-blur-xl transition hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2E8F0] text-[#334155]">
                {session.type === "Speaking" ? <Mic size={16} /> : <Users size={16} />}
              </span>
              <div>
                <p className="text-sm font-medium text-[#334155]">{session.topic}</p>
                <p className="text-xs text-[#94A3B8]">
                  {session.type} · {session.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-semibold text-[#334155]">
                {session.score}%
              </span>
              <ChevronRight size={16} className="text-[#94A3B8]" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}