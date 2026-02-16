"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-bc-primary flex h-8 w-8 items-center justify-center rounded-lg shadow-md transition-transform hover:scale-105">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.9688 8.39062V8.39062V8.39062M6.51562 9.98438V9.98438V9.98438M13.4531 7.59375C12.1406 8.3125 10.9844 9.20312 9.98438 10.2656C8.98438 9.20312 7.82812 8.3125 6.51562 7.59375C6.60938 6.375 7 5.02344 7.6875 3.53906C8.375 2.05469 9.15625 0.875 10.0312 0C12.125 2.09375 13.2656 4.625 13.4531 7.59375V7.59375M0 7.96875C2.125 7.96875 4.0625 8.48438 5.8125 9.51562C7.5625 10.5469 8.95312 11.8594 9.98438 13.4531C11.0156 11.8594 12.4062 10.5469 14.1562 9.51562C15.9062 8.48438 17.8438 7.96875 19.9688 7.96875C19.9688 10.5938 19.2266 12.9531 17.7422 15.0469C16.2578 17.1406 14.3281 18.6094 11.9531 19.4531C11.4219 19.6406 10.7656 19.8125 9.98438 19.9688C9.32812 19.875 8.67188 19.7031 8.01562 19.4531C5.64062 18.6094 3.71094 17.1406 2.22656 15.0469C0.742188 12.9531 0 10.5938 0 7.96875V7.96875"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            BreatheClean
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            className="hover:text-bc-primary text-sm font-semibold transition-colors"
            href="/#how-it-works"
            onClick={(e) => handleClick(e, "how-it-works")}
          >
            How it Works
          </Link>
          <Link
            className="hover:text-bc-primary text-sm font-semibold transition-colors"
            href="/#mission"
            onClick={(e) => handleClick(e, "mission")}
          >
            Mission
          </Link>
          <Link
            className="hover:text-bc-primary text-sm font-semibold transition-colors"
            href="/#team"
            onClick={(e) => handleClick(e, "team")}
          >
            Team
          </Link>
          <Link
            className="rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-2.5 font-bold text-white shadow-[0_4px_0_0_#166534,0_6px_12px_rgba(0,0,0,0.15)] transition-all duration-150 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#166534,0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[3px] active:shadow-[0_1px_0_0_#166534,0_2px_4px_rgba(0,0,0,0.15)]"
            href="/login"
          >
            Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 transition-colors hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="dark:bg-bc-bg-dark/95 border-t border-slate-200 bg-white/95 shadow-xl backdrop-blur-md md:hidden dark:border-slate-800">
          <div className="flex flex-col space-y-4 px-6 py-4">
            <Link
              className="hover:text-bc-primary py-2 text-sm font-semibold transition-colors"
              href="/#how-it-works"
              onClick={(e) => handleClick(e, "how-it-works")}
            >
              How it Works
            </Link>
            <Link
              className="hover:text-bc-primary py-2 text-sm font-semibold transition-colors"
              href="/#mission"
              onClick={(e) => handleClick(e, "mission")}
            >
              Mission
            </Link>
            <Link
              className="hover:text-bc-primary py-2 text-sm font-semibold transition-colors"
              href="/#team"
              onClick={(e) => handleClick(e, "team")}
            >
              Team
            </Link>
            <Link
              className="rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-3 text-center font-bold text-white shadow-[0_4px_0_0_#166534,0_6px_12px_rgba(0,0,0,0.15)] transition-all duration-150 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#166534,0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[3px] active:shadow-[0_1px_0_0_#166534,0_2px_4px_rgba(0,0,0,0.15)]"
              href="/login"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
