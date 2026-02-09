"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { key: "services", href: "#services" },
  { key: "why", href: "#why" },
  { key: "how", href: "#how" },
  { key: "booking", href: "#booking" },
  { key: "faq", href: "#faq" },
  { key: "contact", href: "#footer" },
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md transition-shadow duration-300 hover:shadow-lg hover:shadow-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white sm:text-xl transition-colors duration-200 hover:text-red-400"
        >
          Exoterior
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden gap-4 md:flex lg:gap-6">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="relative text-sm font-medium text-neutral-400 transition-colors duration-200 hover:text-red-400 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:scale-x-0 after:bg-red-500 after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100"
              >
                {t(key)}
              </a>
            ))}
          </div>
          <Link
            href="/"
            locale={isAr ? "en" : "ar"}
            className="min-h-[44px] min-w-[44px] rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm font-medium text-neutral-300 transition-all duration-200 hover:border-neutral-500 hover:bg-neutral-700 hover:text-white"
          >
            {t("langSwitch")}
          </Link>
          <a
            href="#booking"
            className="min-h-[44px] shrink-0 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition-all duration-300 hover:scale-105 hover:bg-red-500 hover:shadow-red-500/25 active:scale-100 active:bg-red-700"
          >
            {t("booking")}
          </a>
        </div>
      </div>
    </nav>
  );
}
