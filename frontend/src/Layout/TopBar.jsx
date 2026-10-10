import { Search, Bell } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-[#E2E8F0] bg-white/60 backdrop-blur-xl px-6 py-4">
      <div className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search practice sessions..."
          className="w-full rounded-lg border border-[#E2E8F0] bg-white/80 py-2 pl-9 pr-3 text-sm text-[#334155] placeholder:text-[#94A3B8] outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#CBD5E1]"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-[#64748B] hover:text-[#334155]">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-400" />
        </button>
        <div className="h-8 w-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-xs font-medium text-[#334155]">
          B
        </div>
      </div>
    </header>
  );
}