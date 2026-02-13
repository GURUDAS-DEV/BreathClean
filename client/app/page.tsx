import type { Metadata } from "next";

import CTA from "@/components/landing/CTA";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";

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
      <CTA />
      <Footer />
    </>
  );
}
