import { Menu } from "lucide-react";
import UserMenu from "../common/UserMenu";

export default function TopBar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex items-center border-b border-[#E2E8F0] bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
