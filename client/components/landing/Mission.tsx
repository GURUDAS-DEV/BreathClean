import Image from "next/image";

import { Heart, Wind } from "lucide-react";

export default function Mission() {
  return (
    <section
      id="mission"
      className="relative overflow-hidden bg-white py-24 dark:bg-slate-950"
    >
      {/* Subtle Green Background Accent */}
      <div className="bg-bc-primary/5 absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/4 rounded-full blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Heart className="h-4 w-4 fill-current" />
            <span>Built for Healthier Lives</span>
          </div>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
            We&apos;re on a Mission to <br />
            <span className="text-bc-primary relative">
              Clean Up Your Commute
              <svg
                className="text-bc-primary/20 absolute -bottom-1 left-0 h-3 w-full"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-400">
            BreatheClean empowers urban commuters with real-time pollution data,
            helping you avoid harmful air and choose the healthiest path
            forward.
          </p>
        </div>

        {/* Story Content */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <div className="bg-bc-primary/10 absolute inset-0 scale-105 rotate-3 transform rounded-3xl"></div>
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div>
                <Image
                  src="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&q=80&w=1000"
                  alt="Fresh clean nature"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 flex items-end bg-linear-to-t from-slate-900/80 to-transparent p-8">
                <div className="text-white">
                  <div className="mb-2 flex items-center gap-2 font-bold text-emerald-400">
                    <Wind className="h-5 w-5" /> 92% Cleaner Air
                  </div>
                  <p className="font-medium text-slate-200">
                    Our routing algorithm avoids major pollution hotspots in
                    real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              Why We Started
            </h3>
            <div className="space-y-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Urban air pollution is one of the biggest health crises of our
                time. We realized that while we can&apos;t always control the
                air quality of our city, we <strong>can</strong> control our
                exposure to it.
              </p>
              <p>
                BreatheClean started as a simple idea: what if your maps app
                cared as much about your lungs as it did about your arrival
                time?
              </p>
              <p>
                Today, we&apos;re building the world&apos;s most advanced
                health-first navigation engine, powered by a passionate
                community of open-source contributors.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-bc-primary mb-1 text-3xl font-black">
                  3+
                </div>
                <div className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                  Contributors
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="text-bc-primary mb-1 text-3xl font-black">
                  100%
                </div>
                <div className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                  Open Source
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
