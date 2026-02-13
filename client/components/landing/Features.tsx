import { BarChart3, Radar, Route } from "lucide-react";

const features = [
  {
    icon: Radar,
    title: "Live AQI Tracking",
    description:
      "We analyze PM2.5 and Ozone levels in real-time from thousands of sensors to identify pollution hotspots across your browser.",
    bgColor: "bg-emerald-50 dark:bg-slate-900",
    borderColor: "border-emerald-100 dark:border-slate-800",
  },
  {
    icon: Route,
    title: "Health-Optimized Routes",
    description:
      "Our proprietary algorithm suggests routes that minimize exposure to harmful pollutants by up to 40% per trip, instantly accessible from any device.",
    bgColor: "bg-sky-50 dark:bg-slate-900",
    borderColor: "border-sky-100 dark:border-slate-800",
  },
  {
    icon: BarChart3,
    title: "Exposure Analytics",
    description:
      "Track your daily, weekly, and monthly air quality exposure trends through your personalized web dashboard.",
    bgColor: "bg-indigo-50 dark:bg-slate-900",
    borderColor: "border-indigo-100 dark:border-slate-800",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 dark:bg-slate-950/50" id="features">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="text-bc-primary mb-4 text-sm font-bold tracking-[0.2em] uppercase">
          Why BreatheClean?
        </h2>
        <h3 className="mb-16 text-3xl font-extrabold text-slate-900 md:text-5xl dark:text-white">
          Intelligence behind every breath
        </h3>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-[32px] p-8 ${feature.bgColor} border ${feature.borderColor} hover:border-bc-primary text-left transition-all duration-300`}
            >
              <div className="group-hover:bg-bc-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-all group-hover:text-white dark:bg-slate-800">
                <feature.icon className="h-7 w-7" />
              </div>
              <h4 className="mb-4 text-xl font-bold">{feature.title}</h4>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
