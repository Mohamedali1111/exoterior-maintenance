"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LOGO_SRC } from "@/lib/constants";

const navLinks = [
  { key: "services", href: "#services" },
  { key: "how", href: "#how" },
] as const;

export default function Nav() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-neutral-600/40 bg-neutral-950/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/85"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1.5 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3.5">
        <Link
          href="/"
          className="min-h-[40px] min-w-[40px] flex items-center transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          aria-label="Exoterior – Home"
        >
          <Image
            src={LOGO_SRC}
            alt="Exoterior"
            width={160}
            height={44}
            className="h-8 w-auto object-contain sm:h-10"
            priority
          />
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
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
            className="flex rounded-full bg-neutral-800/90 p-0.5 ring-1 ring-neutral-600/50 ms-2 me-2 sm:ms-6 sm:me-6 md:ms-8 md:me-8"
            role="group"
            aria-label={isAr ? "اللغة" : "Language"}
          >
            <Link
              href="/"
              locale="en"
              className={`flex min-h-[38px] min-w-[42px] sm:min-h-[40px] sm:min-w-[48px] items-center justify-center rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                !isAr
                  ? "bg-red-600 text-white shadow-inner ring-1 ring-red-500/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
              aria-current={!isAr ? "true" : undefined}
            >
              {isAr ? t("langSwitch") : "EN"}
            </Link>
            <Link
              href="/"
              locale="ar"
              className={`flex min-h-[38px] min-w-[42px] sm:min-h-[40px] sm:min-w-[48px] items-center justify-center rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                isAr
                  ? "bg-red-600 text-white shadow-inner ring-1 ring-red-500/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
              aria-current={isAr ? "true" : undefined}
              title={isAr ? undefined : "العربية"}
            >
              ع
            </Link>
          </div>
          <a
            href="#booking"
            className="flex min-h-[38px] shrink-0 touch-manipulation items-center justify-center rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-500 active:scale-[0.98] active:bg-red-700 sm:min-h-[44px] sm:min-w-[44px] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            {t("booking")}
          </a>
        </div>
      </div>
    </nav>
  );
}
