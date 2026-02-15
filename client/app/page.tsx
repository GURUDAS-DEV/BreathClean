import type { Metadata } from "next";

import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Mission from "@/components/landing/Mission";
import Navbar from "@/components/landing/Navbar";
import Team from "@/components/landing/Team";
import Testimonials from "@/components/landing/Testimonials";

export const metadata: Metadata = {
  title: "BreatheClean — Breathe Easier on Every Journey",
  description:
    "Health-first route planning for urban commuters. Experience real-time air quality data and find the cleanest path on every journey. Join 100+ healthy commuters.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Mission />
      <Testimonials />
      <Team />
      <CTA />
      <Footer />
    </>
  );
}
