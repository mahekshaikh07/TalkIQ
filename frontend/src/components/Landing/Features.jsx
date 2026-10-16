import { Mic, MessageSquare, LineChart } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Speech analysis",
    desc: "Record a speech on any topic. You get your pace, pauses, filler words and a transcript, with a score for each skill.",
  },
  {
    icon: MessageSquare,
    title: "AI debate opponent",
    desc: "Argue a topic against an AI that answers your points. Then see how your logic, rebuttals and persuasion scored.",
  },
  {
    icon: LineChart,
    title: "Progress dashboard",
    desc: "See your scores, pace and filler words over time, plus one focus area to work on each week.",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold">What TalkIQ does</h2>
        <p className="mt-3 text-text/60">
          Two ways to practice, and one place to see how you are improving.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass rounded-2xl p-6">
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
