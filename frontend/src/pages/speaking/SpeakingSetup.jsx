import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Mic, Check, X, ArrowRight } from "lucide-react";

const TOPIC_SUGGESTIONS = ["Quarterly Review", "Elevator Pitch", "Impromptu Speech"];
const DURATIONS = [1, 3, 5];
const FEEDBACK_LEVELS = [
  { value: "gentle", label: "Gentle (Encouraging)" },
  { value: "balanced", label: "Intermediate (Balanced)" },
  { value: "strict", label: "Advanced (Strict)" },
];

export default function SpeakingSetup() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(1);
  const [feedbackLevel, setFeedbackLevel] = useState("balanced");
  // Recording only works in browsers with MediaRecorder, on https or localhost.
  const micReady =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined";

  const handleChipClick = (chip) => setTopic(chip);

  const handleStartSession = () => {
    navigate("/speaking/session", {
      state: { topic: topic.trim(), duration, feedbackLevel },
    });
  };

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#334155]">
          Practice Setup
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#64748B]">
          Configure your environment for focused delivery.
        </p>
      </div>

      <div className="glass w-full max-w-xl rounded-2xl border border-white/45 bg-white/70 p-8 shadow-[0_8px_30px_rgba(148,163,184,0.15)] backdrop-blur-xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#334155] mb-2">
            Practice Topic
          </label>
          <div className="relative">
            <Pencil size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Pitching a new product feature..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-white/80 py-2.5 pl-9 pr-3 text-sm text-[#334155] placeholder:text-[#94A3B8] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {TOPIC_SUGGESTIONS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
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

        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">
              Target Duration
            </label>
            <div className="flex gap-2">
              {DURATIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDuration(min)}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                    duration === min
                      ? "bg-[#334155] text-white shadow-sm"
                      : "bg-white/70 text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#334155] mb-2">
              AI Feedback Level
            </label>
            <select
              value={feedbackLevel}
              onChange={(e) => setFeedbackLevel(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] bg-white/80 py-2.5 px-3 text-sm text-[#334155] outline-none transition focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]"
            >
              {FEEDBACK_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <Mic size={16} className="text-[#64748B]" />
            <div>
              <p className="text-sm font-medium text-[#334155]">System Check</p>
              <p className="text-xs text-[#94A3B8]">
                {micReady
                  ? "Microphone supported. Your browser will ask for permission."
                  : "Recording is not supported here. Use Chrome or Edge on localhost or https."}
              </p>
            </div>
          </div>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full ${micReady ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
            {micReady ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
          </span>
        </div>

        <button
          type="button"
          onClick={handleStartSession}
          disabled={!micReady || !topic.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#334155] py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Session
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}