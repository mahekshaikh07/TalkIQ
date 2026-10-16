// src/pages/debate/DebateSession.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { fetchDebateSession, sendDebateTurn, endDebate } from "../../services/debateService";
import { parseDate } from "../../utils/dashboardHelpers";
import { useToast } from "../../hooks/useToast";

function toClock(iso) {
  const d = parseDate(iso);
  return d ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
}

// Backend turn { role: "user" | "assistant", content, timestamp } -> chat message
function toMessage(turn, index) {
  return {
    id: "t" + index,
    sender: turn.role === "user" ? "user" : "ai",
    text: turn.content,
    time: turn.role === "user" ? "You" : toClock(turn.timestamp),
  };
}

export default function DebateSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { showToast } = useToast();

  const [loadState, setLoadState] = useState("loading"); // loading | error | ready
  const [loadError, setLoadError] = useState("");
  const [debate, setDebate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [ending, setEnding] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const scrollRef = useRef(null);
  const endingRef = useRef(false);
  const autoEndTriedRef = useRef(false);
  const messagesRef = useRef([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load the session from the backend (works after a page refresh too).
  useEffect(() => {
    let cancelled = false;
    fetchDebateSession(sessionId)
      .then((session) => {
        if (cancelled) return;
        if (!session) {
          setLoadError("This debate was not found.");
          setLoadState("error");
          return;
        }
        if (session.status === "completed") {
          navigate(`/debate-result/${sessionId}`, { replace: true });
          return;
        }
        const started = parseDate(session.start_time);
        const total = (session.duration_minutes || 5) * 60;
        const used = started ? (Date.now() - started.getTime()) / 1000 : 0;
        setDebate(session);
        setMessages((session.conversation || []).map(toMessage));
        setSecondsLeft(Math.max(0, Math.round(total - used)));
        setLoadState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message);
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, navigate]);

  // Countdown
  useEffect(() => {
    if (loadState !== "ready" || ending) return undefined;
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [loadState, ending]);

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

  const handleEnd = useCallback(
    async (auto) => {
      if (endingRef.current) return;
      const hasUserMessage = messagesRef.current.some((m) => m.sender === "user");
      if (!hasUserMessage) {
        if (auto) {
          showToast("Time ran out before you sent an argument.", "error");
          navigate("/debate/setup");
        } else {
          showToast("Send at least one argument before ending the debate.", "error");
        }
        return;
      }
      endingRef.current = true;
      setEnding(true);
      try {
        await endDebate(sessionId);
        navigate(`/debate-result/${sessionId}`, { replace: true });
      } catch (err) {
        endingRef.current = false;
        setEnding(false);
        showToast(err.message, "error");
      }
    },
    [sessionId, navigate, showToast]
  );

  // Time is up: evaluate automatically (once). If it fails, the End button still works.
  useEffect(() => {
    if (loadState !== "ready" || secondsLeft > 0 || aiTyping || ending) return;
    if (autoEndTriedRef.current) return;
    autoEndTriedRef.current = true;
    handleEnd(true);
  }, [loadState, secondsLeft, aiTyping, ending, handleEnd]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || aiTyping || ending || secondsLeft === 0) return;

    const tempId = "u" + Date.now();
    setMessages((prev) => [...prev, { id: tempId, sender: "user", text, time: "You" }]);
    setInput("");
    setAiTyping(true);

    try {
      const res = await sendDebateTurn(sessionId, text);
      setMessages((prev) => [
        ...prev,
        {
          id: "a" + Date.now(),
          sender: "ai",
          text: res.ai_reply,
          time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        },
      ]);
      // The server keeps the real clock, so use its number.
      if (typeof res.seconds_remaining === "number") setSecondsLeft(res.seconds_remaining);
    } catch (err) {
      // The backend did not save this turn, so take it back and let the user retry.
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
      if (/time is up/i.test(err.message)) {
        setSecondsLeft(0);
        showToast("Time is up. Evaluating your debate...", "info");
      } else {
        showToast(err.message, "error");
      }
    } finally {
      setAiTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 px-6 py-24 text-sm text-[#64748B]">
        <Loader2 size={18} className="animate-spin" />
        Loading your debate...
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <AlertTriangle size={28} className="text-[#EF4444]" />
        <p className="mt-3 font-medium text-[#334155]">Could not open this debate</p>
        <p className="mt-1 text-sm text-[#94A3B8]">{loadError}</p>
        <button
          onClick={() => navigate("/debate/setup")}
          className="mt-4 rounded-xl bg-[#334155] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
        >
          Back to setup
        </button>
      </div>
    );
  }

  const stanceLabel = debate.stance === "support" ? "You support" : "You oppose";
  const timeIsUp = secondsLeft === 0;

  return (
    <div className="relative flex flex-col h-[calc(100vh-2rem)] rounded-2xl overflow-hidden bg-[#F8FAFC]">
      {ending && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/85 text-center backdrop-blur-sm">
          <Loader2 size={32} className="animate-spin text-[#334155]" />
          <p className="mt-4 font-display text-lg font-semibold text-[#334155]">
            Evaluating your debate
          </p>
          <p className="mt-1 text-sm text-[#64748B]">This can take up to a minute.</p>
        </div>
      )}

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
            onClick={() => navigate("/debate/setup")}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Back to setup"
          >
            <ArrowLeft size={20} className="text-[#334155]" />
          </button>
          <div>
            <h1
              className="text-lg font-semibold text-[#334155]"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              Debate: {debate.topic}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                {stanceLabel}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={12} />
                {timeIsUp ? "Time is up" : `${formatTime(secondsLeft)} min remaining`}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleEnd(false)}
          disabled={ending || aiTyping}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[#334155] text-white hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          End &amp; Evaluate
        </button>
      </div>

      {/* Body: chat */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.length === 0 && (
              <div className="mx-auto mt-10 max-w-md text-center text-sm text-[#94A3B8]">
                Make your opening argument below. The AI will answer with a rebuttal.
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.sender === "ai" ? (
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500">AI Opponent</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-md border border-white/45 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">{msg.time}</span>
                  </div>
                ) : (
                  <div className="max-w-xl ml-auto">
                    <span className="text-xs font-medium text-slate-500 block text-right mb-1">
                      {msg.time}
                    </span>
                    <div className="bg-[#CBD5E1]/70 backdrop-blur-md border border-white/45 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                      <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
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
              {timeIsUp ? "Debate over" : aiTyping ? "AI's Turn" : "Your Turn"}
            </span>
          </div>

          {/* Input bar */}
          <div className="px-6 pb-6 pt-2">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-white/45 rounded-xl px-4 py-2 shadow-sm">
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={aiTyping || ending || timeIsUp}
                placeholder="Type your argument... (Enter to send, Shift+Enter for a new line)"
                className="flex-1 resize-none bg-transparent outline-none text-sm text-[#334155] placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={aiTyping || ending || timeIsUp || !input.trim()}
                className="p-2.5 rounded-lg bg-[#334155] text-white hover:bg-[#1e293b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send argument"
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
