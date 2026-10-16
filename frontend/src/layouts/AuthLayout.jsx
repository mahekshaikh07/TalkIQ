import { Outlet, Link } from "react-router-dom";
import { AudioWaveform, Mic, Users, LineChart } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Mic, title: "Speaking practice", desc: "Record a speech and see your pace, pauses and filler words." },
  { icon: Users, title: "Debate practice", desc: "Debate an AI opponent and get your arguments scored." },
  { icon: LineChart, title: "Track your progress", desc: "Every session is saved, so you can see how you improve." },
];

export default function AuthLayout() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg px-4 py-10"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white p-10 md:flex">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-text text-white">
                <AudioWaveform size={18} />
              </span>
              <span className="font-display text-lg font-bold text-text">TalkIQ</span>
            </Link>

            <h1 className="font-display mt-10 text-4xl font-bold leading-tight text-text">
              Speak with more confidence.
            </h1>
            <p className="mt-4 max-w-xs text-sm text-text/60">
              Practice speeches and debates with an AI coach, then see exactly what to work on next.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass flex items-start gap-3 rounded-2xl p-4 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text">{title}</p>
                  <p className="mt-0.5 text-xs text-text/60">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
