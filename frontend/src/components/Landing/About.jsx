const facts = [
  { value: "2", label: "Practice modes: speaking and debate" },
  { value: "5", label: "Skill scores for every speech" },
  { value: "5", label: "Skill scores for every debate" },
  { value: "3", label: "Delivery checks: pace, pauses and filler words" },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-3xl font-bold">
            Built for anyone who wants to speak with confidence
          </h2>
          <p className="mb-4 text-text/70">
            Most people do not get enough real practice before the moments that matter, like
            interviews, presentations and debates. Practicing in front of a mirror gives you
            no feedback, and a friend may not have time to listen.
          </p>
          <p className="text-text/70">
            TalkIQ is an AI coach you can use whenever you want. It shows you what to improve
            in your speaking, and it argues back like a real opponent when you want a debate.
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="grid grid-cols-2 gap-6">
            {facts.map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-brand">{value}</p>
                <p className="mt-1 text-xs text-text/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
