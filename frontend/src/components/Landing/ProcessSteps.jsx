import { UserPlus, Mic, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Your Profile", desc: "Tell us your goals so TalkIQ can tailor practice sessions to you." },
  { icon: Mic, title: "Practice with AI", desc: "Run speaking or debate sessions and get feedback as you go." },
  { icon: TrendingUp, title: "Track & Improve", desc: "Watch your scores climb across every metric, session after session." },
];

export default function ProcessSteps() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Get Started</span>
        <h2 className="font-display text-3xl font-bold mt-2">Start Speaking Better in 3 Steps</h2>
        <p className="text-text/60 mt-3">Getting started with TalkIQ takes minutes — practicing with it pays off for a lifetime.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="glass rounded-2xl p-6 relative">
            <span className="absolute top-5 right-6 font-display text-2xl font-bold text-primary/25">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
              <Icon className="text-primary" size={20} />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
            <p className="text-sm text-text/60">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}