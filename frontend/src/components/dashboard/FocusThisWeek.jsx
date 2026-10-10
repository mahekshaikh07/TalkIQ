import { Target, Lightbulb } from "lucide-react";
import { focusThisWeek, fmt1 } from "../../utils/dashboardHelpers";

export default function FocusThisWeek({ speech, debates }) {
  const focus = focusThisWeek(speech, debates);

  return (
    <div className="glass rounded-2xl border border-white/45 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <Target size={18} className="text-[#334155]" />
        <h2 className="font-display text-base font-semibold text-[#334155]">Focus This Week</h2>
      </div>

      {!focus ? (
        <p className="text-sm text-[#94A3B8]">Complete a few sessions to get a personal focus area.</p>
      ) : (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">Your weakest area right now</p>
            <p className="font-display text-2xl font-semibold text-[#334155]">{focus.name}</p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Average {fmt1(focus.average)}/10 in your last 5 {focus.type === "speech" ? "speeches" : "debates"}
            </p>
          </div>

          {focus.tip && (
            <div className="flex max-w-md items-start gap-3 rounded-xl bg-[#F1F5F9] p-4">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#EAB308]" />
              <div>
                <p className="text-xs font-medium text-[#64748B]">Tip from your latest session</p>
                <p className="mt-1 text-sm text-[#334155]">{focus.tip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}