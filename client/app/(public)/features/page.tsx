import { Bell, MapPin, Navigation, Zap } from "lucide-react";

import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";

export default function FeaturesPage() {
  const steps = [
    {
      icon: MapPin,
      title: "Pick Your Path",
      description:
        "Start by selecting your starting location and destination. Whether it's a daily commute or a one-time trip, just enter the points and hit search.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Zap,
      title: "Smart Analysis",
      description:
        "Our system processes real-time data to offer 2-3 optimal routes across different transport modes. Each route gets a 'Health Score' based on AQI, PM2.5, traffic, and distance.",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      icon: Bell,
      title: "Gem Alerts",
      description:
        "Save your frequent routes. If the current air quality score beats your previous best, we'll send you a 'Gem Email'—letting you know the perfect time to leave.",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: Navigation,
      title: "Manage & Go",
      description:
        "Access your saved routes anytime. You can delete old paths, review details, or click 'Start' to begin your cleanest journey yet.",
      color: "text-bc-primary",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hero Section */}
        <section className="relative px-6 pt-32 pb-16 md:pt-48 md:pb-32">
          <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="bg-bc-primary/10 text-bc-primary mb-8 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold">
              <span className="bg-bc-primary h-2 w-2 animate-pulse rounded-full" />
              How it Works
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
              Master Your <span className="text-bc-primary">Commute</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-400">
              A simple guide to finding the cleanest air for your journey. Plan,
              analyze, and breathe easier in just a few clicks.
            </p>
          </div>

          {/* Background Gradients */}
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 opacity-30">
            <div className="from-bc-primary absolute inset-0 rounded-full bg-linear-to-tr to-blue-400 blur-[100px]" />
          </div>
        </section>

        {/* Steps Grid */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="group hover:shadow-bc-primary/5 relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div
                    className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>

                  {/* Decorative Number */}
                  <div className="absolute -right-4 -bottom-8 text-9xl font-black text-slate-50 opacity-0 transition-opacity select-none group-hover:opacity-10 dark:text-slate-800">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Flow Section */}
        <section className="bg-slate-50 px-6 py-24 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="mb-16 text-3xl font-bold text-slate-900 dark:text-white">
              Seamless Integration
            </h2>
            <div className="relative mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8 opacity-50">
                  <div className="animate-pulse rounded-xl bg-slate-200/50 dark:bg-slate-700/50"></div>
                  <div className="animate-pulse rounded-xl bg-slate-200/50 delay-75 dark:bg-slate-700/50"></div>
                  <div className="animate-pulse rounded-xl bg-slate-200/50 delay-150 dark:bg-slate-700/50"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-800">
                      <MapPin className="h-5 w-5 text-blue-500" />{" "}
                      <span className="text-sm font-bold">Start</span>
                    </div>
                    <div className="h-0.5 w-12 self-center bg-slate-300"></div>
                    <div className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-800">
                      <Navigation className="text-bc-primary h-5 w-5" />{" "}
                      <span className="text-sm font-bold">Finish</span>
                    </div>
                  </div>
                  <div className="bg-bc-primary shadow-bc-primary/20 flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold text-white shadow-lg">
                    <Zap className="h-4 w-4" /> Calculating Cleanest Route...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
