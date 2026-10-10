import { Check, TrendingUp } from "lucide-react";

function ListCard({ title, icon, items, tone }) {
  const Icon = icon;
  const styles =
    tone === "green"
      ? { card: "border-emerald-100 bg-emerald-50/70", head: "text-emerald-700", dot: "text-emerald-500" }
      : { card: "border-orange-100 bg-orange-50/70", head: "text-orange-700", dot: "text-orange-500" };
  const list = Array.isArray(items) ? items : [];

  return (
    <div className={"rounded-2xl border p-6 shadow-sm " + styles.card}>
      <h2 className={"mb-4 flex items-center gap-2 font-display text-base font-semibold " + styles.head}>
        <Icon size={18} />
        {title}
      </h2>
      {list.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">Not available for this session.</p>
      ) : (
        <ul className="space-y-2.5">
          {list.map(function (item, i) {
            return (
              <li key={i} className="flex items-start gap-2 text-sm text-[#334155]">
                <Icon size={14} className={"mt-1 shrink-0 " + styles.dot} />
                <span>{item}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function StrengthsImprovements({ strengths, improvements }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ListCard title="Strengths" icon={Check} items={strengths} tone="green" />
      <ListCard title="Improvements" icon={TrendingUp} items={improvements} tone="orange" />
    </div>
  );
}