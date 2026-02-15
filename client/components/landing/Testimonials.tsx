import Image from "next/image";

import { Quote } from "lucide-react";

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

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="overflow-hidden bg-white py-24 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-6">
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
  );
}
