"use client";

import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const isAr = useLocale() === "ar";

  return (
    <footer id="footer" className="scroll-mt-20 border-t-4 border-red-600 bg-black px-3 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-neutral-300 sm:px-6 sm:py-12" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:justify-between sm:gap-8 text-start min-w-0">
        <div className="w-full min-w-0 sm:w-auto">
          <p className="font-semibold text-white text-sm sm:text-base">{t("contact")}</p>
          <div className="mt-2 sm:mt-3 flex flex-col gap-1.5 text-xs sm:text-sm">
            {/* WhatsApp chat – icon + number */}
            <a
              href="https://wa.me/201024545059"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 text-red-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 2a10 10 0 0 0-8.94 14.56L2 22l5.6-1.02A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.86 12.21 1 1 0 0 0-.11.8l.7 2.45-2.5-.67a1 1 0 0 0-.8.12A8 8 0 1 1 12 4Zm-3 3.5a1 1 0 0 0-.94.63 6 6 0 0 0 .53 5.44c.7 1.1 1.74 2.1 3.02 2.86 1.28.76 2.55 1.17 3.7 1.17a1 1 0 0 0 .9-.55l.5-1a1 1 0 0 0-.24-1.2l-1.1-.9a1 1 0 0 0-1.14-.1l-.8.47c-.36-.2-.86-.52-1.33-.99-.47-.47-.8-.96-1.01-1.34l.48-.8a1 1 0 0 0-.12-1.14l-.9-1.1A1 1 0 0 0 9 7.5Z" />
                </svg>
              </span>
              <span
                dir="ltr"
                className="font-medium"
                style={{ unicodeBidi: "isolate" }}
              >
                +20 10 2454 5059
              </span>
              <span className="sr-only">{t("whatsapp")}</span>
            </a>
            {/* Email – icon + address */}
            <a
              href="mailto:info@exoterior.org"
              className="inline-flex items-center gap-2 py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 text-red-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7.5 12 13l9-5.5" />
                </svg>
              </span>
              <span
                dir="ltr"
                className="font-medium break-all"
                style={{ unicodeBidi: "isolate" }}
              >
                info@exoterior.org
              </span>
              <span className="sr-only">{t("email")}</span>
            </a>
          </div>
        </div>
        <div className="w-full min-w-0 sm:w-auto">
          <p className="font-semibold text-white text-sm sm:text-base">{t("links")}</p>
          <div className="mt-2 sm:mt-3 flex flex-col items-start gap-1 text-xs sm:text-sm">
            <a href="#services" className="min-h-[40px] flex items-center py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80">{tNav("services")}</a>
            <a href="#booking" className="min-h-[40px] flex items-center py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80">{tNav("booking")}</a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-6 sm:mt-8 max-w-5xl border-t border-white/[0.06] pt-6 sm:pt-8 text-center text-xs sm:text-sm text-neutral-500 min-w-0 px-2">
        © Exoterior. {t("rights")}
      </p>
    </footer>
  );
}
