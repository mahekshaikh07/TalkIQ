const stats = [
  { value: "12K+", label: "Active Speakers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "3.2M", label: "Sessions Completed" },
  { value: "47+", label: "Countries Reached" },
];

export default function TrustBand() {
  return (
    <section className="bg-primary py-14">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="font-display text-2xl font-bold text-white mb-2">Trusted by Speakers Worldwide</h2>
        <p className="text-white/70 mb-10 text-sm">Real results from real people who practice with TalkIQ.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="rounded-2xl bg-white/10 border border-white/20 py-6">
              <p className="font-display text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/70 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}