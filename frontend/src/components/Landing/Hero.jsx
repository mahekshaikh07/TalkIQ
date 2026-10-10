import { PlayCircle, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-block glass rounded-full px-4 py-1 text-xs font-semibold text-primary mb-5">
          AI-Powered Practice
        </span>

        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-text">
          Master Public <br />
          <span className="text-primary">Speaking</span> with AI
        </h1>

        <p className="mt-5 text-text/70 max-w-md">
          TalkIQ turns every rehearsal into a coaching session — real-time
          feedback on pace, tone, and confidence, so you walk into any room
          ready.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-text/80 hover:text-text transition-colors">
            <PlayCircle size={20} className="text-primary" />
            Watch Demo
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-text/60">
          <div className="flex text-primary">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span>Trusted by 12,000+ speakers</span>
        </div>
      </div>

      <div className="glass rounded-3xl aspect-[4/3] flex items-center justify-center shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
            <PlayCircle className="text-primary" size={28} />
          </div>
          <p className="text-sm text-text/50">Product Preview</p>
        </div>
      </div>
    </section>
  );
}