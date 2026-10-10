import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { TOOLTIP_STYLE, AXIS_TICK } from "./chartStyles";
import { COLORS, FILLER_GOAL } from "../../config/dashboardConfig";
import { fillerSeries } from "../../utils/dashboardHelpers";

export default function FillerTrendChart({ speech }) {
  const data = fillerSeries(speech);

  const labels = {};
  data.forEach(function (d) {
    labels[d.id] = d.date;
  });
  function label(id) {
    return labels[id] || "";
  }

  return (
    <ChartCard
      title="Filler Words Trend"
      isEmpty={data.length === 0}
      emptyText="No filler word data yet."
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
          <YAxis domain={[0, "auto"]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={label}
            formatter={function (v) { return [Number(v).toFixed(1) + " per 100 words", "Fillers"]; }}
          />
          <ReferenceLine
            y={FILLER_GOAL}
            stroke={COLORS.goal}
            strokeDasharray="5 5"
            label={{ value: "Goal", fill: COLORS.goal, fontSize: 11, position: "insideTopRight" }}
          />
          <Line type="monotone" dataKey="value" stroke={COLORS.speech} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}