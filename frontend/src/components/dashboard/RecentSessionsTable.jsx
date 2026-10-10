import { useNavigate } from "react-router-dom";
import { recentSessions, fmtDate, fmt1, resultPath } from "../../utils/dashboardHelpers";

function TypeBadge({ type }) {
  const isSpeech = type === "speech";
  return (
    <span
      className={
        "rounded-full px-2.5 py-0.5 text-xs font-medium " +
        (isSpeech ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700")
      }
    >
      {isSpeech ? "Speech" : "Debate"}
    </span>
  );
}

export default function RecentSessionsTable({ sessions }) {
  const navigate = useNavigate();
  const rows = recentSessions(sessions, 8);

  return (
    <div className="glass rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
      <h2 className="mb-4 font-display text-base font-semibold text-[#334155]">Recent Sessions</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">No sessions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-xs text-[#94A3B8]">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Topic</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 text-right font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(function (s) {
                return (
                  <tr key={s._type + s._id} className="border-b border-[#F1F5F9] last:border-0">
                    <td className="whitespace-nowrap py-3 pr-4 text-[#64748B]">{fmtDate(s.created_at)}</td>
                    <td className="py-3 pr-4">
                      <TypeBadge type={s._type} />
                    </td>
                    <td className="max-w-[260px] truncate py-3 pr-4 text-[#334155]">{s.topic}</td>
                    <td className="whitespace-nowrap py-3 pr-4 font-semibold text-[#334155]">
                      {fmt1(s.scores && s.scores.overall)}/10
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={function () { navigate(resultPath(s)); }}
                        className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}