import { isNum, fmt1 } from "../../utils/dashboardHelpers";

export default function ScoreRing({ value }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const v = isNum(value) ? Math.max(0, Math.min(10, value)) : 0;
  const offset = circumference - (v / 10) * circumference;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
      <circle cx="48" cy="48" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
      <circle
        cx="48"
        cy="48"
        r={radius}
        fill="none"
        stroke="#334155"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
      />
      <text
        x="48"
        y="48"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#334155"
        fontSize="24"
        fontWeight="600"
        fontFamily="Sora, sans-serif"
      >
        {fmt1(value, "-")}
      </text>
    </svg>
  );
}