import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="glass mt-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text/60 md:flex-row">
        <div className="text-center md:text-left">
          <p className="font-display font-semibold text-text">
            Talk<span className="text-brand">IQ</span>
          </p>
          <p className="mt-1">Practice speaking and debating with an AI coach.</p>
        </div>

        <div className="flex gap-6">
          <a href="#features" className="hover:text-text">Features</a>
          <a href="#how-it-works" className="hover:text-text">How it works</a>
          <Link to="/login" className="hover:text-text">Login</Link>
          <Link to="/signup" className="hover:text-text">Sign up</Link>
        </div>
      </div>
    </footer>
  );
}
