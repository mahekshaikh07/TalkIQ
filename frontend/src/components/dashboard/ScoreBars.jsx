import ChartCard from "./ChartCard";
import { isNum, fmt1, readableKey } from "../../utils/dashboardHelpers";

export default function ScoreBars({ scores, keys, color }) {
  return (
    <ChartCard
      title="Score Breakdown"
      isEmpty={!scores}
      emptyText="Not available for this session."
    >
      <div className="space-y-4">
        {keys.map(function (k) {
          const v = scores ? scores[k] : null;
          const has = isNum(v);
          return (
            <div key={k}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-[#334155]">{readableKey(k)}</span>
                <span className="font-semibold text-[#334155]">
                  {has ? fmt1(v) + "/10" : "Not available"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: has ? Math.max(0, Math.min(10, v)) * 10 + "%" : "0%",
                    background: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}