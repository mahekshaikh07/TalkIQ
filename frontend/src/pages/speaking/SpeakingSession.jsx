import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, Square, Pause, Play } from "lucide-react";

// Live metrics update on a mock interval — replace with real
// speech-analysis stream once backend WebSocket endpoint is ready
const METRIC_KEYS = ["confidence", "fluency", "pace", "eyeContact"];

export default function SpeakingSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const topic = state?.topic || "Practice Session";
  const durationMin = state?.duration || 1;

  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    confidence: 70,
    fluency: 65,
    pace: 75,
    eyeContact: 68,
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });

        // Mock live metric fluctuation
        setLiveMetrics((prev) =>
          Object.fromEntries(
            METRIC_KEYS.map((key) => [
              key,
              Math.min(100, Math.max(40, prev[key] + (Math.random() * 6 - 3))),
            ])
          )
        );
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const handleEndSession = () => {
    navigate("/speaking/report", {
      state: { topic, metrics: liveMetrics, duration: durationMin },
    });
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center px-6 py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8] mb-2">
        {topic}
      </p>
      <h1 className="font-display text-5xl font-semibold text-[#334155] mb-8">
        {minutes}:{seconds}
      </h1>

      {/* Mic indicator */}
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full mb-10 transition ${
          isPaused
            ? "bg-[#E2E8F0]"
            : "bg-[#334155] shadow-[0_0_0_8px_rgba(51,65,85,0.1)]"
        }`}
      >
        <Mic size={32} className={isPaused ? "text-[#94A3B8]" : "text-white"} />
      </div>

      {/* Live metrics */}
      <div className="glass w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl mb-8">
        {METRIC_KEYS.map((key) => (
          <div key={key} className="text-center">
            <p className="text-xs text-[#94A3B8] capitalize mb-1">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <p className="font-display text-lg font-semibold text-[#334155]">
              {Math.round(liveMetrics[key])}%
            </p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={handleEndSession}
          className="flex items-center gap-2 rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
        >
          <Square size={16} />
          End Session
        </button>
      </div>
    </div>
  );
}
