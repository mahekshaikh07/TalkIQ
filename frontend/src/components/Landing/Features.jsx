import { Clock, MessageSquare, LineChart } from "lucide-react";

const features = [
  { icon: Clock, title: "Real-Time Speech Analysis", desc: "Instant feedback on pace, pauses, filler words, and clarity as you speak." },
  { icon: MessageSquare, title: "AI Debate Opponent", desc: "Practice arguments against an adaptive AI that pushes back like a real opponent." },
  { icon: LineChart, title: "Progress Dashboard", desc: "Track confidence, fluency, and vocabulary growth across every session." },
];

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Why TalkIQ</span>
        <h2 className="font-display text-3xl font-bold mt-2">Everything You Need to Excel</h2>
        <p className="text-text/60 mt-3">
          From live feedback to detailed analytics, TalkIQ gives you a complete, confident speaking practice.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
              <Icon className="text-primary" size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
            <p className="text-sm text-text/60 mb-3">{desc}</p>
            <a href="#" className="text-sm font-semibold text-primary hover:underline">
              Learn more →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}