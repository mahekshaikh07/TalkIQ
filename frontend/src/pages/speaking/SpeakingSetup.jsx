import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pencil, Mic, Check, X, ArrowRight, Shuffle } from "lucide-react";

const TOPIC_SUGGESTIONS = ["Quarterly Review", "Elevator Pitch", "Impromptu Speech"];
const DURATIONS = [1, 3, 5];

const RANDOM_TOPICS = [
  "Introduce yourself in one minute",
  "Why I chose my field of study",
  "A skill everyone should learn",
  "Explain a technical idea to a beginner",
  "A problem on campus and how to fix it",
  "The best advice I ever received",
  "Should social media have age limits?",
  "How AI will change my field",
  "A project I am proud of",
  "Remote work or office work?",
];

export default function SpeakingSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  // "Practice this topic again" on a result page sends the topic here
  const [topic, setTopic] = useState(location.state?.topic || "");
  const [duration, setDuration] = useState(1);
  // Recording only works in browsers with MediaRecorder, on https or localhost.
  const micReady =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined";

  const handleChipClick = (chip) => setTopic(chip);

  const handleSurprise = () => {
    const others = RANDOM_TOPICS.filter((t) => t !== topic);
    setTopic(others[Math.floor(Math.random() * others.length)]);
  };

  const handleStartSession = () => {
    navigate("/speaking/session", {
      state: { topic: topic.trim(), duration },
    });
  };

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#334155]">
          Practice Setup
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#64748B]">
          Choose a topic and how long you want to speak.
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
            <button
              type="button"
              onClick={handleSurprise}
              className="flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white/60 px-3 py-1 text-xs font-medium text-[#64748B] transition hover:bg-[#F1F5F9]"
            >
              <Shuffle size={12} />
              Surprise me
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#334155]">
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
                    : "border border-[#E2E8F0] bg-white/70 text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                {min} min
              </button>
            ))}
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