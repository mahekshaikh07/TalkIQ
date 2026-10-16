import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getPasswordStrength } from "../../utils/validators";

export function Field({ label, icon: Icon, error, type = "text", className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const id = props.id || props.name;
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-text">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text/35"
          />
        )}
        <input
          id={id}
          type={inputType}
          className={`w-full rounded-xl border bg-white/70 py-2.5 text-sm text-text outline-none transition-all placeholder:text-text/35 focus:border-primary focus:ring-4 focus:ring-primary/15 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${isPassword ? "pr-10" : "pr-3.5"} ${error ? "border-rose-400" : "border-slate-200"}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text/35 transition-colors hover:text-text/60"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function PasswordStrengthMeter({ password }) {
  if (!password) return null;
  const { percent, label, barClass } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-xs text-text/50">
        <span>Password strength</span>
        <span className="font-medium text-text/70">{label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
