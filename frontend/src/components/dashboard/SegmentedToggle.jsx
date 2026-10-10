export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="flex rounded-xl bg-[#E2E8F0] p-0.5">
      {options.map(function (o) {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={function () { onChange(o.value); }}
            className={
              "rounded-lg px-3 py-1 text-xs font-medium transition " +
              (active ? "bg-white text-[#334155] shadow-sm" : "text-[#64748B] hover:text-[#334155]")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}