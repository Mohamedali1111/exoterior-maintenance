"use client";

import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const isAr = useLocale() === "ar";

  return (
    <footer id="footer" className="scroll-mt-20 border-t-4 border-red-600 bg-black px-4 pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] text-neutral-300 sm:px-6 sm:py-12" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between text-start">
        <div className="w-full sm:w-auto">
          <p className="font-semibold text-white">{t("contact")}</p>
          <p className="mt-3 text-sm text-start">
            {t("phone")}: <a href="tel:+200000000000" dir="ltr" className="inline-block py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80" style={{ unicodeBidi: "isolate" }}>+20 000 000 0000</a>
          </p>
          <p className="text-sm text-start">
            {t("whatsapp")}: <a href="https://wa.me/200000000000" target="_blank" rel="noopener noreferrer" dir="ltr" className="inline-block py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80" style={{ unicodeBidi: "isolate" }}>+20 000 000 0000</a>
          </p>
          <p className="text-sm text-start">
            {t("email")}: <a href="mailto:info@exoterior.org" dir="ltr" className="inline-block py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80" style={{ unicodeBidi: "isolate" }}>info@exoterior.com</a>
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <p className="font-semibold text-white">{t("links")}</p>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm">
            <a href="#services" className="min-h-[44px] flex items-center py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80">{tNav("services")}</a>
            <a href="#booking" className="min-h-[44px] flex items-center py-1 transition-colors duration-200 hover:text-red-400 active:opacity-80">{tNav("booking")}</a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl border-t border-white/[0.06] pt-8 text-center text-sm text-neutral-500">
        © Exoterior. {t("rights")}
      </p>
    </footer>
  );
}
