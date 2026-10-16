import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

export function ResultLoading() {
  return (
    <div className="glass flex items-center justify-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-12 text-sm text-[#64748B] shadow-sm">
      <Loader2 size={18} className="animate-spin" />
      Loading session...
    </div>
  );
}

export function ResultError({ message, onRetry }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-12 text-center shadow-sm">
      <AlertTriangle size={24} className="text-[#EF4444]" />
      <p className="font-medium text-[#334155]">Could not load this session</p>
      <p className="text-sm text-[#94A3B8]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-xl bg-[#334155] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
      >
        Try again
      </button>
    </div>
  );
}

export function ResultNotFound({ text, onBack }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl border border-white/45 bg-white/70 p-12 text-center shadow-sm">
      <AlertTriangle size={24} className="text-[#94A3B8]" />
      <p className="font-medium text-[#334155]">{text || "Session not found"}</p>
      <p className="text-sm text-[#94A3B8]">It may have been removed, or the link is wrong.</p>
      <button
        onClick={onBack}
        className="mt-2 flex items-center gap-2 rounded-xl bg-[#334155] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1E293B]"
      >
        <ArrowLeft size={14} />
        Go back
      </button>
    </div>
  );
}