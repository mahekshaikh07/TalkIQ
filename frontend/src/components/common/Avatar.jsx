const COLORS = [
  "bg-rose-400",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-violet-400",
  "bg-pink-400",
];

function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Same name always gives the same color
function getColor(name) {
  let sum = 0;
  for (const ch of name || "") sum += ch.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}

export default function Avatar({ name, size = "w-9 h-9", textSize = "text-sm", className = "" }) {
  return (
    <div
      className={`${size} ${textSize} ${getColor(name)} ${className} flex select-none items-center justify-center rounded-full border-2 border-white font-semibold text-white shadow-sm`}
      aria-label={name || "User"}
    >
      {getInitials(name)}
    </div>
  );
}
