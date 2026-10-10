import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { TOOLTIP_STYLE, AXIS_TICK } from "./chartStyles";
import { COLORS } from "../../config/dashboardConfig";

export default function FillerBreakdownChart({ breakdown }) {
  const hasData = breakdown && typeof breakdown === "object";
  const data = hasData
    ? Object.keys(breakdown)
        .map(function (k) { return { word: k, count: breakdown[k] }; })
        .sort(function (a, b) { return b.count - a.count; })
    : [];

  return (
    <ChartCard
      title="Filler Word Breakdown"
      isEmpty={data.length === 0}
      emptyText={hasData ? "No filler words detected" : "Not available for this session."}
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis dataKey="word" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F1F5F9" }} />
          <Bar dataKey="count" name="Times used" fill={COLORS.speech} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}