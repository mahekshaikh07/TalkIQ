import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const links = ["Features", "About"];

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="font-display font-bold text-lg text-text">
          Talk<span className="text-primary">IQ</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text/80">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-text transition-colors">
              {l}
            </a>
          ))}
          <Link to="/login" className="hover:text-text transition-colors">Login</Link>
        </div>

        <div className="hidden md:block">
          <Link
            to="/signup"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-text/80">
              {l}
            </a>
          ))}
          <Link to="/login" className="text-sm font-medium text-text/80">Login</Link>
          <Link to="/signup" className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white text-center">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}