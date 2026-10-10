import { CheckCircle, XCircle, Info, X } from "lucide-react";

const STYLES = {
  success: { icon: CheckCircle, iconClass: "text-emerald-500" },
  error: { icon: XCircle, iconClass: "text-rose-500" },
  info: { icon: Info, iconClass: "text-primary" },
};

export default function Toast({ message, type = "info", onClose }) {
  const { icon: Icon, iconClass } = STYLES[type] || STYLES.info;

  return (
    <div className="glass flex min-w-[260px] items-center gap-3 rounded-xl px-4 py-3 shadow-lg animate-in fade-in slide-in-from-top-2">
      <Icon size={18} className={iconClass} />
      <p className="flex-1 text-sm text-text">{message}</p>
      <button onClick={onClose} className="text-text/40 hover:text-text" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}