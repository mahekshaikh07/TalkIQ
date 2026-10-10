import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { TOOLTIP_STYLE, AXIS_TICK } from "./chartStyles";
import { COLORS, IDEAL_WPM_MIN, IDEAL_WPM_MAX } from "../../config/dashboardConfig";
import { isNum, fmtClock } from "../../utils/dashboardHelpers";

export default function PaceChart({ timeline }) {
  const data = Array.isArray(timeline)
    ? timeline.filter(function (t) {
        return t && isNum(t.start) && isNum(t.wpm);
      })
    : [];

  return (
    <ChartCard
      title="Pace Over Time"
      isEmpty={data.length === 0}
      emptyText="Not available for this session."
    >
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
          <XAxis
            dataKey="start"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={fmtClock}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <YAxis domain={[50, 220]} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={function (v) { return "At " + fmtClock(v); }}
            formatter={function (v) { return [Number(v).toFixed(1) + " WPM", "Pace"]; }}
          />
          <ReferenceArea
            y1={IDEAL_WPM_MIN}
            y2={IDEAL_WPM_MAX}
            fill={COLORS.idealZone}
            fillOpacity={0.15}
            label={{ value: "Ideal", fill: COLORS.idealZone, fontSize: 11, position: "insideTopRight" }}
          />
          <Line type="monotone" dataKey="wpm" stroke={COLORS.speech} strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}