import { Link } from "react-router-dom";
import Hero from "../components/Landing/Hero";
import Features from "../components/Landing/Features";
import Metrics from "../components/Landing/Metrics";
import ProcessSteps from "../components/Landing/ProcessSteps";
import About from "../components/Landing/About";

export default function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <Metrics />
      <ProcessSteps />
      <About />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-4">
        <div className="glass rounded-3xl px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Ready for your first session?</h2>
          <p className="mx-auto mt-3 max-w-md text-text/60">
            Create an account, pick a topic, and see your first report in a few minutes.
          </p>
          <Link
            to="/signup"
            className="mt-6 inline-block rounded-xl bg-text px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E293B]"
          >
            Create a free account
          </Link>
        </div>
      </section>
    </>
  );
}
