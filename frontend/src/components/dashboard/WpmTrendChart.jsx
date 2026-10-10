import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { TOOLTIP_STYLE, AXIS_TICK } from "./chartStyles";
import { COLORS, IDEAL_WPM_MIN, IDEAL_WPM_MAX } from "../../config/dashboardConfig";
import { wpmSeries } from "../../utils/dashboardHelpers";

export default function WpmTrendChart({ speech }) {
  const data = wpmSeries(speech);

  const labels = {};
  data.forEach(function (d) {
    labels[d.id] = d.date;
  });
  function label(id) {
    return labels[id] || "";
  }

  return (
    <ChartCard
      title="Speaking Speed Trend"
      isEmpty={data.length === 0}
      emptyText="No speaking speed data yet."
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
          <YAxis domain={[80, 200]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={label}
            formatter={function (v) { return [Number(v).toFixed(1) + " WPM", "Speed"]; }}
          />
          <ReferenceArea
            y1={IDEAL_WPM_MIN}
            y2={IDEAL_WPM_MAX}
            fill={COLORS.idealZone}
            fillOpacity={0.15}
            label={{ value: "Ideal", fill: COLORS.idealZone, fontSize: 11, position: "insideTopRight" }}
          />
          <Line type="monotone" dataKey="value" stroke={COLORS.speech} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}