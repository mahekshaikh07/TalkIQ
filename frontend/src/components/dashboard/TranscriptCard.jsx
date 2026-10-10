import ChartCard from "./ChartCard";
import { splitTranscript } from "../../utils/dashboardHelpers";

export default function TranscriptCard({ transcript, fillerKeys }) {
  const parts = splitTranscript(transcript, fillerKeys);

  return (
    <ChartCard title="Your Transcript">
      {!transcript ? (
        <p className="text-sm text-[#94A3B8]">Transcript not available for this session.</p>
      ) : (
        <>
          <p className="text-sm leading-7 text-[#334155]">
            {parts.map(function (p, i) {
              return p.isFiller ? (
                <mark key={i} className="rounded bg-amber-200 px-1 text-amber-900">
                  {p.text}
                </mark>
              ) : (
                <span key={i}>{p.text}</span>
              );
            })}
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs text-[#94A3B8]">
            <mark className="rounded bg-amber-200 px-1 text-amber-900">um</mark>
            Highlighted = filler word
          </p>
        </>
      )}
    </ChartCard>
  );
}