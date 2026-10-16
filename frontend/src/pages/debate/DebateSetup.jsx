import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Users, ArrowRight, Loader2 } from "lucide-react";
import { startDebate } from "../../services/debateService";
import { useToast } from "../../hooks/useToast";

const TOPIC_SUGGESTIONS = [
  "Should remote work be the default?",
  "Is AI a net positive for education?",
  "Should college be free?",
];

// The backend only accepts "support" or "oppose" for the stance.
const STANCES = [
  { value: "support", label: "For" },
  { value: "oppose", label: "Against" },
];

// The backend accepts 2 to 15 minutes.
const DURATIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
];

export default function DebateSetup() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [topic, setTopic] = useState("");
  const [stance, setStance] = useState("support");
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [starting, setStarting] = useState(false);

  const handleStartDebate = async () => {
    if (!topic.trim() || starting) return;
    setStarting(true);
    try {
      const session = await startDebate({
        topic: topic.trim(),
        stance,
        durationMinutes,
      });
      navigate(`/debate/session/${session.session_id}`);
    } catch (err) {
      showToast(err.message, "error");
      setStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#334155]">
          Debate Setup
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#64748B]">
          Pick your topic and face off against an adaptive AI.
        </p>
      </div>

      <div className="glass w-full max-w-xl rounded-2xl border border-white/45 bg-white/70 p-8 shadow-[0_8px_30px_rgba(148,163,184,0.15)] backdrop-blur-xl">
        {/* Topic */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#334155] mb-2">
            Debate Topic
          </label>
          <div className="relative">
            <Pencil
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Should remote work be the default?"
              className="w-full rounded-xl border border-[#E2E8F0] bg-white/80 py-2.5 pl-9 pr-3 text-sm text-[#334155] placeholder:text-[#94A3B8] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPIC_SUGGESTIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setTopic(chip)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  topic === chip
                    ? "border-[#94A3B8] bg-[#E2E8F0] text-[#334155]"
                    : "border-[#E2E8F0] bg-white/60 text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Stance + Length */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">
              Your Stance
            </label>
            <div className="flex gap-2">
              {STANCES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStance(s.value)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    stance === s.value
                      ? "bg-[#334155] text-white shadow-sm"
                      : "bg-white/70 text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">
              Debate Length
            </label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-[#E2E8F0] bg-white/80 py-2.5 px-3 text-sm text-[#334155] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info box */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/80 px-4 py-3">
          <Users size={16} className="text-[#64748B]" />
          <div>
            <p className="text-sm font-medium text-[#334155]">AI Opponent Ready</p>
            <p className="text-xs text-[#94A3B8]">
              It will argue the opposite side and push back like a real debater.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartDebate}
          disabled={!topic.trim() || starting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#334155] py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {starting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Starting...
            </>
          ) : (
            <>
              Start Debate
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
