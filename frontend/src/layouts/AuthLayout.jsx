import { Outlet, Link } from "react-router-dom";
import { AudioWaveform, Mic } from "lucide-react";

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
              Elevate Your <br />
              <span className="text-text/40">Voice.</span>
            </h1>
            <p className="mt-4 max-w-xs text-sm text-text/60">
              Join thousands of professionals and debaters practicing in a
              high-clarity, focused environment.
            </p>
          </div>

          {/* Floating stat cards */}
          <div className="relative my-10 h-40">
            <div className="glass absolute left-4 top-0 w-56 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary">
                  <Mic size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">Live Session</p>
                  <p className="truncate text-xs text-text/50">Analyzing your pace...</p>
                </div>
              </div>
            </div>

            <div className="glass absolute left-4 top-20 w-56 rounded-2xl p-4 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-text/50">Clarity Score</span>
                <span className="text-xs font-semibold text-text">94% Clarity</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-4/5 rounded-full bg-text" />
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="glass rounded-2xl p-4 shadow-lg">
            <p className="text-sm italic text-text/70">
              "TalkIQ completely transformed how I prepare for high-stakes
              presentations. The serene environment keeps my anxiety low
              while providing actionable feedback."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-primary/30" />
              <div>
                <p className="text-sm font-semibold text-text">Sarah J.</p>
                <p className="text-xs text-text/50">Debate Champion</p>
              </div>
            </div>
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