import { Layers, Star, Trophy, Flame } from "lucide-react";
import { fmt1 } from "../../utils/dashboardHelpers";

function StatCard({ icon: Icon, label, value, note }) {
  return (
    <div className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-[#94A3B8]">
        <Icon size={15} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="font-display text-3xl font-semibold text-[#334155]">{value}</p>
      <p className="mt-1 text-xs text-[#94A3B8]">{note}</p>
    </div>
  );
}

export default function StatCards({ speechCount, debateCount, average, best, streak }) {
  const total = speechCount + debateCount;

  let bestValue = "-";
  let bestNote = "No scored sessions yet";
  if (best && best.scores) {
    bestValue = fmt1(best.scores.overall) + "/10";
    bestNote = best._type === "debate" ? "Debate" : "Speech";
  }

  const streakNote = streak > 0 ? "Keep it going!" : "Practice today to start one";

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Layers}
        label="Total Sessions"
        value={total}
        note={speechCount + " speeches - " + debateCount + " debates"}
      />
      <StatCard
        icon={Star}
        label="Average Score"
        value={average === null ? "-" : fmt1(average) + "/10"}
        note="Across all sessions"
      />
      <StatCard icon={Trophy} label="Best Score" value={bestValue} note={bestNote} />
      <StatCard
        icon={Flame}
        label="Practice Streak"
        value={streak + (streak === 1 ? " day" : " days")}
        note={streakNote}
      />
    </div>
  );
}