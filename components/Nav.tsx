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
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/80"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link
          href="/"
          className="min-h-[44px] min-w-[44px] flex items-center text-lg font-bold tracking-tight text-white sm:text-xl transition-colors duration-200 hover:text-red-400 active:opacity-80"
        >
          Exoterior
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-4">
          <div className="hidden gap-1 md:flex lg:gap-6">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-sm font-medium text-neutral-400 transition-colors duration-200 hover:text-red-400 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:scale-x-0 after:bg-red-500 after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100"
              >
                {t(key)}
              </a>
            ))}
          </div>
          <div
            className="flex rounded-full bg-neutral-800/90 p-0.5 ring-1 ring-neutral-600/50 ms-4 me-4 sm:ms-6 sm:me-6 md:ms-8 md:me-8"
            role="group"
            aria-label="Language"
          >
            <Link
              href="/"
              locale="en"
              className={`flex min-h-[40px] min-w-[44px] items-center justify-center rounded-full px-3.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
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
              className={`flex min-h-[40px] min-w-[44px] items-center justify-center rounded-full px-3.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
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
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-950/40 transition-all duration-200 hover:bg-red-500 active:scale-[0.98] active:bg-red-700 sm:min-w-0 sm:px-5"
          >
            {t("booking")}
          </a>
        </div>
      </div>
    </nav>
  );
}
