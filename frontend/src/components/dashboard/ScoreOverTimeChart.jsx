import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import SegmentedToggle from "./SegmentedToggle";
import { TOOLTIP_STYLE, AXIS_TICK } from "./chartStyles";
import { COLORS } from "../../config/dashboardConfig";
import { scoreSeries } from "../../utils/dashboardHelpers";

const OPTIONS = [
  { value: "speech", label: "Speech" },
  { value: "debate", label: "Debate" },
];

export default function ScoreOverTimeChart({ speech, debates }) {
  const [type, setType] = useState("speech");
  const data = scoreSeries(type === "speech" ? speech : debates);
  const color = type === "speech" ? COLORS.speech : COLORS.debate;

  const labels = {};
  data.forEach(function (d) {
    labels[d.id] = d.date;
  });
  function label(id) {
    return labels[id] || "";
  }

  return (
    <ChartCard
      title="Score Over Time"
      action={<SegmentedToggle options={OPTIONS} value={type} onChange={setType} />}
      isEmpty={data.length === 0}
      emptyText="No scored sessions of this type yet."
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis
            dataKey="id"
            tickFormatter={label}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis domain={[0, 10]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={label}
            formatter={function (v) { return [Number(v).toFixed(1) + "/10", "Score"]; }}
          />
          <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}