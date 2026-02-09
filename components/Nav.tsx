"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

const navLinks = [
  { key: "services", href: "#services" },
  { key: "how", href: "#how" },
  { key: "faq", href: "#faq" },
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md transition-shadow duration-300 hover:shadow-lg hover:shadow-black/20"
      dir={isAr ? "rtl" : "ltr"}
    >
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
          <div
            className="ms-6 me-6 flex rounded-full bg-neutral-800/80 p-0.5 ring-1 ring-neutral-700/80 md:ms-8 md:me-8"
            role="group"
            aria-label="Language"
          >
            <Link
              href="/"
              locale="en"
              className={`min-h-[36px] min-w-[44px] rounded-full px-3.5 py-2 text-center text-sm font-medium transition-all duration-200 ${
                !isAr
                  ? "bg-red-600 text-white shadow-inner"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              EN
            </Link>
            <Link
              href="/"
              locale="ar"
              className={`min-h-[36px] min-w-[44px] rounded-full px-3.5 py-2 text-center text-sm font-medium transition-all duration-200 ${
                isAr
                  ? "bg-red-600 text-white shadow-inner"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              AR
            </Link>
          </div>
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
