import ChartCard from "./ChartCard";
import { COLORS } from "../../config/dashboardConfig";
import { buildHeatmap, heatColor } from "../../utils/dashboardHelpers";

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function tip(cell) {
  const date = cell.date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const n = cell.count;
  return date + ": " + n + (n === 1 ? " session" : " sessions");
}

export default function PracticeCalendar({ sessions }) {
  const weeks = buildHeatmap(sessions, 12);

  return (
    <ChartCard title="Practice Calendar">
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-1">
            {DAY_LABELS.map(function (label, i) {
              return (
                <div key={i} className="flex h-4 items-center text-[10px] text-[#94A3B8]">
                  {label}
                </div>
              );
            })}
          </div>

          {/* Week columns */}
          {weeks.map(function (week, wi) {
            return (
              <div key={wi} className="flex flex-col gap-1">
                {week.map(function (cell) {
                  if (cell.future) {
                    return <div key={cell.key} className="h-4 w-4" />;
                  }
                  return (
                    <div
                      key={cell.key}
                      title={tip(cell)}
                      className="h-4 w-4 rounded-[3px]"
                      style={{ background: heatColor(cell.count) }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1 text-[10px] text-[#94A3B8]">
        <span>Less</span>
        {COLORS.heat.map(function (c) {
          return <div key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />;
        })}
        <span>More</span>
      </div>
      <p className="mt-2 text-xs text-[#94A3B8]">Last 12 weeks - speeches and debates together</p>
    </ChartCard>
  );
}