import Hero from "../components/Landing/Hero";
import Features from "../components/Landing/Features";
import About from "../components/Landing/About";
import ProcessSteps from "../components/Landing/ProcessSteps";
import TrustBand from "../components/Landing/TrustBand";
import Testimonials from "../components/Landing/Testimonials";

export default function Landing() {
  return (
    <>
      <Hero />
      <Features />
      <About />
      <ProcessSteps />
      <TrustBand />
      <Testimonials />
    </>
  );
}