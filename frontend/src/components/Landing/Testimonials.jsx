import { Star } from "lucide-react";

const reviews = [
  { name: "Priya Sharma", role: "MBA Student", quote: "TalkIQ completely changed how I prepare for presentations. The real-time feedback is genuinely useful, not gimmicky." },
  { name: "Rahul Mehta", role: "Product Manager", quote: "The AI debate opponent pushed me harder than most people I've practiced with. My pace and clarity scores jumped fast." },
];

export default function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">Testimonials</span>
        <h2 className="font-display text-3xl font-bold mt-2">What Our Speakers Say</h2>
        <p className="text-text/60 mt-3">Thousands of speakers have transformed their skills with TalkIQ. Here's what a few of them say.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {reviews.map(({ name, role, quote }) => (
          <div key={name} className="glass rounded-2xl p-6">
            <div className="flex text-primary mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm text-text/70 mb-5">"{quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-display text-sm font-semibold text-primary">
                {name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs text-text/50">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}