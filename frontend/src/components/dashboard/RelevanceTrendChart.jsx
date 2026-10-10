import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { TOOLTIP_STYLE, AXIS_TICK } from "./chartStyles";
import { COLORS } from "../../config/dashboardConfig";
import { relevanceSeries } from "../../utils/dashboardHelpers";

export default function RelevanceTrendChart({ debates }) {
  const data = relevanceSeries(debates);

  const labels = {};
  data.forEach(function (d) {
    labels[d.id] = d.date;
  });
  function label(id) {
    return labels[id] || "";
  }

  return (
    <ChartCard
      title="Rebuttal Relevance Trend"
      isEmpty={data.length === 0}
      emptyText="Complete a debate to see your rebuttal relevance."
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
          <YAxis
            domain={[0, 100]}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickFormatter={function (v) { return v + "%"; }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={label}
            formatter={function (v) { return [Math.round(v) + "%", "Relevance"]; }}
          />
          <Line type="monotone" dataKey="value" stroke={COLORS.debate} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}