import Image from "next/image";

import {
  Bell,
  Cloud,
  MapPin,
  Navigation,
  Shield,
  Wind,
  Zap,
} from "lucide-react";

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

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50 py-24 dark:bg-slate-900/30"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="bg-bc-primary/10 text-bc-primary mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold">
            <span className="bg-bc-primary h-2 w-2 animate-pulse rounded-full" />
            Process
          </div>
          <h2 className="mb-6 text-3xl font-extrabold text-slate-900 md:text-5xl dark:text-white">
            Master Your <span className="text-bc-primary">Commute</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            A simple guide to finding the cleanest air for your journey. Plan,
            analyze, and breathe easier in just a few clicks.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="mb-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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

        {/* Visual Flow Section */}
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h3 className="mb-4 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
              Real-Time Data,{" "}
              <span className="text-bc-primary">Smarter Routes</span>
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We pull live air quality, weather, and traffic data along every
              route segment to give you an accurate Health Score before you step
              outside.
            </p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Data sources */}
            <div className="space-y-6">
              {[
                {
                  icon: Wind,
                  title: "Air Quality Index (AQI)",
                  description:
                    "Live AQI and PM2.5 readings sampled at multiple breakpoints along your route, powered by the AQICN network.",
                  color: "text-red-500",
                  bg: "bg-red-50 dark:bg-red-900/20",
                },
                {
                  icon: Cloud,
                  title: "Weather Conditions",
                  description:
                    "Real-time temperature, humidity, and wind data from OpenWeather to factor in how weather affects pollutant dispersion.",
                  color: "text-sky-500",
                  bg: "bg-sky-50 dark:bg-sky-900/20",
                },
                {
                  icon: Navigation,
                  title: "Traffic & Distance",
                  description:
                    "Mapbox-powered routing with live traffic data ensures your Health Score accounts for time spent in congested zones.",
                  color: "text-amber-500",
                  bg: "bg-amber-50 dark:bg-amber-900/20",
                },
                {
                  icon: Shield,
                  title: "Weighted Health Score",
                  description:
                    "Each route is scored using a weighted formula — 40% weather, 30% AQI, 30% traffic — so you always pick the cleanest path.",
                  color: "text-bc-primary",
                  bg: "bg-emerald-50 dark:bg-emerald-900/20",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="mb-1 font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* App preview */}
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-emerald-200/40 via-transparent to-sky-200/40 blur-2xl dark:from-emerald-900/20 dark:to-sky-900/20" />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <Image
                  src="/phone_ui.webp"
                  alt="BreathClean app showing route comparison with Health Scores"
                  width={400}
                  height={800}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
