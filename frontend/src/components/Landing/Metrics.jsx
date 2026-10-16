import { IDEAL_WPM_MIN, IDEAL_WPM_MAX } from "../../config/dashboardConfig";

const SPEECH_SCORES = [
  "Vocabulary",
  "Staying on topic",
  "Structuring your speech",
  "Critical thinking",
  "Confidence",
];

const DEBATE_SCORES = [
  "Argument strength",
  "Logical reasoning",
  "Answering counter-points",
  "Persuasiveness",
  "Critical thinking",
];

function ScoreList({ items }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-center justify-between border-b border-slate-200/70 pb-2 text-sm text-text">
          <span>{item}</span>
          <span className="text-xs text-text/50">out of 10</span>
        </li>
      ))}
    </ul>
  );
}

export default function Metrics() {
  return (
    <section id="metrics" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="font-display text-3xl font-bold">What we measure</h2>
        <p className="mt-3 text-text/60">
          Every score is out of 10, so you can compare one session with the next.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold">In a speech</h3>
          <ScoreList items={SPEECH_SCORES} />
          <p className="mt-5 text-sm text-text/60">
            We also track your pace in words per minute (a good range is {IDEAL_WPM_MIN} to{" "}
            {IDEAL_WPM_MAX}), your filler words per 100 words, and your pauses.
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold">In a debate</h3>
          <ScoreList items={DEBATE_SCORES} />
          <p className="mt-5 text-sm text-text/60">
            We also check how well each of your replies stays on the debate topic.
          </p>
        </div>
      </div>
    </section>
  );
}
