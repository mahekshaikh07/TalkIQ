import { Link } from "react-router-dom";
import { ArrowRight, Gauge, VolumeX, Pause, BookOpen, Lightbulb } from "lucide-react";

const REPORT_ITEMS = [
  { icon: Gauge, title: "Pace", desc: "Your speed in words per minute" },
  { icon: VolumeX, title: "Filler words", desc: "Which ones you use and how often" },
  { icon: Pause, title: "Pauses", desc: "How many, and how long they were" },
  { icon: BookOpen, title: "Transcript", desc: "Read back exactly what you said" },
  { icon: Lightbulb, title: "Strengths and tips", desc: "What worked and what to fix next" },
];

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-16 md:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl font-bold leading-tight text-text md:text-5xl">
          Practice speaking and debating with an AI coach
        </h1>

        <p className="mt-5 max-w-md text-text/70">
          Record a speech or debate an AI opponent. After each session you get a clear report
          on your pace, pauses, filler words and arguments, so you know what to work on next.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-xl bg-text px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E293B]"
          >
            Start practicing
            <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-text/80 transition-colors hover:text-text"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-lg sm:p-8">
        <p className="font-display text-lg font-semibold text-text">Your report after every session</p>
        <p className="mt-1 text-sm text-text/60">A score out of 10 for each skill, plus:</p>

        <ul className="mt-5 space-y-4">
          {REPORT_ITEMS.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon size={17} />
              </span>
              <div>
                <p className="text-sm font-semibold text-text">{title}</p>
                <p className="text-xs text-text/60">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
