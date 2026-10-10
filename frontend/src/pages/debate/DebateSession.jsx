// src/pages/debate/DebateSession.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Send,
  Mic,
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";

// ---- Mock data (replace with real session data later) ----
const MOCK_DEBATE = {
  topic: "Universal Basic Income",
  stance: "Opposition", // "Opposition" | "Proposition"
  totalMinutes: 15,
};

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "ai",
    text: "Universal Basic Income (UBI) provides a necessary safety net in an era of increasing automation. By guaranteeing a baseline standard of living, we not only eradicate extreme poverty but also empower individuals to pursue education or entrepreneurial ventures without the crippling fear of destitution. How can the opposition justify leaving vulnerable populations exposed to structural unemployment?",
    time: "1:23",
  },
  {
    id: 2,
    sender: "user",
    text: "While the intention to eradicate poverty is noble, UBI is an economically reckless approach. Implementing a true UBI would require massive tax hikes, which stifles the very economic growth needed to sustain it. Furthermore, it risks disincentivizing labor participation, particularly in entry-level sectors, leading to a shrinking tax base and ultimately, a system that collapses under its own weight. Targeted welfare is far more efficient.",
    time: "You",
    feedback: "Good clarity",
  },
];

export default function DebateSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(MOCK_DEBATE.totalMinutes * 60);
  const [turnSeconds, setTurnSeconds] = useState(105); // 1:45
  const scrollRef = useRef(null);

  // Session countdown
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Turn countdown
  useEffect(() => {
    if (aiTyping) return;
    const t = setInterval(() => {
      setTurnSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [aiTyping]);

  // Simulate AI "formulating a rebuttal" -> AI reply
  useEffect(() => {
    if (!aiTyping) return;
    const t = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "ai",
          text: "Targeted welfare requires bureaucratic means-testing that often excludes the very people it aims to help. Wouldn't a universal, unconditional approach eliminate that gap entirely, even if it costs more upfront?",
          time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
      setAiTyping(false);
      setTurnSeconds(105);
    }, 2500);
    return () => clearTimeout(t);
  }, [aiTyping]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, aiTyping]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: "user",
        text: input.trim(),
        time: "You",
      },
    ]);
    setInput("");
    setAiTyping(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const dismissFeedback = (id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: null } : m))
    );
  };

  const handleEndSession = () => {
    navigate("/debate/report", {
      state: { topic: MOCK_DEBATE.topic, stance: MOCK_DEBATE.stance },
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] rounded-2xl overflow-hidden bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-white/45 bg-white/60 backdrop-blur-md">
        <MessageSquare size={18} className="text-[#334155]" />
        <span className="font-semibold text-[#334155]" style={{ fontFamily: "Sora, sans-serif" }}>
          Debate Practice Live Session
        </span>
      </div>

      {/* Session header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/45">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#334155]" />
          </button>
          <div>
            <h1
              className="text-lg font-semibold text-[#334155]"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              Debate: {MOCK_DEBATE.topic}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                {MOCK_DEBATE.stance}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={12} />
                {formatTime(secondsLeft)} min remaining
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleEndSession}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[#334155] text-white hover:bg-[#1e293b] transition-colors"
        >
          End Session
        </button>
      </div>

      {/* Body: chat (full width now) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.sender === "ai" ? (
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">AI Opponent</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md border border-white/45 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <p className="text-sm text-[#334155] leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{msg.time}</span>
                  </div>
                ) : (
                  <div className="max-w-xl ml-auto">
                    <span className="text-xs font-medium text-slate-500 block text-right mb-1">
                      {msg.time}
                    </span>
                    <div className="bg-[#CBD5E1]/70 backdrop-blur-md border border-white/45 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                      <p className="text-sm text-[#334155] leading-relaxed">{msg.text}</p>
                    </div>
                    {msg.feedback && (
                      <div className="flex justify-end mt-1">
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          {msg.feedback}
                          <button
                            onClick={() => dismissFeedback(msg.id)}
                            className="hover:text-emerald-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {aiTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Sparkles size={14} className="animate-pulse" />
                <span>AI is formulating a rebuttal...</span>
              </div>
            )}
          </div>

          {/* Turn indicator */}
          <div className="px-6">
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-slate-200/70 text-[#334155] mb-2">
              {aiTyping ? "AI's Turn" : `Your Turn: ${formatTime(turnSeconds)}`}
            </span>
          </div>

          {/* Input bar */}
          <div className="px-6 pb-6 pt-2">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/45 rounded-xl px-4 py-2 shadow-sm">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={aiTyping}
                placeholder="Speak or type your argument..."
                className="flex-1 bg-transparent outline-none text-sm text-[#334155] placeholder:text-slate-400 disabled:opacity-50"
              />
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Mic size={18} className="text-slate-400" />
              </button>
              <button
                onClick={handleSend}
                disabled={aiTyping || !input.trim()}
                className="p-2.5 rounded-lg bg-[#334155] text-white hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}