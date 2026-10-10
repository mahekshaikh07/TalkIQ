import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Mic, Users, History, User, Plus } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Speaking Practice", path: "/speaking/setup", icon: Mic },
  { label: "Debate Practice", path: "/debate/setup", icon: Users },
  { label: "History", path: "/history", icon: History },
  { label: "Profile", path: "/profile", icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 shrink-0 border-r border-[#E2E8F0] bg-white/70 backdrop-blur-xl flex flex-col p-4">
      <div className="font-display text-lg font-semibold text-[#334155] mb-6 px-2">
        Talk<span className="text-[#94A3B8]">IQ</span>
      </div>

      <button
        onClick={() => navigate("/speaking/setup")}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#334155] text-white text-sm font-medium py-2.5 w-full hover:bg-[#1E293B] transition mb-6"
      >
        <Plus size={16} /> Start Practice
      </button>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-[#E2E8F0] text-[#334155] font-medium"
                  : "text-[#64748B] hover:bg-[#F1F5F9]"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}