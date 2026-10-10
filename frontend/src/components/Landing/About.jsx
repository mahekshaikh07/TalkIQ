export default function About() {
  return (
    <section id="about" className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            About TalkIQ
          </span>
          <h2 className="font-display text-3xl font-bold mt-2 mb-4">
            Built for anyone who wants to speak with confidence
          </h2>
          <p className="text-text/70 mb-4">
            TalkIQ started as a simple idea: most people don't get enough
            real practice before the moments that matter — interviews,
            presentations, pitches, debates. Traditional practice means
            talking to a mirror or hoping a friend has time to listen.
          </p>
          <p className="text-text/70">
            We built an AI coach that's always available, gives honest
            feedback on pace, clarity, and confidence, and pushes back
            like a real debate opponent when you need the challenge.
            No pressure, no judgment — just practice that actually helps.
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-display text-2xl font-bold text-primary">100%</p>
              <p className="text-xs text-text/60 mt-1">Free to practice</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary">24/7</p>
              <p className="text-xs text-text/60 mt-1">AI available anytime</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary">2</p>
              <p className="text-xs text-text/60 mt-1">Practice modes</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-text/60 mt-1">Judgment, ever</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}