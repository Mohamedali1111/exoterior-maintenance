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
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-start break-words">
            {t("phone")}: <a href="tel:+201055554291" dir="ltr" className="inline-block py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80" style={{ unicodeBidi: "isolate" }}>+20 10 55554291</a>
          </p>
          <p className="text-xs sm:text-sm text-start break-all">
            {t("whatsapp")}: <a href="https://wa.me/201055554291" target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-block py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80" style={{ unicodeBidi: "isolate" }}>+20 10 55554291</a>
          </p>
          <p className="text-xs sm:text-sm text-start break-all">
            {t("email")}: <a href="mailto:info@exoterior.org" dir="ltr" className="inline-block py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80" style={{ unicodeBidi: "isolate" }}>info@exoterior.org</a>
          </p>
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
