import Image from "next/image";
import Link from "next/link";

import {
  ExternalLink,
  Lock,
  MapPin,
  Navigation,
  PlayCircle,
} from "lucide-react";

export default function Hero() {
  return (
    <header className="bg-bc-bg-light dark:bg-bc-bg-dark relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      <div className="map-texture pointer-events-none absolute inset-0" />
      <div className="hero-gradient pointer-events-none absolute inset-0" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left content */}
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="bg-bc-primary h-2 w-2 animate-pulse rounded-full" />
            Live AQI Data Active
          </div>

          <h1 className="text-5xl leading-[1.1] font-extrabold text-slate-900 md:text-7xl dark:text-white">
            Breathe Easier on <span className="text-bc-primary">Every</span>{" "}
            Journey
          </h1>

          <p className="max-w-xl text-xl leading-relaxed text-slate-600 dark:text-slate-400">
            Health-first route planning for the urban commuter. Experience a
            powerful web tool designed for any browser—prioritizing your lungs
            with real-time air quality data.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="bg-bc-primary hover:shadow-bc-primary/30 flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white transition-all hover:shadow-xl active:scale-95"
            >
              Start Now <ExternalLink className="h-5 w-5" />
            </Link>
            <button className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-bold transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
              <PlayCircle className="h-5 w-5" /> Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              <Image
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDberzDCfqsIX6fDB8NDes-T6M3v1OQ_iJw-nuzucGxJBJP_pdXUFfBu-0NFqK2LTsO5mxmCHoorkypLbxOayus3TChvmB1h-1hg8IuQ9JJSkQ3Q95VtoRyadEJDhm2nYb9GeMlOg4CmZ3nBWXzoZWGFpOjB1pqMZH4QLvxuxy2GOMU7L1LWmEuv9TTOlGgvjUX-d4W8dHcWEhGckC4GxE-FW8u40JZGCW0FCV5IEsnkjC7O-0a_P5mBmmy7D-t3sanACFQ0c0NFdA4"
                width={40}
                height={40}
              />
              <Image
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO73IBTqivONDvIZQ_m_tKAXbYpjiXowWp8AJKxwRKW-X_4VNq6NxkJlgSGFzJaAbjeVssuTVGIkcMbAlUn5VA8W462ZoP9A3RMf34lxjiTRYCxX01Ud4Th7-HKAOqL1kmzApDvGH2MNuCvctkcq_A21ObSGET_dl-eeZob8cLKsFnJRTsil2RLxJvI9TNE6_rI4h5dV0CYPOt846EJbRziVnZlfCmEjU84V_N0opNUvO-r_I56AZyCgDkfjuR4D5z6JI5ZNy7FoE7"
                width={40}
                height={40}
              />
              <Image
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdb8aPPXygMIH6cItHFkIeQIjgnFPleeGp7ztJRHRqwcp5MDj0Cjl0vrjTxlWtafJ1750MIyR08J2Jk6V-_U3aKT3RSHKcqOofP2g203YgmYPRXaTzLJDttksWHDfQWZiZT7_0rVsQAl4WPFvE_adUzMJuirdaSXEDxIfXxx_xqSwGlXfZaZ4ic7S1paD4rSFTyDd4xXChXNq0uHIKF2p5hutevK-218dLMV41lm50AZvLFjsaif7UXmNwofvE96bvsxZpfzcZWJ7d"
                width={40}
                height={40}
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold dark:border-slate-900 dark:bg-slate-800">
                +100
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Joined by 100+ healthy commuters online
            </p>
          </div>
        </div>

        {/* Right - Map preview */}
        <div className="relative">
          <div className="bg-bc-primary/20 absolute -inset-4 rounded-[40px] opacity-30 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Browser chrome */}
            <div className="flex h-14 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-1 text-[10px] font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                <Lock className="h-3 w-3" />
                breathclean.dev
              </div>
              <div className="w-10" />
            </div>

            {/* Map content */}
            <div className="p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800">
                <Image
                  alt="Map interface background"
                  className="h-full w-full object-cover opacity-50"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjzTyQx-fPBBSOFMOiXqJbGHwy8VoJK-VumptPqFOn86n8xVqQdp_u6ZIkUcZEwRUf1Vb0mMO-sCfJjPRX5Pu25XfPbuo0aXBlaFJ71ChJp7wznVWUWZFX3Lwn7W9M25cnUIsAkdcFIa1ROkSB-gnGyyGX45Kg9gF3RK9-6uTrdhqHJEtoo3NB8gjP2E95ui0IaMC7X3DPhWlhfGrWdMt5C0j-9-uBTtiK_Tzu2ZKWBoVA9SExwuhgZVRjUWSEPKS1uRdGqEvI9BuY"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                <div className="absolute inset-0 flex flex-col space-y-4 p-6">
                  {/* Route discovery card */}
                  <div className="w-64 rounded-xl border border-slate-100 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 text-xs font-bold text-slate-400 uppercase">
                      Route Discovery
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div className="text-[10px] font-bold">
                          Sunset Blvd, 1202
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                        <Navigation className="text-bc-primary h-4 w-4" />
                        <div className="text-[10px] font-bold">
                          Grand Park Central
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cleanest path card */}
                  <div className="w-48 self-end rounded-xl border border-slate-100 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold">Cleanest Path</span>
                      <span className="text-bc-primary text-xs font-bold">
                        92/100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="bg-bc-primary h-full w-[92%] rounded-full" />
                    </div>
                    <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                      <span>18 min</span>
                      <span>2.4 km</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
