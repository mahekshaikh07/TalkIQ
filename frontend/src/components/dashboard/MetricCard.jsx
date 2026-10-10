import { ArrowUp, ArrowDown, Minus } from "lucide-react";

function ChangeArrow({ change }) {
  if (!change) return null;
  if (change.direction === "same") {
    return (
      <span className="text-[#94A3B8]" title="Same as your previous session">
        <Minus size={16} />
      </span>
    );
  }
  const Arrow = change.direction === "up" ? ArrowUp : ArrowDown;
  const color = change.good ? "text-emerald-500" : "text-rose-500";
  return (
    <span className={color} title="Compared with your previous session">
      <Arrow size={16} />
    </span>
  );
}

export default function MetricCard({ icon, label, value, note, change }) {
  const Icon = icon;
  const missing = value === "Not available";

  return (
    <div className="glass rounded-2xl border border-white/45 bg-white/70 p-5 shadow-sm backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-[#94A3B8]">
        <span className="flex items-center gap-1.5 text-xs font-medium">
          <Icon size={14} />
          {label}
        </span>
        <ChangeArrow change={change} />
      </div>
      <p
        className={
          missing
            ? "text-base text-[#94A3B8]"
            : "font-display text-2xl font-semibold text-[#334155]"
        }
      >
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-[#94A3B8]">{note}</p> : null}
    </div>
  );
}