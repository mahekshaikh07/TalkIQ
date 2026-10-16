import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mic, Square, Pause, Play, Loader2, AlertTriangle } from "lucide-react";
import { submitSpeech } from "../../services/speakingService";
import { useToast } from "../../hooks/useToast";

const MIN_RECORD_SECONDS = 3;
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

function extensionFor(mime) {
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4") || mime.includes("aac")) return "m4a";
  return "webm";
}

export default function SpeakingSession() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { showToast } = useToast();

  const topic = state?.topic || "Practice Session";
  const durationMin = state?.duration || 1;

  // starting | recording | paused | analyzing | error
  const [phase, setPhase] = useState("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(durationMin * 60);
  const [hasAudio, setHasAudio] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const mimeRef = useRef("");
  const secondsLeftRef = useRef(durationMin * 60);
  const finishedRef = useRef(false);
  const mountedRef = useRef(true);

  const releaseMic = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Ask for the microphone and start recording as soon as the page opens.
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function startRecording() {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        setErrorMsg("Recording is not supported in this browser. Use Chrome or Edge.");
        setPhase("error");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const mimeType = pickMimeType();
        const options = mimeType
          ? { mimeType, audioBitsPerSecond: 64000 }
          : { audioBitsPerSecond: 64000 };
        const recorder = new MediaRecorder(stream, options);
        mimeRef.current = recorder.mimeType || mimeType || "audio/webm";
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.start(1000);
        recorderRef.current = recorder;
        setPhase("recording");
      } catch (err) {
        if (cancelled) return;
        if (err.name === "NotAllowedError" || err.name === "SecurityError") {
          setErrorMsg("Microphone access is blocked. Allow the microphone in your browser, then try again.");
        } else if (err.name === "NotFoundError") {
          setErrorMsg("No microphone was found. Connect one and try again.");
        } else {
          setErrorMsg("Could not start the microphone.");
        }
        setPhase("error");
      }
    }

    startRecording();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        try {
          recorder.stop();
        } catch {
          /* already stopped */
        }
      }
      recorderRef.current = null;
      releaseMic();
    };
  }, [releaseMic]);

  // Countdown. Runs only while recording (not while paused).
  useEffect(() => {
    if (phase !== "recording") return undefined;
    const id = setInterval(() => {
      secondsLeftRef.current = Math.max(0, secondsLeftRef.current - 1);
      setSecondsLeft(secondsLeftRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const upload = useCallback(
    async (blob) => {
      setPhase("analyzing");
      try {
        const result = await submitSpeech({
          topic,
          audioBlob: blob,
          filename: `recording.${extensionFor(blob.type || mimeRef.current)}`,
        });
        if (mountedRef.current) {
          navigate(`/speech-result/${result.session_id}`, { replace: true });
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setErrorMsg(err.message);
        setPhase("error");
      }
    },
    [navigate, topic]
  );

  const finish = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || finishedRef.current) return;

    const spoken = durationMin * 60 - secondsLeftRef.current;
    if (spoken < MIN_RECORD_SECONDS) {
      showToast("Speak for at least a few seconds before ending.", "error");
      return;
    }

    finishedRef.current = true;
    setPhase("analyzing");

    recorder.onstop = () => {
      releaseMic();
      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      blobRef.current = blob;
      setHasAudio(blob.size > 0);
      if (blob.size === 0) {
        setErrorMsg("Nothing was recorded. Please try again.");
        setPhase("error");
        return;
      }
      upload(blob);
    };
    recorder.stop();
  }, [durationMin, releaseMic, showToast, upload]);

  // Time is up: stop and send the audio automatically.
  useEffect(() => {
    if (phase === "recording" && secondsLeft === 0) finish();
  }, [phase, secondsLeft, finish]);

  const togglePause = () => {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (phase === "recording") {
      recorder.pause();
      setPhase("paused");
    } else if (phase === "paused") {
      recorder.resume();
      setPhase("recording");
    }
  };

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const isPaused = phase === "paused";
  const live = phase === "recording" || phase === "paused";

  if (phase === "analyzing") {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <Loader2 size={36} className="animate-spin text-[#334155]" />
        <h1 className="mt-6 font-display text-2xl font-semibold text-[#334155]">
          Analyzing your speech
        </h1>
        <p className="mt-2 max-w-sm text-sm text-[#64748B]">
          We are turning your audio into text and scoring it. This can take up to a minute.
        </p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center px-6 py-24 text-center">
        <AlertTriangle size={32} className="text-[#EF4444]" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-[#334155]">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-md text-sm text-[#64748B]">{errorMsg}</p>
        <div className="mt-6 flex items-center gap-3">
          {hasAudio && (
            <button
              onClick={() => upload(blobRef.current)}
              className="rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
            >
              Try sending again
            </button>
          )}
          <button
            onClick={() => navigate("/speaking/setup")}
            className="rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9]"
          >
            Back to setup
          </button>
        </div>
      </div>
    );
  }

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
        className={`flex h-24 w-24 items-center justify-center rounded-full mb-4 transition ${
          isPaused || !live
            ? "bg-[#E2E8F0]"
            : "bg-[#334155] shadow-[0_0_0_8px_rgba(51,65,85,0.1)]"
        }`}
      >
        <Mic size={32} className={isPaused || !live ? "text-[#94A3B8]" : "text-white"} />
      </div>
      <p className="mb-8 text-sm text-[#64748B]">
        {phase === "starting" && "Starting the microphone..."}
        {phase === "recording" && "Recording. Speak clearly and at a steady pace."}
        {phase === "paused" && "Paused. Press Resume to keep going."}
      </p>

      {/* Tips */}
      <div className="glass w-full max-w-xl rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl mb-8">
        <p className="mb-2 text-sm font-medium text-[#334155]">While you speak</p>
        <ul className="space-y-1.5 text-sm text-[#64748B]">
          <li>Pause for a moment instead of saying um or like.</li>
          <li>Give one clear example for each main point.</li>
          <li>Press End Session when you are done. Your scores appear after.</li>
        </ul>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={togglePause}
          disabled={!live}
          className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/70 px-5 py-2.5 text-sm font-medium text-[#334155] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={finish}
          disabled={!live}
          className="flex items-center gap-2 rounded-xl bg-[#334155] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Square size={16} />
          End Session
        </button>
      </div>
    </div>
  );
}
