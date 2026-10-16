import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Mic, Users, History, User, Plus, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Speaking Practice", path: "/speaking/setup", icon: Mic },
  { label: "Debate Practice", path: "/debate/setup", icon: Users },
  { label: "History", path: "/history", icon: History },
  { label: "Profile", path: "/profile", icon: User },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/speaking/setup");
    onClose();
  };

  return (
    <>
      {/* Dark overlay, phones only */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-white p-4 transition-transform duration-200 lg:sticky lg:z-auto lg:h-screen lg:translate-x-0 lg:bg-white/70 lg:backdrop-blur-xl ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link to="/dashboard" onClick={onClose} className="font-display text-lg font-semibold text-[#334155]">
            Talk<span className="text-brand">IQ</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1F5F9] lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <button
          onClick={handleStart}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#334155] py-2.5 text-sm font-medium text-white transition hover:bg-[#1E293B]"
        >
          <Plus size={16} /> Start Practice
        </button>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-[#E2E8F0] font-medium text-[#334155]"
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
    </>
  );
}
