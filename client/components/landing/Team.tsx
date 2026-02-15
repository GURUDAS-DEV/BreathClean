import Image from "next/image";
import Link from "next/link";

import { Github } from "lucide-react";

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

export default function Team() {
  return (
    <section id="team" className="bg-slate-50 py-24 dark:bg-slate-900/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
            Meet the Builders
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
            The talented developers dedicating their time to making breathable
            air accessible for everyone.
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
  );
}
