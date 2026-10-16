import { UserPlus, Mic, TrendingUp } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create an account", desc: "Sign up with your name and email. There is nothing else to set up." },
  { icon: Mic, title: "Practice with AI", desc: "Pick a topic, then record a speech or start a debate against the AI." },
  { icon: TrendingUp, title: "Review and improve", desc: "Read your report, check your weakest area, and practice again." },
];

export default function ProcessSteps() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold">How it works</h2>
        <p className="mt-3 text-text/60">You can finish your first session in a few minutes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="glass relative rounded-2xl p-6">
            <span className="absolute right-6 top-5 font-display text-2xl font-bold text-text/15">
              {i + 1}
            </span>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
              <Icon className="text-brand" size={20} />
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold">{title}</h3>
            <p className="text-sm text-text/60">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
