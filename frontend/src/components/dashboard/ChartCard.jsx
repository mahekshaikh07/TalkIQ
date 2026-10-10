export default function ChartCard({ title, action, isEmpty, emptyText, children }) {
  return (
    <div className="glass min-w-0 rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-[#334155]">{title}</h2>
        {action}
      </div>
      {isEmpty ? (
        <div className="flex h-[240px] items-center justify-center text-center text-sm text-[#94A3B8]">
          {emptyText || "Not available yet."}
        </div>
      ) : (
        children
      )}
    </div>
  );
}