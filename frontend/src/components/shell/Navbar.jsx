import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="glass sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-bold text-text">
          Talk<span className="text-brand">IQ</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-text/80 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-text">
              {l.label}
            </a>
          ))}
          <Link to="/login" className="transition-colors hover:text-text">
            Login
          </Link>
        </div>

        <div className="hidden md:block">
          <Link
            to="/signup"
            className="rounded-xl bg-text px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E293B]"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-3 px-6 pb-4 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close} className="text-sm font-medium text-text/80">
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={close} className="text-sm font-medium text-text/80">
            Login
          </Link>
          <Link
            to="/signup"
            onClick={close}
            className="rounded-xl bg-text px-5 py-2 text-center text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
