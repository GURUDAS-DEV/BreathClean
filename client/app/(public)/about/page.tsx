import Image from "next/image";
import Link from "next/link";

import { Github, Heart, Quote, Wind } from "lucide-react";

import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";

const contributors = [
  {
    username: "xevrion",
    role: "Contributor",
    github: "https://github.com/xevrion",
    avatar: "https://github.com/xevrion.png",
    bio: "Full-stack enthusiast focused on creating intuitive user experiences and optimization.",
  },
  {
    username: "GURUDAS-DEV",
    role: "Contributor",
    github: "https://github.com/GURUDAS-DEV",
    avatar: "https://github.com/GURUDAS-DEV.png",
    bio: "Passionate about building scalable web applications and solving real-world problems through code.",
  },
  {
    username: "kaihere14",
    role: "Contributor",
    github: "https://github.com/kaihere14",
    avatar:
      "https://res.cloudinary.com/dw87upoot/image/upload/v1771141688/Screenshot_2026-02-15_at_1.17.55_PM_om6bjv.png",
    bio: "Backend developer interested in system design, authentication, data modeling, and building reliable services",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Daily Commuter",
    content:
      "BreatheClean has completely changed how I get to work. I used to arrive feeling congested, but now I take the cleanest route and feel energized.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    name: "Marcus Johnson",
    role: "Cyclist",
    content:
      "As someone who bikes everywhere, knowing the air quality along my route is game-changing. The 'Gem Alerts' are my favorite feature!",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    name: "Dr. Emily Alpert",
    role: "Environmental Scientist",
    content:
      "Finally, a tool that makes complex air quality data accessible and actionable for the average person. A massive step forward for public health.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
          {/* Subtle Green Background Accent */}
          <div className="bg-bc-primary/5 absolute top-0 right-0 -z-10 h-[600px] w-[600px] translate-x-1/2 -translate-y-1/4 rounded-full blur-[120px]" />

          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Heart className="h-4 w-4 fill-current" />
              <span>Built for Healthier Lives</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl dark:text-white">
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
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600 dark:text-slate-400">
              BreatheClean empowers urban commuters with real-time pollution
              data, helping you avoid harmful air and choose the healthiest path
              forward.
            </p>
          </div>
        </section>

        {/* Story / Mission Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
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
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Why We Started
                </h2>
                <div className="space-y-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  <p>
                    Urban air pollution is one of the biggest health crises of
                    our time. We realized that while we can&apos;t always
                    control the air quality of our city, we <strong>can</strong>{" "}
                    control our exposure to it.
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

        {/* Contributors Section */}
        <section className="bg-slate-50 py-24 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
                Meet the Builders
              </h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
                The talented developers dedicating their time to making
                breathable air accessible for everyone.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {contributors.map((member) => (
                <div
                  key={member.username}
                  className="group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="absolute inset-x-0 top-0 h-24 rounded-t-3xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"></div>

                  <div className="relative mt-8 flex flex-col items-center text-center">
                    <div className="relative mb-4 rounded-full bg-white p-1 dark:bg-slate-900">
                      <div className="h-24 w-24 overflow-hidden rounded-full">
                        <Image
                          src={member.avatar}
                          alt={member.username}
                          width={100}
                          height={100}
                          className="rounded-full shadow-lg"
                        />
                      </div>
                      <div className="bg-bc-primary absolute right-0 bottom-0 rounded-full border-2 border-white p-1.5 dark:border-slate-900">
                        <Github className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {member.username}
                    </h3>
                    <div className="text-bc-primary mb-4 text-sm font-semibold">
                      {member.role}
                    </div>
                    <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {member.bio}
                    </p>

                    <div className="mt-auto flex gap-3">
                      <Link
                        href={member.github}
                        target="_blank"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-2 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      >
                        <Github className="h-4 w-4" /> Github
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="https://github.com/kaihere14/BreathClean"
                className="text-bc-primary inline-flex items-center gap-2 font-bold hover:underline"
              >
                Want to contribute? Check out our repository{" "}
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="overflow-hidden px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-16 text-center text-3xl font-bold text-slate-900 dark:text-white">
              Community Stories
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <Quote className="text-bc-primary/20 absolute top-8 left-8 h-8 w-8" />
                  <p className="relative z-10 mb-8 pt-6 leading-relaxed text-slate-600 italic dark:text-slate-300">
                    &quot;{t.content}&quot;
                  </p>
                  <div className="flex items-center gap-4">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="rounded-full bg-slate-200 object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {t.name}
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase">
                        {t.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="bg-bc-primary/5 border-bc-primary/10 dark:bg-bc-primary/10 mx-auto max-w-5xl rounded-[3rem] border p-12 text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">
              Join the Movement for{" "}
              <span className="text-bc-primary">Clean Air</span>
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-lg text-slate-600 dark:text-slate-400">
              Your health shouldn&apos;t be a guessing game. Start planning your
              safe route today.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="bg-bc-primary hover:shadow-bc-primary/30 rounded-full px-8 py-4 text-lg font-bold text-white transition-all hover:shadow-xl active:scale-95"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
