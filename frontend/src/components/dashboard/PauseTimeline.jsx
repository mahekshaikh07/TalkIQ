import ChartCard from "./ChartCard";
import { COLORS, PAUSE_RED_LIMIT } from "../../config/dashboardConfig";
import { isNum, fmt1, fmtClock } from "../../utils/dashboardHelpers";

export default function PauseTimeline({ duration, pauses }) {
  const hasDuration = isNum(duration) && duration > 0;
  const list = Array.isArray(pauses)
    ? pauses.filter(function (p) {
        return p && isNum(p.start) && isNum(p.duration);
      })
    : null;

  return (
    <ChartCard title="Pause Timeline">
      {!list || !hasDuration ? (
        <p className="text-sm text-[#94A3B8]">Not available for this session.</p>
      ) : list.length === 0 ? (
        <p className="text-sm font-medium text-emerald-600">No long pauses. Great flow!</p>
      ) : (
        <>
          <div className="relative h-9 w-full rounded-lg bg-[#E2E8F0]">
            {list.map(function (p, i) {
              const left = (p.start / duration) * 100;
              const width = Math.max((p.duration / duration) * 100, 0.8);
              const isRed = p.duration >= PAUSE_RED_LIMIT;
              return (
                <div
                  key={i}
                  title={"Starts at " + fmtClock(p.start) + " - lasts " + fmt1(p.duration) + "s"}
                  className="absolute top-0 h-full cursor-help rounded-sm"
                  style={{
                    left: left + "%",
                    width: width + "%",
                    background: isRed ? COLORS.bad : COLORS.warn,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
            <span>0:00</span>
            <span>{fmtClock(duration / 2)}</span>
            <span>{fmtClock(duration)}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: COLORS.bad }} />
              {PAUSE_RED_LIMIT} seconds or longer
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: COLORS.warn }} />
              Shorter than {PAUSE_RED_LIMIT} seconds
            </span>
          </div>
        </>
      )}
    </ChartCard>
  );
}