export default function Footer() {
  return (
    <footer className="glass mt-8">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-text/60">
        <p>© {new Date().getFullYear()} TalkIQ. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-text">Privacy</a>
          <a href="#" className="hover:text-text">Terms</a>
          <a href="#" className="hover:text-text">Contact</a>
        </div>
      </div>
    </footer>
  );
}