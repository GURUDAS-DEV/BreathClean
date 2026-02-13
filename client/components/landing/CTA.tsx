import Image from "next/image";
import Link from "next/link";

import { Rocket } from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-bc-bg-light dark:bg-bc-bg-dark py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[48px] bg-slate-900 dark:bg-slate-800">
          <div className="bg-bc-primary pointer-events-none absolute inset-0 opacity-5" />

          <div className="grid items-center gap-12 p-12 md:p-20 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl leading-tight font-extrabold text-white md:text-5xl">
                Your lungs will thank you. Ready to switch?
              </h2>
              <p className="text-lg leading-relaxed text-slate-400">
                Join over 100+ active users who have already reduced their daily
                pollutant exposure. BreatheClean is a powerful, web-first
                platform accessible instantly from any browser—no downloads
                required.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="bg-bc-primary hover:shadow-bc-primary/40 flex w-fit items-center gap-3 rounded-full px-10 py-5 text-lg font-bold text-white transition-all hover:shadow-2xl active:scale-95"
                >
                  <Rocket className="h-5 w-5" /> Try the Web App
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="bg-bc-primary absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20 blur-[120px]" />
              <div className="rotate-2 rounded-2xl border border-slate-600 bg-slate-700/50 p-1.5 shadow-2xl transition-transform duration-500 hover:rotate-0">
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <div className="flex h-8 items-center gap-2 bg-slate-800 px-4">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-slate-600" />
                      <div className="h-2 w-2 rounded-full bg-slate-600" />
                      <div className="h-2 w-2 rounded-full bg-slate-600" />
                    </div>
                    <div className="mx-4 h-4 flex-1 rounded-md bg-slate-700" />
                  </div>
                  <Image
                    alt="Web Application Dashboard"
                    className="h-auto w-full opacity-90"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrOH9Pt8iPwhgUOhryCBcNqAv17vKjTWZDt4bm2PN5VnUnLJ6Un1hebaRnesSvmWVzl47b2TeoLOBeZf-f6STvwERjf-w0GQ7FfpkvzLh0ANtRQ_CWet3eRhTW_huLXLPLUIV8lPjRtQgu5vcUtTpfyQzN_hQesQU2Xf5V517YJfgnk6xPCD13_EnVk40wN8qbCcNG3_0wRHmgQxuzNbWx89LcEVlEB1b7EPwlU7lKmoroeWL90q8fqTctWm7muT54B2wMFzv5s1HV"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
