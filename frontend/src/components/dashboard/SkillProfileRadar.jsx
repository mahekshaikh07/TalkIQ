import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import SegmentedToggle from "./SegmentedToggle";
import { TOOLTIP_STYLE } from "./chartStyles";
import { COLORS } from "../../config/dashboardConfig";
import { skillProfileData, SPEECH_SCORE_KEYS, DEBATE_SCORE_KEYS } from "../../utils/dashboardHelpers";

const OPTIONS = [
  { value: "speech", label: "Speech" },
  { value: "debate", label: "Debate" },
];

export default function SkillProfileRadar({ speech, debates }) {
  const [type, setType] = useState("speech");
  const sessions = type === "speech" ? speech : debates;
  const keys = type === "speech" ? SPEECH_SCORE_KEYS : DEBATE_SCORE_KEYS;
  const result = skillProfileData(sessions, keys);
  const color = type === "speech" ? COLORS.speech : COLORS.debate;

  return (
    <ChartCard
      title="Your Skill Profile"
      action={<SegmentedToggle options={OPTIONS} value={type} onChange={setType} />}
      isEmpty={result.data.length === 0}
      emptyText="No sessions of this type yet."
    >
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={result.data} outerRadius="68%">
          <PolarGrid stroke={COLORS.border} />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "#64748B", fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
          {result.showFirst && (
            <Radar
              name="First 3 sessions"
              dataKey="first"
              stroke={COLORS.muted}
              fill={COLORS.muted}
              fillOpacity={0.25}
            />
          )}
          <Radar
            name="Latest 3 sessions"
            dataKey="latest"
            stroke={color}
            fill={color}
            fillOpacity={0.35}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}